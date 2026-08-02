import { Router } from 'express';
import { getDb, saveDatabase } from '../db';
import { authenticate, authorize, AuthenticatedRequest } from '../auth';
import { Bill, Payment } from '../../src/types';

const router = Router();

// GET /api/bills/patient/:patientId
router.get('/patient/:patientId', authenticate, (req: AuthenticatedRequest, res) => {
  const { patientId } = req.params;
  const db = getDb();

  if (req.user!.role === 'PATIENT') {
    const patientProfile = db.patients.find((p) => p.userId === req.user!.id);
    if (!patientProfile || patientProfile.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  const list = db.bills.filter((b) => b.patientId === patientId);
  return res.json({ success: true, data: list });
});

// GET /api/bills (Admin / Receptionist list all bills)
router.get('/', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), (req, res) => {
  const db = getDb();
  return res.json({ success: true, data: db.bills });
});

// POST /api/bills (Generate bill)
router.post('/', authenticate, authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), (req: AuthenticatedRequest, res) => {
  const {
    patientId,
    appointmentId,
    consultationFee = 150,
    medicineCharges = 0,
    labCharges = 0,
    roomCharges = 0,
    serviceCharges = 20,
    gst = 18,
    discount = 0,
  } = req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: 'Patient ID is required' });
  }

  const db = getDb();
  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const subtotal =
    Number(consultationFee) +
    Number(medicineCharges) +
    Number(labCharges) +
    Number(roomCharges) +
    Number(serviceCharges);

  const totalAmount = Math.max(0, Math.round(subtotal + Number(gst) - Number(discount)));

  const billId = `bill-${Date.now()}`;
  const newBill: Bill = {
    id: billId,
    patientId: patient.id,
    patientName: patient.name,
    patientEmail: patient.email,
    appointmentId: appointmentId || '',
    consultationFee: Number(consultationFee),
    medicineCharges: Number(medicineCharges),
    labCharges: Number(labCharges),
    roomCharges: Number(roomCharges),
    serviceCharges: Number(serviceCharges),
    gst: Number(gst),
    discount: Number(discount),
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.bills.unshift(newBill);

  // Send Notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: patient.userId,
    title: 'New Hospital Invoice Generated',
    message: `Bill of $${totalAmount} has been generated for your recent consultation.`,
    type: 'BILL',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_BILL',
    entityType: 'BILL',
    entityId: billId,
    timestamp: new Date().toISOString(),
    details: `Generated bill $${totalAmount} for patient ${patient.name}`,
  });

  saveDatabase();
  return res.status(201).json({ success: true, message: 'Bill generated', data: newBill });
});

// POST /api/payments (Process Payment / Razorpay simulation)
router.post('/payments', authenticate, (req: AuthenticatedRequest, res) => {
  const { billId, paymentMethod = 'RAZORPAY_UPI' } = req.body;

  if (!billId) {
    return res.status(400).json({ success: false, message: 'Bill ID is required' });
  }

  const db = getDb();
  const bill = db.bills.find((b) => b.id === billId);
  if (!bill) {
    return res.status(404).json({ success: false, message: 'Bill not found' });
  }

  if (bill.status === 'PAID') {
    return res.status(400).json({ success: false, message: 'This bill has already been paid' });
  }

  const transactionId = `PAY_RZP_${Math.floor(100000000 + Math.random() * 900000000)}`;

  bill.status = 'PAID';
  bill.paidAt = new Date().toISOString();
  bill.transactionId = transactionId;
  bill.paymentMethod = paymentMethod;

  const payment: Payment = {
    id: `pay-${Date.now()}`,
    billId: bill.id,
    patientId: bill.patientId,
    amount: bill.totalAmount,
    paymentMethod,
    transactionId,
    status: 'SUCCESS',
    paymentDate: new Date().toISOString(),
  };

  db.payments.unshift(payment);

  // Notify Patient
  const patient = db.patients.find((p) => p.id === bill.patientId);
  if (patient) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: patient.userId,
      title: 'Payment Confirmed',
      message: `Your payment of $${bill.totalAmount} was processed successfully (Txn ID: ${transactionId}).`,
      type: 'BILL',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'PROCESS_PAYMENT',
    entityType: 'PAYMENT',
    entityId: payment.id,
    timestamp: new Date().toISOString(),
    details: `Processed payment of $${bill.totalAmount} for Bill #${bill.id} via ${paymentMethod}`,
  });

  saveDatabase();

  return res.json({
    success: true,
    message: 'Payment completed successfully!',
    data: {
      bill,
      payment,
    },
  });
});

export default router;
