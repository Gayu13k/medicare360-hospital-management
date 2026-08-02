import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/patients (Admin / Receptionist / Doctor)
router.get('/', authenticate, authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), (req, res) => {
  const { search } = req.query;
  const db = getDb();
  let list = db.patients;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, data: list });
});

// GET /api/patients/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const patient = db.patients.find((p) => p.id === id || p.userId === id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient profile not found' });
  }

  // Patients can only access their own profile unless staff
  if (req.user!.role === 'PATIENT') {
    const self = db.patients.find((p) => p.userId === req.user!.id);
    if (!self || self.id !== patient.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  return res.json({ success: true, data: patient });
});

// PUT /api/patients/:id
router.put('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const patient = db.patients.find((p) => p.id === id || p.userId === id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient profile not found' });
  }

  if (req.user!.role === 'PATIENT') {
    const self = db.patients.find((p) => p.userId === req.user!.id);
    if (!self || self.id !== patient.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  const { name, phone, dateOfBirth, gender, bloodGroup, height, weight, allergies, existingDiseases, medicalConditions } = req.body;

  if (name !== undefined) patient.name = name;
  if (phone !== undefined) patient.phone = phone;
  if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
  if (gender !== undefined) patient.gender = gender;
  if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
  if (height !== undefined) patient.height = Number(height);
  if (weight !== undefined) patient.weight = Number(weight);
  if (allergies !== undefined) patient.allergies = allergies;
  if (existingDiseases !== undefined) patient.existingDiseases = existingDiseases;
  if (medicalConditions !== undefined) patient.medicalConditions = medicalConditions;

  saveDatabase();
  return res.json({ success: true, message: 'Patient profile updated', data: patient });
});

export default router;
