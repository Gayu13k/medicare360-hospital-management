import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { DoctorProfile, User } from '../../src/types';

const router = Router();

// GET /api/doctors (Public or Authenticated with optional department search)
router.get('/', (req, res) => {
  const { departmentId, search } = req.query;
  const db = getDb();
  let list = db.doctors;

  if (departmentId) {
    list = list.filter((d) => d.departmentId === departmentId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        (d.departmentName && d.departmentName.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, data: list });
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const doctor = db.doctors.find((d) => d.id === id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }
  return res.json({ success: true, data: doctor });
});

// POST /api/doctors (Admin only: creates user + doctor profile)
router.post('/', authenticate, authorize(['ADMIN']), (req: AuthenticatedRequest, res) => {
  const {
    name,
    email,
    password,
    specialization,
    departmentId,
    consultationFee,
    phone,
    qualification,
    experience,
    availableFrom,
    availableTo,
  } = req.body;

  if (!name || !email || !departmentId || !specialization) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, specialization, and departmentId are required',
    });
  }

  const db = getDb();
  const dept = db.departments.find((d) => d.id === departmentId);
  if (!dept) {
    return res.status(400).json({ success: false, message: 'Invalid department ID' });
  }

  // Create User
  const userId = `u-${Date.now()}`;
  const newUser: User = {
    id: userId,
    name,
    email,
    role: 'DOCTOR',
    createdAt: new Date().toISOString(),
  };

  const hashedPassword = bcrypt.hashSync(password || 'password123', 10);
  db.users.push(newUser);
  db.passwords[userId] = hashedPassword;

  // Create Doctor
  const docId = `doc-${Date.now()}`;
  const newDoctor: DoctorProfile = {
    id: docId,
    userId,
    name,
    specialization,
    departmentId,
    departmentName: dept.name,
    consultationFee: Number(consultationFee) || 150,
    phone: phone || '+1 (555) 000-0000',
    qualification: qualification || 'MD',
    experience: Number(experience) || 5,
    available: true,
    availableFrom: availableFrom || '09:00',
    availableTo: availableTo || '17:00',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  };

  db.doctors.push(newDoctor);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_DOCTOR',
    entityType: 'DOCTOR',
    entityId: docId,
    timestamp: new Date().toISOString(),
    details: `Added doctor: ${name} (${specialization})`,
  });

  saveDatabase();
  return res.status(201).json({ success: true, message: 'Doctor added', data: newDoctor });
});

// PUT /api/doctors/:id
router.put('/:id', authenticate, authorize(['ADMIN', 'DOCTOR']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const doctor = db.doctors.find((d) => d.id === id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  // If doctor editing own profile, ensure authorization
  if (req.user!.role === 'DOCTOR') {
    const selfDoc = db.doctors.find((d) => d.userId === req.user!.id);
    if (!selfDoc || selfDoc.id !== id) {
      return res.status(403).json({ success: false, message: 'Cannot edit another doctor profile' });
    }
  }

  const { name, specialization, departmentId, consultationFee, phone, qualification, experience, available, availableFrom, availableTo } = req.body;

  if (departmentId) {
    const dept = db.departments.find((d) => d.id === departmentId);
    if (dept) {
      doctor.departmentId = departmentId;
      doctor.departmentName = dept.name;
    }
  }

  if (name !== undefined) doctor.name = name;
  if (specialization !== undefined) doctor.specialization = specialization;
  if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
  if (phone !== undefined) doctor.phone = phone;
  if (qualification !== undefined) doctor.qualification = qualification;
  if (experience !== undefined) doctor.experience = Number(experience);
  if (available !== undefined) doctor.available = Boolean(available);
  if (availableFrom !== undefined) doctor.availableFrom = availableFrom;
  if (availableTo !== undefined) doctor.availableTo = availableTo;

  saveDatabase();
  return res.json({ success: true, message: 'Doctor updated', data: doctor });
});

// DELETE /api/doctors/:id
router.delete('/:id', authenticate, authorize(['ADMIN']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.doctors.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  const deleted = db.doctors.splice(index, 1)[0];
  saveDatabase();
  return res.json({ success: true, message: 'Doctor deleted', data: deleted });
});

export default router;
