import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDatabase } from '../db';
import { generateToken, authenticate, AuthenticatedRequest } from '../auth';
import { User, PatientProfile, AuditLog } from '../../src/types';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      data: null,
    });
  }

  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      data: null,
    });
  }

  const storedHash = db.passwords[user.id];
  if (!storedHash || !bcrypt.compareSync(password, storedHash)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      data: null,
    });
  }

  const token = generateToken(user);

  // Log audit
  const log: AuditLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    timestamp: new Date().toISOString(),
    details: `${user.role} ${user.name} logged in`,
  };
  db.auditLogs.unshift(log);
  saveDatabase();

  return res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user,
    },
  });
});

// POST /api/auth/register (Patient registration by default, or admin registration)
router.post('/register', (req, res) => {
  const { name, email, password, phone, gender, dateOfBirth, bloodGroup } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required',
      data: null,
    });
  }

  const db = getDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
      data: null,
    });
  }

  const userId = `u-${Date.now()}`;
  const newUser: User = {
    id: userId,
    name,
    email,
    role: 'PATIENT',
    createdAt: new Date().toISOString(),
  };

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.users.push(newUser);
  db.passwords[userId] = hashedPassword;

  // Create Patient profile
  const patId = `pat-${Date.now()}`;
  const newPatient: PatientProfile = {
    id: patId,
    userId,
    name,
    email,
    phone: phone || '+1 (555) 000-0000',
    dateOfBirth: dateOfBirth || '1995-01-01',
    gender: gender || 'MALE',
    bloodGroup: bloodGroup || 'O+',
  };
  db.patients.push(newPatient);

  const token = generateToken(newUser);

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'PATIENT_REGISTER',
    entityType: 'PATIENT',
    entityId: patId,
    timestamp: new Date().toISOString(),
    details: `New patient registered: ${name} (${email})`,
  });

  saveDatabase();

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: newUser,
      patient: newPatient,
    },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user?.id);
  
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  let extraData: any = {};
  if (user.role === 'PATIENT') {
    extraData.patientProfile = db.patients.find((p) => p.userId === user.id);
  } else if (user.role === 'DOCTOR') {
    extraData.doctorProfile = db.doctors.find((d) => d.userId === user.id);
  }

  return res.json({
    success: true,
    data: {
      user,
      ...extraData,
    },
  });
});

// GET /api/auth/demo-users (For quick role switching during hackathon / review)
router.get('/demo-users', (_req, res) => {
  const db = getDb();
  const demoUsers = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
  return res.json({ success: true, data: demoUsers });
});

export default router;
