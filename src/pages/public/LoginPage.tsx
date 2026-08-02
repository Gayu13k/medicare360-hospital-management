import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, KeyRound, Mail, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetSelect = async (role: Role) => {
    setSubmitting(true);
    try {
      await switchDemoRole(role);
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (role === 'RECEPTIONIST') navigate('/receptionist/dashboard');
      else navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0A0A0A]">
      <div className="w-full max-w-md bg-[#121212] rounded-3xl shadow-2xl border border-white/10 overflow-hidden p-8 text-zinc-100 gold-glow">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-2xl mb-3 border border-[#C5A059]/30">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Sign In to MediCare360</h2>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Smart Hospital Management & Live Token Queue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Preset Role Switcher Buttons */}
        <div className="mb-6 p-4 bg-[#18181a] rounded-2xl border border-white/10">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-300 mb-2.5">
            <UserCheck className="w-4 h-4 text-[#C5A059]" />
            <span className="uppercase tracking-wider text-[11px]">1-Click Demo Evaluation Sign-In</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('PATIENT')}
              className="px-3 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 text-zinc-200 hover:text-[#E5C278] hover:border-[#C5A059]/40 rounded-xl text-xs font-semibold transition-all text-left"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('DOCTOR')}
              className="px-3 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 text-zinc-200 hover:text-[#E5C278] hover:border-[#C5A059]/40 rounded-xl text-xs font-semibold transition-all text-left"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('RECEPTIONIST')}
              className="px-3 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 text-zinc-200 hover:text-[#E5C278] hover:border-[#C5A059]/40 rounded-xl text-xs font-semibold transition-all text-left"
            >
              Receptionist
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('ADMIN')}
              className="px-3 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 text-zinc-200 hover:text-[#E5C278] hover:border-[#C5A059]/40 rounded-xl text-xs font-semibold transition-all text-left"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C5A059] hover:bg-[#b08d47] text-black font-semibold text-xs rounded-full transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6 font-light">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#C5A059] font-semibold hover:underline">
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
};

