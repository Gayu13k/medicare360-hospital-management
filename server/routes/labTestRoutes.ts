import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { LabTest } from '../../src/types';

const router = Router();

// GET /api/lab-tests/patient/:patientId
router.get('/patient/:patientId', authenticate, (req: AuthenticatedRequest, res) => {
  const { patientId } = req.params;
  const db = getDb();

  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile || patientProfile.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  const list = db.labTests.filter((l) => l.patientId === patientId);
  return res.json({ success: true, data: list });
});

// POST /api/lab-tests (Doctor orders lab test)
router.post('/', authenticate, authorize(['DOCTOR', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const { patientId, appointmentId, testName, instructions } = req.body;

  if (!patientId || !testName) {
    return res.status(400).json({ success: false, message: 'Patient ID and test name are required' });
  }

  const db = getDb();
  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  let docId = 'doc-1';
  let docName = req.user!.name;
  const docProfile = db.doctors.find((d) => d.userId === req.user!.id);
  if (docProfile) {
    docId = docProfile.id;
    docName = docProfile.name;
  }

  const testId = `lab-${Date.now()}`;
  const newLabTest: LabTest = {
    id: testId,
    patientId: patient.id,
    patientName: patient.name,
    doctorId: docId,
    doctorName: docName,
    appointmentId: appointmentId || '',
    testName,
    instructions: instructions || 'Standard lab preparation',
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
  };

  db.labTests.unshift(newLabTest);

  // Notify patient
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: patient.userId,
    title: 'New Lab Test Ordered',
    message: `${docName} ordered lab test: ${testName}`,
    type: 'GENERAL',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase();
  return res.status(201).json({ success: true, message: 'Lab test ordered', data: newLabTest });
});

// POST /api/lab-tests/:id/report (Upload lab report / complete test)
router.post('/:id/report', authenticate, authorize(['DOCTOR', 'RECEPTIONIST', 'ADMIN']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { result, reportFileName } = req.body;

  const db = getDb();
  const test = db.labTests.find((l) => l.id === id);
  if (!test) {
    return res.status(404).json({ success: false, message: 'Lab test not found' });
  }

  test.result = result || 'Test completed successfully. Results within normal physiological limits.';
  test.reportFileName = reportFileName || `LabReport_${test.patientName.replace(/\s+/g, '_')}.pdf`;
  test.status = 'COMPLETED';
  test.completedAt = new Date().toISOString();

  saveDatabase();
  return res.json({ success: true, message: 'Lab report updated', data: test });
});

export default router;
