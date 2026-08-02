import React, { useEffect, useState } from 'react';
import { FileText, History, Stethoscope, Activity, Download, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MedicalRecord, LabTest } from '../../types';

export const PatientMedicalHistory: React.FC = () => {
  const { patientProfile } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (patientProfile) {
      Promise.all([
        api.get<MedicalRecord[]>(`/medical-records/patient/${patientProfile.id}`),
        api.get<LabTest[]>(`/lab-tests/patient/${patientProfile.id}`),
      ])
        .then(([records, tests]) => {
          setMedicalRecords(records);
          setLabTests(tests);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [patientProfile]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Electronic Medical Record (EMR)</h1>
        <p className="text-xs text-slate-500 font-medium">
          View your complete consultation history, doctor notes, diagnosis, and lab test reports.
        </p>
      </div>

      {/* Patient Vitals Overview */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] font-bold text-teal-400 uppercase">Blood Group</p>
          <p className="text-xl font-black mt-0.5">{patientProfile?.bloodGroup || 'O+'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-teal-400 uppercase">Allergies</p>
          <p className="text-xs font-semibold mt-1 text-rose-300">{patientProfile?.allergies || 'None recorded'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-teal-400 uppercase">Pre-existing Diseases</p>
          <p className="text-xs font-semibold mt-1 text-amber-300">{patientProfile?.existingDiseases || 'None'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-teal-400 uppercase">Height / Weight</p>
          <p className="text-xs font-semibold mt-1">
            {patientProfile?.height || 175} cm / {patientProfile?.weight || 70} kg
          </p>
        </div>
      </div>

      {/* Clinical Diagnosis History */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <History className="w-5 h-5 text-teal-600" />
          <span>Consultation Diagnosis History ({medicalRecords.length})</span>
        </h2>

        {medicalRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No medical records available.
          </div>
        ) : (
          medicalRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">{record.doctorName}</p>
                  <p className="text-[11px] text-slate-500">Date: {record.appointmentDate}</p>
                </div>
                <span className="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-lg border border-teal-100">
                  Diagnosis Record
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Symptoms Reported</p>
                  <p className="text-slate-800 font-medium mt-0.5">{record.symptoms}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Clinical Diagnosis</p>
                  <p className="text-teal-900 font-extrabold mt-0.5">{record.diagnosis}</p>
                </div>
              </div>

              {record.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Doctor Notes:</span> {record.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lab Reports Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Diagnostic Lab Test Reports ({labTests.length})</span>
        </h2>

        {labTests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No lab tests ordered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labTests.map((test) => (
              <div key={test.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{test.testName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {test.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">Ordered by: {test.doctorName}</p>
                {test.result && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800">
                    <p className="font-bold text-slate-900 text-[10px] uppercase">Test Results</p>
                    <p className="mt-0.5">{test.result}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
