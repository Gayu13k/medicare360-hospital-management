import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  Stethoscope,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';

export const LandingPage: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleQuickStart = async (role: Role) => {
    await switchDemoRole(role);
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (role === 'RECEPTIONIST') navigate('/receptionist/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#050505] via-[#0A0A0A] to-[#121212] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/15 text-[#E5C278] border border-[#C5A059]/30 text-xs font-bold mb-6">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="uppercase tracking-widest text-[11px]">Smart Hospital Management & Live Token Queue</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              Eliminate Hospital Wait Uncertainty with <span className="italic text-[#C5A059] font-light">MediCare360</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed font-light">
              MediCare360 empowers patients with real-time token tracking, live queue position, and estimated waiting times — while giving doctors and administrators a unified, refined clinical platform.
            </p>

            {/* Quick Demo Launch Buttons */}
            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                1-Click Quick Demo Access (Explore Any Role):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRoleQuickStart('PATIENT')}
                  className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d47] text-black font-semibold text-xs rounded-full transition-all shadow-lg shadow-[#C5A059]/20 text-center"
                >
                  Patient Portal
                </button>
                <button
                  onClick={() => handleRoleQuickStart('DOCTOR')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-xs rounded-full border border-white/20 transition-all text-center"
                >
                  Doctor Room
                </button>
                <button
                  onClick={() => handleRoleQuickStart('RECEPTIONIST')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-xs rounded-full border border-white/20 transition-all text-center"
                >
                  Desk & Billing
                </button>
                <button
                  onClick={() => handleRoleQuickStart('ADMIN')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-xs rounded-full border border-white/20 transition-all text-center"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlight Graphic */}
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-2xl space-y-4 gold-glow">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#C5A059] animate-pulse" />
                <span className="font-serif font-bold text-sm text-white tracking-wide">Live Patient Token Tracker</span>
              </div>
              <span className="text-[10px] bg-[#C5A059]/20 text-[#E5C278] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#C5A059]/30">
                10s Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 bg-[#C5A059]/10 rounded-2xl border border-[#C5A059]/30">
                <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Your Token</p>
                <p className="text-3xl font-serif font-extrabold text-white mt-1">#3</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Currently Serving</p>
                <p className="text-3xl font-serif font-extrabold text-[#C5A059] mt-1">#2</p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-300">Patients Ahead: <strong className="text-white">1 person</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300">Est. Wait: <strong className="text-white">15 min</strong></span>
              </div>
            </div>

            <div className="p-3 bg-[#C5A059]/15 text-[#E5C278] rounded-xl text-xs flex items-center space-x-2 border border-[#C5A059]/30">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
              <span>Doctor Robert Chen (Cardiology) queue active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Modules Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Complete Hospital Management Capabilities</h2>
          <p className="text-zinc-400 mt-2 text-sm font-light">
            MediCare360 provides end-to-end hospital automation across all clinical and administrative roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 shadow-lg hover:border-[#C5A059]/40 transition-all">
            <div className="w-12 h-12 bg-[#C5A059]/15 text-[#C5A059] rounded-2xl border border-[#C5A059]/30 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Smart Live Queue Tracking</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Auto-generated sequential tokens per doctor per day. Real-time patient waiting time estimation with 10-second polling.
            </p>
          </div>

          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 shadow-lg hover:border-[#C5A059]/40 transition-all">
            <div className="w-12 h-12 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/30 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Digital EMR & Prescriptions</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Doctor consultation room with vitals logging, medical record history, multi-medicine prescription generator, and PDF download.
            </p>
          </div>

          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 shadow-lg hover:border-[#C5A059]/40 transition-all">
            <div className="w-12 h-12 bg-amber-500/15 text-[#C5A059] rounded-2xl border border-amber-500/30 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Automated Billing & Razorpay</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Itemized hospital invoice calculation with GST and discounts. Seamless online sandbox payment drawer and payment logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

