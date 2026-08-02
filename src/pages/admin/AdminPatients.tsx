import React, { useEffect, useState } from 'react';
import { Users, Search, History } from 'lucide-react';
import { api } from '../../services/api';
import { PatientProfile, MedicalRecord } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    api.get<PatientProfile[]>('/patients')
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewRecords = async (patient: PatientProfile) => {
    setSelectedPatient(patient);
    try {
      const recs = await api.get<MedicalRecord[]>(`/medical-records/patient/${patient.id}`);
      setRecords(recs);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient EMR Records Directory</h1>
        <p className="text-xs text-slate-500 font-medium">Search patients and inspect electronic medical records.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, phone, or email..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Patient Name</th>
              <th className="px-4 py-3">Gender / DOB</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Blood Group</th>
              <th className="px-4 py-3 text-right">EMR History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-extrabold text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {p.gender} • {p.dateOfBirth}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.phone} <br />
                  <span className="text-[10px] text-slate-400">{p.email}</span>
                </td>
                <td className="px-4 py-3 font-bold text-rose-700 bg-rose-50/40 inline-block my-2 px-2 rounded">
                  {p.bloodGroup}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleViewRecords(p)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-teal-700 font-bold rounded-lg border border-slate-200 text-[11px]"
                  >
                    View Clinical EMR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMR Records Modal */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`EMR History: ${selectedPatient?.name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong>Phone:</strong> {selectedPatient?.phone}</p>
            <p><strong>Blood Group:</strong> {selectedPatient?.bloodGroup}</p>
            <p><strong>Pre-existing Conditions:</strong> {selectedPatient?.existingDiseases || 'None'}</p>
          </div>

          <h4 className="font-extrabold text-xs text-slate-900 uppercase">Consultation Records ({records.length})</h4>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {records.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No consultation records recorded.</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-900">{r.doctorName} — {r.appointmentDate}</p>
                  <p className="text-teal-800 font-extrabold">Diagnosis: {r.diagnosis}</p>
                  <p className="text-slate-600">Symptoms: {r.symptoms}</p>
                  {r.notes && <p className="text-slate-500 italic">Doctor Note: {r.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
