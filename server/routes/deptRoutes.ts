import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { Department, AuditLog } from '../../src/types';

const router = Router();

// GET /api/departments (Public / Authenticated)
router.get('/', (_req, res) => {
  const db = getDb();
  const depts = db.departments.map((d) => {
    const doctorCount = db.doctors.filter((doc) => doc.departmentId === d.id).length;
    return { ...d, doctorCount };
  });
  return res.json({ success: true, data: depts });
});

// POST /api/departments (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), (req: AuthenticatedRequest, res) => {
  const { name, description, icon } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Department name is required' });
  }

  const db = getDb();
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    name,
    description: description || '',
    status: 'ACTIVE',
    icon: icon || 'Stethoscope',
  };

  db.departments.push(newDept);

  // Log audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_DEPARTMENT',
    entityType: 'DEPARTMENT',
    entityId: newDept.id,
    timestamp: new Date().toISOString(),
    details: `Created department: ${newDept.name}`,
  });

  saveDatabase();
  return res.status(201).json({ success: true, message: 'Department created', data: newDept });
});

// PUT /api/departments/:id
router.put('/:id', authenticate, authorize(['ADMIN']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, description, status, icon } = req.body;

  const db = getDb();
  const dept = db.departments.find((d) => d.id === id);
  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  if (name !== undefined) dept.name = name;
  if (description !== undefined) dept.description = description;
  if (status !== undefined) dept.status = status;
  if (icon !== undefined) dept.icon = icon;

  saveDatabase();
  return res.json({ success: true, message: 'Department updated', data: dept });
});

// DELETE /api/departments/:id
router.delete('/:id', authenticate, authorize(['ADMIN']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.departments.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const deleted = db.departments.splice(index, 1)[0];
  saveDatabase();
  return res.json({ success: true, message: 'Department deleted', data: deleted });
});

export default router;
