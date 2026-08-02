import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, User, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    bloodGroup: 'O+',
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0A0A0A]">
      <div className="w-full max-w-lg bg-[#121212] rounded-3xl shadow-2xl border border-white/10 overflow-hidden p-8 text-zinc-100 gold-glow">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-2xl mb-3 border border-[#C5A059]/30">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Patient Registration</h2>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Create your account to book appointments and track live token queue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-[#C5A059]"
              >
                <option value="FEMALE" className="bg-[#121212]">Female</option>
                <option value="MALE" className="bg-[#121212]">Male</option>
                <option value="OTHER" className="bg-[#121212]">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#18181a] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-[#C5A059]"
              >
                <option value="O+" className="bg-[#121212]">O+</option>
                <option value="A+" className="bg-[#121212]">A+</option>
                <option value="B+" className="bg-[#121212]">B+</option>
                <option value="AB+" className="bg-[#121212]">AB+</option>
                <option value="O-" className="bg-[#121212]">O-</option>
                <option value="A-" className="bg-[#121212]">A-</option>
                <option value="B-" className="bg-[#121212]">B-</option>
                <option value="AB-" className="bg-[#121212]">AB-</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#C5A059] hover:bg-[#b08d47] text-black font-semibold text-xs rounded-full transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center space-x-2 mt-4"
          >
            <span>{submitting ? 'Registering...' : 'Create Patient Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6 font-light">
          Already registered?{' '}
          <Link to="/login" className="text-[#C5A059] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

