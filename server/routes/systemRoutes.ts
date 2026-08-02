import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/notifications
router.get('/notifications', authenticate, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const userNotifs = db.notifications.filter((n) => n.userId === req.user!.id);
  return res.json({ success: true, data: userNotifs });
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === id && n.userId === req.user!.id);
  if (notif) {
    notif.isRead = true;
    saveDatabase();
  }
  return res.json({ success: true, message: 'Notification marked as read' });
});

// GET /api/audit-logs (Admin only)
router.get('/audit-logs', authenticate, authorize(['ADMIN']), (_req, res) => {
  const db = getDb();
  return res.json({ success: true, data: db.auditLogs });
});

export default router;
