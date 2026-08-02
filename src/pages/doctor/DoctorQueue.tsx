import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  Users,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types';
import { Badge } from '../../components/common/Badge';

export const DoctorQueue: React.FC = () => {
  const { doctorProfile } = useAuth();
  const navigate = useNavigate();

  const [queueData, setQueueData] = useState<{
    currentServing: Appointment | null;
    waitingQueue: Appointment[];
    completedQueue: Appointment[];
    totalAppointments: number;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [callingNext, setCallingNext] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!doctorProfile) return;
    try {
      const data = await api.get<any>(`/queue/doctor/${doctorProfile.id}/today`);
      setQueueData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [doctorProfile]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    if (!doctorProfile) return;
    setCallingNext(true);
    setAnnouncement(null);

    try {
      const res = await api.post<any>(`/queue/doctor/${doctorProfile.id}/next`, {});
      if (res.nextAppointment) {
        setAnnouncement(`Now calling Token #${res.nextAppointment.tokenNumber} (${res.nextAppointment.patientName})`);
      } else {
        setAnnouncement('Queue finished for today!');
      }
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to call next patient');
    } finally {
      setCallingNext(false);
    }
  };

  if (loading || !queueData) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const current = queueData.currentServing;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-extrabold border border-teal-200">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Doctor Live Calling Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Token Queue Calling Room
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Doctor: <strong>{doctorProfile?.name}</strong> • Department: {doctorProfile?.departmentName}
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Announcement Notification */}
      {announcement && (
        <div className="p-4 bg-teal-600 text-white rounded-2xl shadow-lg flex items-center space-x-3 animate-in fade-in">
          <Volume2 className="w-6 h-6 animate-bounce text-teal-200" />
          <span className="font-extrabold text-sm">{announcement}</span>
        </div>
      )}

      {/* CALL NEXT PATIENT Control Station */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <span className="text-xs font-black uppercase tracking-widest text-teal-400">
            Active Consultation Room
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {queueData.waitingQueue.length} patient(s) in queue
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Active Token Details */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Serving Token</p>
            {current ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-black text-teal-400">#{current.tokenNumber}</span>
                  <span className="text-xl font-extrabold text-white">{current.patientName}</span>
                </div>
                <p className="text-xs text-slate-300">
                  Reason: <strong className="text-white">{current.reason}</strong>
                </p>
                <p className="text-xs text-slate-400">Phone: {current.patientPhone}</p>
              </div>
            ) : (
              <p className="text-2xl font-black text-slate-500 mt-2">No Active Token in Room</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCallNext}
              disabled={callingNext || queueData.waitingQueue.length === 0}
              className={`w-full py-5 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center space-x-3 ${
                queueData.waitingQueue.length > 0
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 scale-102 hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Activity className="w-6 h-6 animate-pulse" />
              <span>{callingNext ? 'Calling Next Patient...' : 'CALL NEXT PATIENT'}</span>
            </button>

            {current && (
              <button
                onClick={() => navigate(`/doctor/consultation/${current.id}`)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center space-x-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Open Patient Consultation Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waiting List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-slate-900">
          Waiting Line ({queueData.waitingQueue.length})
        </h3>

        {queueData.waitingQueue.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Queue is clear! No waiting patients.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {queueData.waitingQueue.map((apt, idx) => (
              <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    #{apt.tokenNumber}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Position #{idx + 1}</span>
                </div>
                <p className="font-extrabold text-xs text-slate-900">{apt.patientName}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Slot: {apt.appointmentTime} • {apt.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
