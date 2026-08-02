import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Activity, Users, Clock, CheckCircle2, Stethoscope, ArrowRight, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const DoctorDashboard: React.FC = () => {
  const { doctorProfile } = useAuth();
  const navigate = useNavigate();

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      const data = await api.get('/dashboard/doctor');
      setDashData(data);
    } catch (err) {
      console.error('Doctor dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-1/4 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const inProgress = dashData?.inProgress;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Doctor Portal</span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">
            {doctorProfile?.name || 'Doctor Workspace'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {doctorProfile?.specialization} • Department: {doctorProfile?.departmentName || 'Cardiology'}
          </p>
        </div>

        <button
          onClick={() => navigate('/doctor/queue')}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md self-start sm:self-auto"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Live Queue Room</span>
        </button>
      </div>

      {/* Currently Serving Consultation Card */}
      {inProgress ? (
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-teal-200">
              Active Patient Consultation
            </span>
            <h2 className="text-2xl font-black">
              Token #{inProgress.tokenNumber} — {inProgress.patientName}
            </h2>
            <p className="text-xs text-teal-100">Reason: {inProgress.reason}</p>
          </div>

          <button
            onClick={() => navigate(`/doctor/consultation/${inProgress.id}`)}
            className="px-6 py-3 bg-white text-teal-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-slate-100 transition-colors flex items-center space-x-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Open Consultation Workspace</span>
          </button>
        </div>
      ) : (
        <div className="p-6 bg-slate-900 text-white rounded-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-teal-400 animate-pulse" />
            <div>
              <p className="font-bold text-sm">No Patient Currently in Room</p>
              <p className="text-xs text-slate-300">Ready to call the next waiting token?</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/doctor/queue')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors"
          >
            Call Next Patient
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Appointments"
          value={dashData?.totalToday || 0}
          icon={Activity}
          subtitle="Total scheduled"
          color="blue"
        />
        <StatCard
          title="Patients Waiting"
          value={dashData?.waitingCount || 0}
          icon={Users}
          subtitle="In live queue"
          color="amber"
        />
        <StatCard
          title="Consultations Completed"
          value={dashData?.completedCount || 0}
          icon={CheckCircle2}
          subtitle="Today's completed"
          color="emerald"
        />
      </div>

      {/* Waiting Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">
            Waiting Patients Queue ({dashData?.waitingCount || 0})
          </h3>
          <Link to="/doctor/queue" className="text-xs font-bold text-teal-600 hover:underline">
            Manage Queue Room
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {dashData?.waitingAppointments?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No patients waiting in queue</p>
          ) : (
            dashData?.waitingAppointments?.map((apt: any) => (
              <div key={apt.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      Token #{apt.tokenNumber}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Slot: {apt.appointmentTime} • Reason: {apt.reason}</p>
                </div>
                <Badge status={apt.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
