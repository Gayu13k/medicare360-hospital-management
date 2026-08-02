import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  PatientProfile,
  DoctorProfile,
  Department,
  Appointment,
  MedicalRecord,
  Prescription,
  LabTest,
  Bill,
  Payment,
  NotificationItem,
  AuditLog,
} from '../src/types';

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword
  patients: PatientProfile[];
  doctors: DoctorProfile[];
  departments: Department[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  bills: Bill[];
  payments: Payment[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

let db: DatabaseSchema;

// Helper to hash default password "password123"
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getInitialData(): DatabaseSchema {
  const today = getTodayStr();

  const adminUser: User = {
    id: 'u-admin',
    name: 'Dr. Arthur Pendelton (Admin)',
    email: 'admin@medicare360.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  };

  const recepUser: User = {
    id: 'u-recep',
    name: 'Sarah Jenkins',
    email: 'receptionist@medicare360.com',
    role: 'RECEPTIONIST',
    createdAt: new Date().toISOString(),
  };

  const doc1User: User = {
    id: 'u-doc1',
    name: 'Dr. Robert Chen',
    email: 'robert.chen@medicare360.com',
    role: 'DOCTOR',
    createdAt: new Date().toISOString(),
  };

  const doc2User: User = {
    id: 'u-doc2',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@medicare360.com',
    role: 'DOCTOR',
    createdAt: new Date().toISOString(),
  };

  const doc3User: User = {
    id: 'u-doc3',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@medicare360.com',
    role: 'DOCTOR',
    createdAt: new Date().toISOString(),
  };

  const patient1User: User = {
    id: 'u-pat1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'PATIENT',
    createdAt: new Date().toISOString(),
  };

  const patient2User: User = {
    id: 'u-pat2',
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    role: 'PATIENT',
    createdAt: new Date().toISOString(),
  };

  const patient3User: User = {
    id: 'u-pat3',
    name: 'Michael Sterling',
    email: 'michael.sterling@example.com',
    role: 'PATIENT',
    createdAt: new Date().toISOString(),
  };

  const users = [
    adminUser,
    recepUser,
    doc1User,
    doc2User,
    doc3User,
    patient1User,
    patient2User,
    patient3User,
  ];

  const passwords: Record<string, string> = {
    'u-admin': DEFAULT_PASSWORD_HASH,
    'u-recep': DEFAULT_PASSWORD_HASH,
    'u-doc1': DEFAULT_PASSWORD_HASH,
    'u-doc2': DEFAULT_PASSWORD_HASH,
    'u-doc3': DEFAULT_PASSWORD_HASH,
    'u-pat1': DEFAULT_PASSWORD_HASH,
    'u-pat2': DEFAULT_PASSWORD_HASH,
    'u-pat3': DEFAULT_PASSWORD_HASH,
  };

  const departments: Department[] = [
    {
      id: 'dept-1',
      name: 'Cardiology',
      description: 'Comprehensive cardiovascular diagnosis, heart care, and surgery.',
      status: 'ACTIVE',
      icon: 'Heart',
    },
    {
      id: 'dept-2',
      name: 'Neurology',
      description: 'Advanced brain, spine, and neurological disorders treatment.',
      status: 'ACTIVE',
      icon: 'Brain',
    },
    {
      id: 'dept-3',
      name: 'Orthopedics',
      description: 'Bone, joint, sports medicine, and reconstructive surgery.',
      status: 'ACTIVE',
      icon: 'Bone',
    },
    {
      id: 'dept-4',
      name: 'Pediatrics',
      description: 'Specialized medical care for infants, children, and adolescents.',
      status: 'ACTIVE',
      icon: 'Baby',
    },
    {
      id: 'dept-5',
      name: 'General Medicine',
      description: 'Primary healthcare, routine physicals, and chronic disease management.',
      status: 'ACTIVE',
      icon: 'Stethoscope',
    },
  ];

  const doctors: DoctorProfile[] = [
    {
      id: 'doc-1',
      userId: 'u-doc1',
      name: 'Dr. Robert Chen',
      specialization: 'Senior Cardiologist',
      departmentId: 'dept-1',
      departmentName: 'Cardiology',
      consultationFee: 150,
      phone: '+1 (555) 234-5678',
      qualification: 'MD, FACC - Harvard Medical School',
      experience: 14,
      available: true,
      availableFrom: '09:00',
      availableTo: '17:00',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'doc-2',
      userId: 'u-doc2',
      name: 'Dr. Elena Rostova',
      specialization: 'Chief Neurologist',
      departmentId: 'dept-2',
      departmentName: 'Neurology',
      consultationFee: 180,
      phone: '+1 (555) 345-6789',
      qualification: 'MD, PhD Neurological Sciences',
      experience: 11,
      available: true,
      availableFrom: '09:30',
      availableTo: '16:30',
      profileImage: 'https://images.unsplash.com/photo-1594824813566-88855ce78d80?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'doc-3',
      userId: 'u-doc3',
      name: 'Dr. Marcus Vance',
      specialization: 'Orthopedic Surgeon',
      departmentId: 'dept-3',
      departmentName: 'Orthopedics',
      consultationFee: 160,
      phone: '+1 (555) 456-7890',
      qualification: 'MS Orthopedics, Fellowship Sports Injury',
      experience: 9,
      available: true,
      availableFrom: '10:00',
      availableTo: '18:00',
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const patients: PatientProfile[] = [
    {
      id: 'pat-1',
      userId: 'u-pat1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 111-2222',
      dateOfBirth: '1988-05-14',
      gender: 'MALE',
      bloodGroup: 'O+',
      height: 178,
      weight: 76,
      allergies: 'Penicillin, Shellfish',
      existingDiseases: 'Mild Hypertension',
      medicalConditions: 'Monitored for elevated blood pressure during stress.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'pat-2',
      userId: 'u-pat2',
      name: 'Emily Watson',
      email: 'emily.watson@example.com',
      phone: '+1 (555) 333-4444',
      dateOfBirth: '1993-11-20',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      height: 165,
      weight: 58,
      allergies: 'Dust, Latex',
      existingDiseases: 'Asthma',
      medicalConditions: 'Occasional bronchospasm during seasonal changes.',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'pat-3',
      userId: 'u-pat3',
      name: 'Michael Sterling',
      email: 'michael.sterling@example.com',
      phone: '+1 (555) 777-8888',
      dateOfBirth: '1982-03-09',
      gender: 'MALE',
      bloodGroup: 'B+',
      height: 182,
      weight: 84,
      allergies: 'None',
      existingDiseases: 'Type 2 Diabetes',
      medicalConditions: 'Diet-controlled diabetes.',
    },
  ];

  // Pre-seed appointments for Dr. Robert Chen (doc-1) for today
  const appointments: Appointment[] = [
    {
      id: 'apt-1',
      patientId: 'pat-2',
      patientName: 'Emily Watson',
      patientPhone: '+1 (555) 333-4444',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorSpecialization: 'Senior Cardiologist',
      departmentId: 'dept-1',
      departmentName: 'Cardiology',
      appointmentDate: today,
      appointmentTime: '09:00',
      tokenNumber: 1,
      status: 'COMPLETED',
      reason: 'Routine ECG checkup and palpitations follow-up',
      consultationFee: 150,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'apt-2',
      patientId: 'pat-3',
      patientName: 'Michael Sterling',
      patientPhone: '+1 (555) 777-8888',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorSpecialization: 'Senior Cardiologist',
      departmentId: 'dept-1',
      departmentName: 'Cardiology',
      appointmentDate: today,
      appointmentTime: '09:30',
      tokenNumber: 2,
      status: 'IN_PROGRESS',
      reason: 'Chest tightness after exertion',
      consultationFee: 150,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'apt-3',
      patientId: 'pat-1',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 111-2222',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorSpecialization: 'Senior Cardiologist',
      departmentId: 'dept-1',
      departmentName: 'Cardiology',
      appointmentDate: today,
      appointmentTime: '10:00',
      tokenNumber: 3,
      status: 'APPROVED',
      reason: 'High blood pressure consultation and lipid profile review',
      consultationFee: 150,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: 'medrec-1',
      patientId: 'pat-2',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      appointmentId: 'apt-1',
      appointmentDate: today,
      symptoms: 'Mild shortness of breath, occasional palpitations in the evening.',
      diagnosis: 'Sinus arrhythmia with normal cardiac enzyme profile.',
      notes: 'Advised lifestyle modification, reduction in caffeine intake, 30 min daily walking.',
      vitals: {
        bloodPressure: '122/80 mmHg',
        temperature: '98.6 °F',
        pulseRate: '72 bpm',
        weight: '58 kg',
      },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  const prescriptions: Prescription[] = [
    {
      id: 'presc-1',
      medicalRecordId: 'medrec-1',
      patientId: 'pat-2',
      patientName: 'Emily Watson',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorSpecialization: 'Senior Cardiologist',
      appointmentId: 'apt-1',
      date: today,
      diagnosis: 'Sinus arrhythmia with normal cardiac enzyme profile.',
      medicines: [
        {
          medicineName: 'Metoprolol Succinate',
          dosage: '25 mg',
          frequency: '1-0-0 (Morning after breakfast)',
          duration: '14 Days',
          instructions: 'Take with plenty of water. Do not skip doses.',
        },
        {
          medicineName: 'Magnesium Supplement',
          dosage: '250 mg',
          frequency: '0-0-1 (At night before bed)',
          duration: '30 Days',
          instructions: 'Take after dinner.',
        },
      ],
      additionalNotes: 'Follow up in 2 weeks with repeat Holter monitor readings if symptoms persist.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  const labTests: LabTest[] = [
    {
      id: 'lab-1',
      patientId: 'pat-2',
      patientName: 'Emily Watson',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      appointmentId: 'apt-1',
      testName: 'Lipid Profile & Serum Electrolytes',
      instructions: '12-hour overnight fasting required.',
      result: 'Total Cholesterol: 185 mg/dL (Normal), Potassium: 4.2 mEq/L',
      reportFileName: 'LabReport_EmilyWatson_Cardio.pdf',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'lab-2',
      patientId: 'pat-1',
      patientName: 'John Doe',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      appointmentId: 'apt-3',
      testName: 'Echocardiogram (2D Echo) & High-Sensitivity CRP',
      instructions: 'Standard cardiac baseline assessment.',
      status: 'REQUESTED',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];

  const bills: Bill[] = [
    {
      id: 'bill-1',
      patientId: 'pat-2',
      patientName: 'Emily Watson',
      patientEmail: 'emily.watson@example.com',
      appointmentId: 'apt-1',
      consultationFee: 150,
      medicineCharges: 45,
      labCharges: 80,
      roomCharges: 0,
      serviceCharges: 15,
      gst: 20,
      discount: 10,
      totalAmount: 300,
      status: 'PAID',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      paidAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      transactionId: 'PAY_RZP_994827101',
      paymentMethod: 'RAZORPAY_UPI',
    },
    {
      id: 'bill-2',
      patientId: 'pat-1',
      patientName: 'John Doe',
      patientEmail: 'john.doe@example.com',
      appointmentId: 'apt-3',
      consultationFee: 150,
      medicineCharges: 0,
      labCharges: 120,
      roomCharges: 0,
      serviceCharges: 20,
      gst: 25,
      discount: 0,
      totalAmount: 315,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-1',
      billId: 'bill-1',
      patientId: 'pat-2',
      amount: 300,
      paymentMethod: 'RAZORPAY_UPI',
      transactionId: 'PAY_RZP_994827101',
      status: 'SUCCESS',
      paymentDate: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'u-pat1',
      title: 'Appointment Confirmed & Token Generated',
      message: 'Your appointment with Dr. Robert Chen is confirmed for today. Your Token Number is #3.',
      type: 'APPOINTMENT',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'u-pat2',
      title: 'New Prescription Available',
      message: 'Dr. Robert Chen issued a prescription for your consultation.',
      type: 'PRESCRIPTION',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      userId: 'u-recep',
      userName: 'Sarah Jenkins',
      userRole: 'RECEPTIONIST',
      action: 'BOOK_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: 'apt-3',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      details: 'Booked appointment for John Doe with Dr. Robert Chen (Token #3)',
    },
    {
      id: 'log-2',
      userId: 'u-doc1',
      userName: 'Dr. Robert Chen',
      userRole: 'DOCTOR',
      action: 'CALL_NEXT_PATIENT',
      entityType: 'QUEUE',
      entityId: 'apt-2',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      details: 'Called Token #2 (Michael Sterling) into consultation',
    },
  ];

  return {
    users,
    passwords,
    patients,
    doctors,
    departments,
    appointments,
    medicalRecords,
    prescriptions,
    labTests,
    bills,
    payments,
    notifications,
    auditLogs,
  };
}

export function loadDatabase(): DatabaseSchema {
  if (db) return db;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      db = getInitialData();
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to load database from JSON file, initializing defaults', err);
    db = getInitialData();
  }
  return db;
}

export function saveDatabase(): void {
  try {
    if (db) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}

// Get DB instance
export const getDb = loadDatabase;
