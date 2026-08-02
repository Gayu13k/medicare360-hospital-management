import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get<AuditLog[]>('/system/audit-logs')
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Security & Audit Logs</h1>
        <p className="text-xs text-slate-500 font-medium">Compliance log of user actions, queue state modifications, and billing activity.</p>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{log.userName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-teal-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
