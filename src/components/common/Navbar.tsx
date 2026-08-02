import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Bell,
  LogOut,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Activity,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role, NotificationItem } from '../../types';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      api.get<NotificationItem[]>('/notifications').then(setNotifications).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: { role: Role; label: string; desc: string }[] = [
    { role: 'PATIENT', label: 'Patient Role', desc: 'Book appointments & track live queue' },
    { role: 'DOCTOR', label: 'Doctor Role', desc: 'Call next patient & write prescriptions' },
    { role: 'RECEPTIONIST', label: 'Receptionist Role', desc: 'Manage queue & generate bills' },
    { role: 'ADMIN', label: 'Admin Role', desc: 'Full hospital & doctor management' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-[#A4813E] to-[#C5A059] rounded-xl text-black shadow-lg shadow-[#C5A059]/20">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-serif tracking-widest uppercase text-white font-bold">MediCare360</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A059]/15 text-[#E5C278] border border-[#C5A059]/30 tracking-widest uppercase">
                  SMART HMS
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden md:block">
                Live Token Queue & Hospital Platform
              </p>
            </div>
          </div>

          {/* Right Menu Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] text-zinc-200 text-xs font-semibold rounded-full border border-white/10 transition-all shadow-xs"
                title="Switch Demo Role for Evaluation"
              >
                <UserCheck className="w-4 h-4 text-[#C5A059]" />
                <span className="hidden md:inline text-zinc-400 uppercase tracking-wider text-[10px]">Role: </span>
                <span className="text-[#C5A059] font-bold uppercase tracking-wider text-xs">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#121212] rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                    <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider">1-Click Demo Evaluation</p>
                    <p className="text-[10px] text-zinc-400">Instant switch role & capabilities</p>
                  </div>
                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchDemoRole(item.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#C5A059]/10 transition-colors flex items-center justify-between ${
                        user?.role === item.role ? 'bg-[#C5A059]/15 font-bold text-[#E5C278]' : 'text-zinc-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{item.label}</p>
                        <p className="text-[10px] text-zinc-400 font-normal">{item.desc}</p>
                      </div>
                      {user?.role === item.role && (
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C5A059] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121212] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Hospital Notifications</span>
                    <span className="text-[10px] font-semibold text-[#C5A059]">{unreadCount} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs border-b border-white/5 hover:bg-white/5 transition-colors ${
                          !n.isRead ? 'bg-[#C5A059]/10 font-medium' : ''
                        }`}
                      >
                        <p className="font-bold text-zinc-200">{n.title}</p>
                        <p className="text-zinc-400 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A4813E] to-[#C5A059] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-zinc-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
