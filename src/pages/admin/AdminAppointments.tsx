import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { Badge } from '../../components/common/Badge';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get<Appointment[]>('/appointments')
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Appointment Registry</h1>
        <p className="text-xs text-slate-500 font-medium">Overview of all appointments across all hospital doctors and departments.</p>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Token #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-black text-teal-700">#{apt.tokenNumber}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{apt.patientName}</td>
                  <td className="px-4 py-3 text-slate-800">{apt.doctorName}</td>
                  <td className="px-4 py-3 text-slate-600">{apt.departmentName}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {apt.appointmentDate} at {apt.appointmentTime}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge status={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
