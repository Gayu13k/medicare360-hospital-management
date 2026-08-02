import React, { useEffect, useState, useCallback } from 'react';
import { Clock, Users, Activity, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Stethoscope } from 'lucide-react';
import { TokenQueueTracking } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';

interface LiveQueueCardProps {
  appointmentId: string;
  onRefresh?: () => void;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({ appointmentId, onRefresh }) => {
  const [tracking, setTracking] = useState<TokenQueueTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchTracking = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.get<TokenQueueTracking>(`/queue/tracking/${appointmentId}`);
      setTracking(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch queue info');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchTracking();
    // 10-second polling requirement for live queue tracking
    const interval = setInterval(() => {
      fetchTracking();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading && !tracking) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <p className="font-medium text-sm">{error || 'Queue status unavailable'}</p>
        </div>
        <button
          onClick={() => fetchTracking(true)}
          className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const isYourTurn = tracking.appointmentStatus === 'IN_PROGRESS';
  const isCompleted = tracking.appointmentStatus === 'COMPLETED';

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all border shadow-xl ${
        isYourTurn
          ? 'bg-gradient-to-br from-[#A4813E] via-[#C5A059] to-[#E5C278] text-black border-[#C5A059] shadow-2xl gold-glow'
          : isCompleted
          ? 'bg-[#121212] text-zinc-300 border-white/10'
          : 'bg-[#121212] text-zinc-100 border-white/10'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-current/10">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-xl ${
              isYourTurn ? 'bg-black/20 text-black' : 'bg-[#C5A059]/15 text-[#C5A059]'
            }`}
          >
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80 font-serif">
                Smart Live Token Queue
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isYourTurn ? 'bg-black/20 text-black border border-black/30' : 'bg-[#C5A059]/20 text-[#E5C278] border border-[#C5A059]/30'
              }`}>
                10s Live Sync
              </span>
            </div>
            <p className="text-sm font-semibold opacity-90">{tracking.doctorName} ({tracking.departmentName})</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge status={tracking.appointmentStatus} />
          <button
            onClick={() => {
              fetchTracking(true);
              if (onRefresh) onRefresh();
            }}
            disabled={refreshing}
            title="Refresh Live Queue"
            className={`p-2 rounded-xl transition-colors ${
              isYourTurn
                ? 'hover:bg-black/10 text-black'
                : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Token Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Patient's Token */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isYourTurn
              ? 'bg-black/15 border-black/20 text-black'
              : 'bg-[#18181a] border-[#C5A059]/30 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Your Token</span>
            <Sparkles className={`w-4 h-4 ${isYourTurn ? 'text-black' : 'text-[#C5A059]'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-serif font-extrabold tracking-tight">#{tracking.patientToken}</span>
          </div>
        </div>

        {/* Currently Serving Token */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isYourTurn
              ? 'bg-black/15 border-black/20 text-black'
              : 'bg-[#18181a] border-white/10 text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Now Serving</span>
            <Stethoscope className={`w-4 h-4 ${isYourTurn ? 'text-black' : 'text-blue-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-serif font-extrabold tracking-tight">
              {tracking.currentToken > 0 ? `#${tracking.currentToken}` : 'Waiting'}
            </span>
          </div>
        </div>

        {/* Patients Ahead */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isYourTurn
              ? 'bg-black/15 border-black/20 text-black'
              : 'bg-[#18181a] border-white/10 text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Patients Ahead</span>
            <Users className={`w-4 h-4 ${isYourTurn ? 'text-black' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-serif font-extrabold tracking-tight">{tracking.patientsAhead}</span>
            <span className="text-xs ml-1 opacity-75">people</span>
          </div>
        </div>

        {/* Estimated Wait */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isYourTurn
              ? 'bg-black/15 border-black/20 text-black'
              : 'bg-[#18181a] border-white/10 text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Est. Waiting</span>
            <Clock className={`w-4 h-4 ${isYourTurn ? 'text-black' : 'text-indigo-400'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-serif font-extrabold tracking-tight">
              {isYourTurn
                ? '0 min'
                : isCompleted
                ? 'Done'
                : `${tracking.estimatedWaitMinutes} min`}
            </span>
          </div>
        </div>
      </div>

      {/* Special Banner Alert for Current Call */}
      {isYourTurn && (
        <div className="mt-5 p-4 rounded-2xl bg-black text-white border border-[#C5A059] shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-[#C5A059] flex-shrink-0" />
            <div>
              <p className="font-serif font-bold text-sm text-[#E5C278] tracking-wide">IT'S YOUR TURN! PLEASE PROCEED NOW</p>
              <p className="text-xs text-zinc-300 font-medium">
                Doctor {tracking.doctorName} is waiting for you in Consultation Room 1.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 flex items-center justify-between text-xs opacity-70">
        <span>Appointment Slot: {tracking.appointmentTime}</span>
        <span>Synced at {lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
