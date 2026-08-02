import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Activity, Calendar, Clock, PlusCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { LiveQueueCard } from '../../components/queue/LiveQueueCard';

export const PatientLiveQueue: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.get<Appointment[]>('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter active or today's appointments
  const activeAppointments = appointments.filter((a) =>
    ['APPROVED', 'IN_PROGRESS', 'PENDING'].includes(a.status)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-extrabold border border-teal-200">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Core Differentiator: Live Sync Queue</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Smart Live Token Queue Tracking
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track your exact queue position, currently serving token, and real-time wait estimation.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 text-white font-extrabold text-xs rounded-xl hover:bg-teal-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : activeAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="inline-flex p-4 bg-teal-50 text-teal-600 rounded-2xl">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Active Queue Tokens Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have an active appointment token in waiting. Book an appointment to get your live token card here.
          </p>
          <Link
            to="/patient/book"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeAppointments.map((apt) => (
            <LiveQueueCard key={apt.id} appointmentId={apt.id} onRefresh={fetchAppointments} />
          ))}
        </div>
      )}
    </div>
  );
};
