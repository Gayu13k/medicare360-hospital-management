import React, { useEffect, useState } from 'react';
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const COLORS = ['#0d9488', '#0284c7', '#d97706', '#16a34a', '#e11d48'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Admin Control Center</span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">MediCare360 Executive Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">Real-time hospital operations, clinical queues & revenue analytics</p>
        </div>
        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          <DollarSign className="w-5 h-5 text-teal-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-300 uppercase">Monthly Revenue</p>
            <p className="text-lg font-black text-white">${stats?.monthlyRevenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={Users} color="blue" />
        <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon={Stethoscope} subtitle={`${stats?.availableDoctors} available`} color="emerald" />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments || 0} icon={Calendar} subtitle={`${stats?.completedToday} completed`} color="violet" />
        <StatCard title="Today's Revenue" value={`$${stats?.todayRevenue || 0}`} icon={CreditCard} color="teal" />
      </div>

      {/* Recharts Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Appointments Distribution by Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.appointmentsByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.appointmentsByStatus?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
            {stats?.appointmentsByStatus?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments by Department */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Departmental Patient Volume</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.appointmentsByDept || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Payments Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Recent Hospital Payments & Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {stats?.recentPayments?.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{p.transactionId}</td>
                  <td className="px-4 py-3 text-slate-600">{p.patientId}</td>
                  <td className="px-4 py-3 font-extrabold text-teal-700">${p.amount}</td>
                  <td className="px-4 py-3 text-slate-600">{p.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
