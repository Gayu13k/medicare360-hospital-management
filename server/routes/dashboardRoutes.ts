import { Router } from 'express';
import { getDb } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';

const router = Router();

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/dashboard/admin
router.get('/admin', authenticate, authorize(['ADMIN']), (_req, res) => {
  const db = getDb();
  const today = getTodayStr();

  const totalPatients = db.patients.length;
  const totalDoctors = db.doctors.length;
  const availableDoctors = db.doctors.filter((d) => d.available).length;

  const todayAppointments = db.appointments.filter((a) => a.appointmentDate === today).length;
  const completedToday = db.appointments.filter((a) => a.appointmentDate === today && a.status === 'COMPLETED').length;
  const pendingAppointments = db.appointments.filter((a) => ['PENDING', 'APPROVED'].includes(a.status)).length;

  const pendingBills = db.bills.filter((b) => b.status === 'PENDING').length;

  const todayRevenue = db.payments
    .filter((p) => p.paymentDate.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenue = db.payments.reduce((sum, p) => sum + p.amount, 0);

  // Appointments by status
  const statuses = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const appointmentsByStatus = statuses.map((st) => ({
    name: st.replace('_', ' '),
    value: db.appointments.filter((a) => a.status === st).length,
  }));

  // Appointments by department
  const appointmentsByDept = db.departments.map((d) => ({
    name: d.name,
    count: db.appointments.filter((a) => a.departmentId === d.id).length,
  }));

  return res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedToday,
      pendingAppointments,
      availableDoctors,
      pendingBills,
      todayRevenue,
      monthlyRevenue,
      appointmentsByStatus,
      appointmentsByDept,
      recentAppointments: db.appointments.slice(0, 5),
      recentPayments: db.payments.slice(0, 5),
    },
  });
});

// GET /api/dashboard/receptionist
router.get('/receptionist', authenticate, authorize(['RECEPTIONIST', 'ADMIN']), (_req, res) => {
  const db = getDb();
  const today = getTodayStr();

  const todayApts = db.appointments.filter((a) => a.appointmentDate === today);
  const waitingApts = todayApts.filter((a) => ['APPROVED', 'PENDING'].includes(a.status));
  const inProgressApts = todayApts.filter((a) => a.status === 'IN_PROGRESS');
  const completedApts = todayApts.filter((a) => a.status === 'COMPLETED');
  const pendingBills = db.bills.filter((b) => b.status === 'PENDING');

  return res.json({
    success: true,
    data: {
      totalToday: todayApts.length,
      waitingCount: waitingApts.length,
      inProgressCount: inProgressApts.length,
      completedCount: completedApts.length,
      pendingBillsCount: pendingBills.length,
      todayAppointments: todayApts,
      doctorsStatus: db.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        available: d.available,
        queueCount: db.appointments.filter(
          (a) => a.doctorId === d.id && a.appointmentDate === today && ['APPROVED', 'PENDING', 'IN_PROGRESS'].includes(a.status)
        ).length,
      })),
    },
  });
});

// GET /api/dashboard/doctor
router.get('/doctor', authenticate, authorize(['DOCTOR', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const today = getTodayStr();

  let docId = 'doc-1';
  const docProfile = db.doctors.find((d) => d.userId === req.user!.id);
  if (docProfile) docId = docProfile.id;

  const doctorApts = db.appointments.filter((a) => a.doctorId === docId && a.appointmentDate === today && a.status !== 'CANCELLED');
  const inProgress = doctorApts.find((a) => a.status === 'IN_PROGRESS') || null;
  const waiting = doctorApts.filter((a) => ['APPROVED', 'PENDING'].includes(a.status));
  const completed = doctorApts.filter((a) => a.status === 'COMPLETED');

  return res.json({
    success: true,
    data: {
      totalToday: doctorApts.length,
      inProgress,
      waitingCount: waiting.length,
      completedCount: completed.length,
      waitingAppointments: waiting,
      completedAppointments: completed,
    },
  });
});

// GET /api/dashboard/patient
router.get('/patient', authenticate, authorize(['PATIENT', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const today = getTodayStr();

  const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
  if (!patientProfile) {
    return res.status(404).json({ success: false, message: 'Patient profile not found' });
  }

  const patientApts = db.appointments.filter((a) => a.patientId === patientProfile.id);
  
  // Find active appointment for today or upcoming
  const activeApt = patientApts.find(
    (a) => (a.appointmentDate === today && ['APPROVED', 'IN_PROGRESS', 'PENDING'].includes(a.status)) || a.appointmentDate > today
  ) || null;

  const prescriptions = db.prescriptions.filter((p) => p.patientId === patientProfile.id);
  const bills = db.bills.filter((b) => b.patientId === patientProfile.id);
  const pendingBills = bills.filter((b) => b.status === 'PENDING');

  return res.json({
    success: true,
    data: {
      patientProfile,
      activeAppointment: activeApt,
      totalAppointments: patientApts.length,
      totalPrescriptions: prescriptions.length,
      totalBills: bills.length,
      pendingBillsCount: pendingBills.length,
      recentAppointments: patientApts.slice(0, 5),
      recentPrescriptions: prescriptions.slice(0, 3),
    },
  });
});

export default router;
