import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { TokenQueueTracking, AuditLog, NotificationItem } from '../../src/types';

const router = Router();

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const AVG_CONSULTATION_MINUTES = 15;

// GET /api/appointments/:id/tracking OR GET /api/queue/tracking/:appointmentId
router.get('/tracking/:appointmentId', authenticate, (req: AuthenticatedRequest, res) => {
  const { appointmentId } = req.params;
  const db = getDb();

  const apt = db.appointments.find((a) => a.id === appointmentId);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  // Get all active appointments for this doctor on the same appointment date
  const doctorApts = db.appointments.filter(
    (a) => a.doctorId === apt.doctorId && a.appointmentDate === apt.appointmentDate
  );

  // Current serving token: appointment with status IN_PROGRESS, or lowest active token if none in progress
  const inProgressApt = doctorApts.find((a) => a.status === 'IN_PROGRESS');
  let currentToken = 0;
  if (inProgressApt) {
    currentToken = inProgressApt.tokenNumber;
  } else {
    // If no one is currently in progress, look for completed max or minimum pending
    const completedApts = doctorApts.filter((a) => a.status === 'COMPLETED');
    if (completedApts.length > 0) {
      currentToken = Math.max(...completedApts.map((a) => a.tokenNumber));
    } else {
      currentToken = 0;
    }
  }

  // Calculate patients ahead: active waiting appointments (APPROVED or PENDING) with tokenNumber < patientToken
  const waitingApts = doctorApts.filter(
    (a) => ['APPROVED', 'PENDING'].includes(a.status) && a.tokenNumber < apt.tokenNumber
  );

  const patientsAhead = apt.status === 'IN_PROGRESS' || apt.status === 'COMPLETED' ? 0 : waitingApts.length;
  const estimatedWaitMinutes = patientsAhead * AVG_CONSULTATION_MINUTES;

  const trackingInfo: TokenQueueTracking = {
    appointmentId: apt.id,
    patientToken: apt.tokenNumber,
    currentToken,
    patientsAhead,
    estimatedWaitMinutes,
    appointmentStatus: apt.status,
    doctorName: apt.doctorName,
    doctorId: apt.doctorId,
    departmentName: apt.departmentName,
    appointmentDate: apt.appointmentDate,
    appointmentTime: apt.appointmentTime,
    totalQueueForToday: doctorApts.filter((a) => a.status !== 'CANCELLED').length,
  };

  return res.json({ success: true, data: trackingInfo });
});

// GET /api/queue/doctor/:doctorId/today (Doctor or Receptionist queue view)
router.get('/doctor/:doctorId/today', authenticate, (req: AuthenticatedRequest, res) => {
  const { doctorId } = req.params;
  const db = getDb();
  const dateStr = (req.query.date as string) || getTodayStr();

  const doctorApts = db.appointments
    .filter((a) => a.doctorId === doctorId && a.appointmentDate === dateStr && a.status !== 'CANCELLED')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const currentServing = doctorApts.find((a) => a.status === 'IN_PROGRESS') || null;
  const waitingQueue = doctorApts.filter((a) => ['APPROVED', 'PENDING'].includes(a.status));
  const completedQueue = doctorApts.filter((a) => a.status === 'COMPLETED');

  return res.json({
    success: true,
    data: {
      doctorId,
      date: dateStr,
      currentServing,
      waitingQueue,
      completedQueue,
      totalAppointments: doctorApts.length,
    },
  });
});

// POST /api/queue/doctor/:doctorId/next (CALL NEXT PATIENT)
router.post('/doctor/:doctorId/next', authenticate, authorize(['DOCTOR', 'RECEPTIONIST', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const { doctorId } = req.params;
  const db = getDb();
  const dateStr = (req.body.date as string) || getTodayStr();

  const doctorApts = db.appointments
    .filter((a) => a.doctorId === doctorId && a.appointmentDate === dateStr && a.status !== 'CANCELLED')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  // 1. Mark current IN_PROGRESS as COMPLETED
  const currentInProgress = doctorApts.find((a) => a.status === 'IN_PROGRESS');
  if (currentInProgress) {
    currentInProgress.status = 'COMPLETED';
    currentInProgress.updatedAt = new Date().toISOString();
  }

  // 2. Find next waiting appointment with lowest tokenNumber
  const nextWaiting = doctorApts.find((a) => ['APPROVED', 'PENDING'].includes(a.status));

  if (!nextWaiting) {
    saveDatabase();
    return res.json({
      success: true,
      message: 'Queue completed for today! No more waiting patients.',
      data: {
        completedAppointment: currentInProgress || null,
        nextAppointment: null,
      },
    });
  }

  // 3. Set next appointment to IN_PROGRESS
  nextWaiting.status = 'IN_PROGRESS';
  nextWaiting.updatedAt = new Date().toISOString();

  // Send notification to next patient user
  const patient = db.patients.find((p) => p.id === nextWaiting.patientId);
  if (patient) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: patient.userId,
      title: "It's Your Turn! Token #" + nextWaiting.tokenNumber,
      message: `Doctor ${nextWaiting.doctorName} is calling Token #${nextWaiting.tokenNumber}. Please proceed to Consultation Room.`,
      type: 'QUEUE',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CALL_NEXT_PATIENT',
    entityType: 'QUEUE',
    entityId: nextWaiting.id,
    timestamp: new Date().toISOString(),
    details: `Doctor called next patient: Token #${nextWaiting.tokenNumber} (${nextWaiting.patientName})`,
  });

  saveDatabase();

  return res.json({
    success: true,
    message: `Now calling Token #${nextWaiting.tokenNumber} (${nextWaiting.patientName})`,
    data: {
      completedAppointment: currentInProgress || null,
      nextAppointment: nextWaiting,
    },
  });
});

export default router;
