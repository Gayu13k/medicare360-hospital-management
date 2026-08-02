import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Calendar,
  CreditCard,
  UserPlus,
  Activity,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ReceptionistDashboard: React.FC = () => {
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Register Patient Modal
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '1990-01-01',
    bloodGroup: 'O+',
  });

  const fetchDashboard = async () => {
    try {
      const data = await api.get('/dashboard/receptionist');
      setDashData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        ...patientForm,
        password: 'password123',
      });
      alert(`Patient ${patientForm.name} registered successfully!`);
      setShowRegModal(false);
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'O+',
      });
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/4"></div>
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Reception Desk</span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">Receptionist Management Desk</h1>
          <p className="text-xs text-slate-300 mt-1">Walk-in registrations, appointment booking & queue monitoring</p>
        </div>

        <button
          onClick={() => setShowRegModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Walk-in Patient</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={dashData?.totalToday || 0} icon={Calendar} color="blue" />
        <StatCard title="Waiting Patients" value={dashData?.waitingCount || 0} icon={Clock} color="amber" />
        <StatCard title="Consultations Completed" value={dashData?.completedCount || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending Invoices" value={dashData?.pendingBillsCount || 0} icon={CreditCard} color="teal" />
      </div>

      {/* Doctor Queues Status Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Doctor Live Queues Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dashData?.doctorsStatus?.map((doc: any) => (
            <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">{doc.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {doc.available ? 'Available' : 'Off duty'}
                </span>
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">{doc.specialization}</p>
              <div className="p-2 bg-white rounded-xl text-xs font-bold text-slate-800 flex justify-between border border-slate-200/60">
                <span>Active Queue:</span>
                <span className="text-teal-600 font-extrabold">{doc.queueCount} patients</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">Today's Appointment Log</h3>
          <Link to="/receptionist/billing" className="text-xs font-bold text-teal-600 hover:underline">
            Manage Billing
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {dashData?.todayAppointments?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled today</p>
          ) : (
            dashData?.todayAppointments?.map((apt: any) => (
              <div key={apt.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-900">{apt.patientName}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Token #{apt.tokenNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Doctor: {apt.doctorName} • Slot: {apt.appointmentTime}
                  </p>
                </div>
                <Badge status={apt.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Register Patient Modal */}
      <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title="Register Walk-in Patient">
        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email</label>
            <input
              type="email"
              required
              value={patientForm.email}
              onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Phone</label>
              <input
                type="text"
                required
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Blood Group</label>
              <select
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-colors shadow-md"
          >
            Register Patient
          </button>
        </form>
      </Modal>
    </div>
  );
};
