export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PATIENT';

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type BillStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  height?: number; // cm
  weight?: number; // kg
  allergies?: string;
  existingDiseases?: string;
  medicalConditions?: string;
  profileImage?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  departmentId: string;
  departmentName?: string;
  consultationFee: number;
  phone: string;
  qualification: string;
  experience: number; // years
  profileImage?: string;
  available: boolean;
  availableFrom?: string; // "09:00"
  availableTo?: string; // "17:00"
}

export interface Department {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  icon?: string;
  doctorCount?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  tokenNumber: number;
  status: AppointmentStatus;
  reason: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenQueueTracking {
  appointmentId: string;
  patientToken: number;
  currentToken: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  appointmentStatus: AppointmentStatus;
  doctorName: string;
  doctorId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  totalQueueForToday: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  appointmentDate: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  vitals?: {
    bloodPressure?: string;
    temperature?: string;
    pulseRate?: string;
    weight?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  medicineName: string;
  dosage: string; // e.g., "500mg"
  frequency: string; // e.g., "1-0-1 (After meals)"
  duration: string; // e.g., "5 Days"
  instructions?: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentId: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  additionalNotes?: string;
  createdAt: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  testName: string;
  instructions?: string;
  result?: string;
  reportFileUrl?: string;
  reportFileName?: string;
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  appointmentId: string;
  consultationFee: number;
  medicineCharges: number;
  labCharges: number;
  roomCharges: number;
  serviceCharges: number;
  gst: number;
  discount: number;
  totalAmount: number;
  status: BillStatus;
  createdAt: string;
  paidAt?: string;
  transactionId?: string;
  paymentMethod?: string;
}

export interface Payment {
  id: string;
  billId: string;
  patientId: string;
  amount: number;
  paymentMethod: 'RAZORPAY_CARD' | 'RAZORPAY_UPI' | 'RAZORPAY_NETBANKING' | 'CASH';
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentDate: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'QUEUE' | 'PRESCRIPTION' | 'BILL' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  completedToday: number;
  pendingAppointments: number;
  availableDoctors: number;
  pendingBills: number;
  todayRevenue: number;
  monthlyRevenue: number;
  appointmentsByStatus: { name: string; value: number }[];
  appointmentsByDept: { name: string; count: number }[];
  recentAppointments: Appointment[];
  recentPayments: Payment[];
}
