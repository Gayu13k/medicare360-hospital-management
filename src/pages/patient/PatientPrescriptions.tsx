import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Prescription } from '../../types';
import { PrescriptionPDFModal } from '../../components/common/PrescriptionPDFModal';

export const PatientPrescriptions: React.FC = () => {
  const { patientProfile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (patientProfile) {
      api.get<Prescription[]>(`/prescriptions/patient/${patientProfile.id}`)
        .then(setPrescriptions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [patientProfile]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Digital Prescriptions</h1>
        <p className="text-xs text-slate-500 font-medium">
          Access all prescriptions issued by your doctors and download official PDFs.
        </p>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No prescriptions issued yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">{p.doctorName}</p>
                  <p className="text-[11px] text-teal-700 font-semibold">{p.doctorSpecialization}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{p.date}</span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis</p>
                <p className="text-xs font-extrabold text-slate-800 mt-0.5">{p.diagnosis}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Prescribed Medicines ({p.medicines.length})
                </p>
                <div className="space-y-1.5">
                  {p.medicines.map((m, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg text-xs flex justify-between">
                      <span className="font-bold text-slate-800">{m.medicineName} ({m.dosage})</span>
                      <span className="text-slate-500">{m.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPrescription(p)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>View & Download Official PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <PrescriptionPDFModal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />
    </div>
  );
};
