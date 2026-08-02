import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  PlusCircle,
  Activity,
  History,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LiveQueueCard } from '../../components/queue/LiveQueueCard';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { PrescriptionPDFModal } from '../../components/common/PrescriptionPDFModal';
import { BillInvoiceModal } from '../../components/common/BillInvoiceModal';
import { Prescription, Bill } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user, patientProfile } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected modals
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchDashboard = async () => {
    try {
      const data = await api.get('/dashboard/patient');
      setDashData(data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        <div className="h-8 w-1/4 bg-white/10 rounded-xl animate-pulse"></div>
        <div className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/10"></div>
      </div>
    );
  }

  const activeApt = dashData?.activeAppointment;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-zinc-100">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-2xl gold-glow">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">Patient Portal</span>
          <h1 className="text-2xl font-serif font-bold tracking-wide text-white mt-1">
            Welcome back, {patientProfile?.name || user?.name}!
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Blood Group: <strong className="text-white font-medium">{patientProfile?.bloodGroup || 'O+'}</strong> • Phone:{' '}
            <strong className="text-white font-medium">{patientProfile?.phone || 'N/A'}</strong>
          </p>
        </div>

        <Link
          to="/patient/book"
          className="inline-flex items-center space-x-2 px-5 py-3 bg-[#C5A059] hover:bg-[#b08d47] text-black font-semibold text-xs rounded-full transition-all shadow-lg shadow-[#C5A059]/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Prominent Smart Live Token Queue Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#C5A059]" />
            <span>Active Live Queue Tracker</span>
          </h2>
          {activeApt && (
            <Link
              to="/patient/live-queue"
              className="text-xs font-semibold text-[#C5A059] hover:underline flex items-center space-x-1"
            >
              <span>Full Queue View</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {activeApt ? (
          <LiveQueueCard appointmentId={activeApt.id} onRefresh={fetchDashboard} />
        ) : (
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 text-center space-y-3">
            <div className="inline-flex p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-2xl border border-[#C5A059]/30">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-white text-base">No Active Appointments Today</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-light">
              You do not have any active doctor tokens in queue right now. Book an appointment to get an instant live token number.
            </p>
            <Link
              to="/patient/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C5A059] text-black font-semibold text-xs rounded-full hover:bg-[#b08d47] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visits"
          value={dashData?.totalAppointments || 0}
          icon={Calendar}
          subtitle="Consultation history"
          color="blue"
        />
        <StatCard
          title="Prescriptions"
          value={dashData?.totalPrescriptions || 0}
          icon={FileText}
          subtitle="Digital Rx records"
          color="teal"
        />
        <StatCard
          title="Hospital Bills"
          value={dashData?.totalBills || 0}
          icon={CreditCard}
          subtitle={`${dashData?.pendingBillsCount || 0} pending payment`}
          color="amber"
        />
        <StatCard
          title="Medical Health Profile"
          value={patientProfile?.gender || 'Active'}
          icon={History}
          subtitle={`DOB: ${patientProfile?.dateOfBirth || 'N/A'}`}
          color="emerald"
        />
      </div>

      {/* Recent Prescriptions & Consultations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <div className="bg-[#121212] rounded-3xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif font-bold text-sm text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>Recent Prescriptions</span>
            </h3>
            <Link
              to="/patient/prescriptions"
              className="text-xs font-semibold text-[#C5A059] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {dashData?.recentPrescriptions?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center font-light">No prescriptions issued yet</p>
            ) : (
              dashData?.recentPrescriptions?.map((p: Prescription) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrescription(p)}
                  className="p-3.5 bg-[#18181a] hover:bg-[#C5A059]/10 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-xs text-white group-hover:text-[#E5C278]">{p.doctorName}</p>
                    <p className="text-[11px] text-zinc-400 font-light">{p.diagnosis}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{p.date}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#E5C278] bg-[#C5A059]/20 px-3 py-1 rounded-full border border-[#C5A059]/30">
                    View PDF
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Appointments List */}
        <div className="bg-[#121212] rounded-3xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif font-bold text-sm text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <span>Recent Consultations</span>
            </h3>
            <Link to="/patient/appointments" className="text-xs font-semibold text-[#C5A059] hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {dashData?.recentAppointments?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center font-light">No consultation history</p>
            ) : (
              dashData?.recentAppointments?.map((apt: any) => (
                <div
                  key={apt.id}
                  className="p-3.5 bg-[#18181a] rounded-2xl border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{apt.doctorName}</span>
                      <span className="text-[10px] text-[#C5A059] font-mono font-bold">Token #{apt.tokenNumber}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-light">{apt.departmentName} • {apt.appointmentDate} at {apt.appointmentTime}</p>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prescription PDF Modal */}
      <PrescriptionPDFModal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />

      {/* Bill Invoice Modal */}
      <BillInvoiceModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onPaymentSuccess={fetchDashboard}
      />
    </div>
  );
};

