import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { Prescription } from '../../src/types';

const router = Router();

// GET /api/prescriptions/patient/:patientId
router.get('/patient/:patientId', authenticate, (req: AuthenticatedRequest, res) => {
  const { patientId } = req.params;
  const db = getDb();

  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile || patientProfile.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  const list = db.prescriptions.filter((p) => p.patientId === patientId);
  return res.json({ success: true, data: list });
});

// GET /api/prescriptions/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const item = db.prescriptions.find((p) => p.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Prescription not found' });
  }
  return res.json({ success: true, data: item });
});

// POST /api/prescriptions (Doctor issues multi-medicine prescription)
router.post('/', authenticate, authorize(['DOCTOR', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const { patientId, medicalRecordId, appointmentId, diagnosis, medicines, additionalNotes } = req.body;

  if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ success: false, message: 'Patient and at least one medicine are required' });
  }

  const db = getDb();
  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  let docId = 'doc-1';
  let docName = req.user!.name;
  let docSpec = 'Doctor';

  const docProfile = db.doctors.find((d) => d.userId === req.user!.id);
  if (docProfile) {
    docId = docProfile.id;
    docName = docProfile.name;
    docSpec = docProfile.specialization;
  }

  const prescId = `presc-${Date.now()}`;
  const newPrescription: Prescription = {
    id: prescId,
    medicalRecordId: medicalRecordId || '',
    patientId: patient.id,
    patientName: patient.name,
    doctorId: docId,
    doctorName: docName,
    doctorSpecialization: docSpec,
    appointmentId: appointmentId || '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || 'General Health Review',
    medicines,
    additionalNotes: additionalNotes || '',
    createdAt: new Date().toISOString(),
  };

  db.prescriptions.unshift(newPrescription);

  // Send Notification to Patient User
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: patient.userId,
    title: 'New Prescription Issued',
    message: `${docName} issued a prescription with ${medicines.length} medicine(s).`,
    type: 'PRESCRIPTION',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_PRESCRIPTION',
    entityType: 'PRESCRIPTION',
    entityId: prescId,
    timestamp: new Date().toISOString(),
    details: `Issued prescription for ${patient.name} (${medicines.length} items)`,
  });

  saveDatabase();

  return res.status(201).json({ success: true, message: 'Prescription created', data: newPrescription });
});

export default router;
