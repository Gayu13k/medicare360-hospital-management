import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Building2,
  Stethoscope,
  ClipboardList,
  ShieldCheck,
  UserPlus,
  Clock,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/patients', icon: Users, label: 'Patients & EMR' },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/audit-logs', icon: ShieldCheck, label: 'Audit Logs' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Doctor Overview' },
    { to: '/doctor/queue', icon: Activity, label: 'Live Token Calling' },
    { to: '/doctor/appointments', icon: Calendar, label: "Today's Schedule" },
  ];

  const receptionistLinks = [
    { to: '/receptionist/dashboard', icon: LayoutDashboard, label: 'Desk Overview' },
    { to: '/receptionist/patients', icon: UserPlus, label: 'Register & Search' },
    { to: '/receptionist/appointments', icon: Calendar, label: 'Book Appointment' },
    { to: '/receptionist/billing', icon: CreditCard, label: 'Billing & Payments' },
  ];

  const patientLinks = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/patient/live-queue', icon: Clock, label: 'Live Token Queue' },
    { to: '/patient/book', icon: Calendar, label: 'Book Appointment' },
    { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
    { to: '/patient/medical-history', icon: History, label: 'EMR & Lab Reports' },
    { to: '/patient/prescriptions', icon: FileText, label: 'My Prescriptions' },
    { to: '/patient/bills', icon: CreditCard, label: 'Bills & Payments' },
  ];

  let links = patientLinks;
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'DOCTOR') links = doctorLinks;
  else if (role === 'RECEPTIONIST') links = receptionistLinks;

  return (
    <aside className="w-64 bg-[#0D0D0D] text-zinc-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex border-r border-white/10">
      <div>
        <div className="px-3.5 py-3 mb-4 bg-[#141414] rounded-2xl border border-white/10">
          <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">Active Workspace</p>
          <p className="text-sm font-serif font-bold text-white tracking-wider mt-0.5">{role} PORTAL</p>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-black shadow-md shadow-[#C5A059]/20 font-bold'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Hospital Support Footnote */}
      <div className="p-3 bg-[#121212] rounded-2xl border border-white/10 text-[11px] text-zinc-400">
        <p className="font-bold text-zinc-200">MediCare360 Support</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">Emergency Desk: 24/7 Live Sync</p>
      </div>
    </aside>
  );
};

