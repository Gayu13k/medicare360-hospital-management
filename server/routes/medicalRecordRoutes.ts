import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { MedicalRecord } from '../../src/types';

const router = Router();

// GET /api/medical-records/patient/:patientId
router.get('/patient/:patientId', authenticate, (req: AuthenticatedRequest, res) => {
  const { patientId } = req.params;
  const db = getDb();

  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile || patientProfile.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied to these records' });
    }
  }

  const records = db.medicalRecords.filter((r) => r.patientId === patientId);
  return res.json({ success: true, data: records });
});

// GET /api/medical-records/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const record = db.medicalRecords.find((r) => r.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Medical record not found' });
  }

  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile || patientProfile.id !== record.patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  return res.json({ success: true, data: record });
});

// POST /api/medical-records (Doctor creates diagnosis/notes)
router.post('/', authenticate, authorize(['DOCTOR', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const { patientId, appointmentId, symptoms, diagnosis, notes, vitals } = req.body;

  if (!patientId || !symptoms || !diagnosis) {
    return res.status(400).json({ success: false, message: 'Patient, symptoms, and diagnosis are required' });
  }

  const db = getDb();
  let doctorName = req.user!.name;
  let doctorId = 'doc-1';

  const docProfile = db.doctors.find((d) => d.userId === req.user!.id);
  if (docProfile) {
    doctorId = docProfile.id;
    doctorName = docProfile.name;
  }

  const newRecord: MedicalRecord = {
    id: `medrec-${Date.now()}`,
    patientId,
    doctorId,
    doctorName,
    appointmentId: appointmentId || '',
    appointmentDate: new Date().toISOString().split('T')[0],
    symptoms,
    diagnosis,
    notes: notes || '',
    vitals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.medicalRecords.push(newRecord);

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_MEDICAL_RECORD',
    entityType: 'MEDICAL_RECORD',
    entityId: newRecord.id,
    timestamp: new Date().toISOString(),
    details: `Added EMR diagnosis for patient ${patientId}: ${diagnosis}`,
  });

  saveDatabase();

  return res.status(201).json({ success: true, message: 'Medical record created', data: newRecord });
});

export default router;
