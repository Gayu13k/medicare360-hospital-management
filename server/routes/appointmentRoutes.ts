import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { Appointment, AppointmentStatus, AuditLog, NotificationItem } from '../../src/types';

const router = Router();

// Helper to format date YYYY-MM-DD
function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/appointments
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  let list = db.appointments;

  const { patientId, doctorId, status, date } = req.query;

  // Patient restriction
  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (patientProfile) {
      list = list.filter((a) => a.patientId === patientProfile.id);
    } else {
      return res.json({ success: true, data: [] });
    }
  } else if (req.user!.role === 'DOCTOR') {
    const doctorProfile = db.doctors.find((d) => d.userId === req.user!.id);
    if (doctorProfile) {
      list = list.filter((a) => a.doctorId === doctorProfile.id);
    }
  }

  if (patientId && typeof patientId === 'string') {
    list = list.filter((a) => a.patientId === patientId);
  }
  if (doctorId && typeof doctorId === 'string') {
    list = list.filter((a) => a.doctorId === doctorId);
  }
  if (status && typeof status === 'string') {
    list = list.filter((a) => a.status === status);
  }
  if (date && typeof date === 'string') {
    list = list.filter((a) => a.appointmentDate === date);
  }

  // Sort by date/time
  list.sort((a, b) => {
    const d1 = `${a.appointmentDate} ${a.appointmentTime}`;
    const d2 = `${b.appointmentDate} ${b.appointmentTime}`;
    return d2.localeCompare(d1);
  });

  return res.json({ success: true, data: list });
});

// GET /api/appointments/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const apt = db.appointments.find((a) => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }
  return res.json({ success: true, data: apt });
});

// POST /api/appointments (Book appointment)
router.post('/', authenticate, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  let { patientId, doctorId, departmentId, appointmentDate, appointmentTime, reason } = req.body;

  // Determine patientId if not provided or if booked by patient user
  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile) {
      return res.status(400).json({ success: false, message: 'Patient profile not found' });
    }
    patientId = patientProfile.id;
  }

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({
      success: false,
      message: 'Patient, Doctor, Appointment Date, and Time are required',
    });
  }

  // 1. Prevent booking past dates
  const today = getTodayStr();
  if (appointmentDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Cannot book appointments for past dates',
    });
  }

  // 2. Prevent booking past times for today
  if (appointmentDate === today) {
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (appointmentTime < currentHM) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointment for a past time slot today',
      });
    }
  }

  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  if (!doctor.available) {
    return res.status(400).json({ success: false, message: 'Doctor is currently unavailable' });
  }

  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient profile not found' });
  }

  const department = db.departments.find((d) => d.id === (departmentId || doctor.departmentId));

  // 3. Prevent double active booking (same patient + same doctor + same date)
  const existingActive = db.appointments.find(
    (a) =>
      a.patientId === patientId &&
      a.doctorId === doctorId &&
      a.appointmentDate === appointmentDate &&
      ['PENDING', 'APPROVED', 'IN_PROGRESS'].includes(a.status)
  );

  if (existingActive) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active appointment with this doctor on the selected date',
    });
  }

  // 4. Calculate unique token number for this doctor on this day
  const docAppointmentsToday = db.appointments.filter(
    (a) => a.doctorId === doctorId && a.appointmentDate === appointmentDate
  );

  let maxToken = 0;
  for (const a of docAppointmentsToday) {
    if (a.tokenNumber > maxToken) maxToken = a.tokenNumber;
  }
  const newTokenNumber = maxToken + 1;

  const aptId = `apt-${Date.now()}`;
  const newAppointment: Appointment = {
    id: aptId,
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialization: doctor.specialization,
    departmentId: department ? department.id : doctor.departmentId,
    departmentName: department ? department.name : doctor.departmentName || 'General',
    appointmentDate,
    appointmentTime,
    tokenNumber: newTokenNumber,
    status: 'APPROVED', // Default approved so it enters live queue
    reason: reason || 'General Consultation',
    consultationFee: doctor.consultationFee,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.appointments.push(newAppointment);

  // Send Notification to Patient User
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: patient.userId,
    title: 'Appointment Booked Successfully',
    message: `Your appointment with ${doctor.name} is scheduled for ${appointmentDate} at ${appointmentTime}. Token #${newTokenNumber}.`,
    type: 'APPOINTMENT',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Log audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'BOOK_APPOINTMENT',
    entityType: 'APPOINTMENT',
    entityId: aptId,
    timestamp: new Date().toISOString(),
    details: `Booked appointment for ${patient.name} with ${doctor.name} (Token #${newTokenNumber})`,
  });

  saveDatabase();

  return res.status(201).json({
    success: true,
    message: `Appointment booked! Your Token Number is #${newTokenNumber}`,
    data: newAppointment,
  });
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const db = getDb();
  const apt = db.appointments.find((a) => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  const allowedStatuses: AppointmentStatus[] = [
    'PENDING',
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment status' });
  }

  apt.status = status;
  apt.updatedAt = new Date().toISOString();

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'UPDATE_APPOINTMENT_STATUS',
    entityType: 'APPOINTMENT',
    entityId: apt.id,
    timestamp: new Date().toISOString(),
    details: `Updated appointment status for Token #${apt.tokenNumber} to ${status}`,
  });

  saveDatabase();
  return res.json({ success: true, message: 'Appointment status updated', data: apt });
});

// DELETE /api/appointments/:id (Cancel appointment)
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const apt = db.appointments.find((a) => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  apt.status = 'CANCELLED';
  apt.updatedAt = new Date().toISOString();

  saveDatabase();
  return res.json({ success: true, message: 'Appointment cancelled', data: apt });
});

export default router;
