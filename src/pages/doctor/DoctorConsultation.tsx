import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Stethoscope,
  FileText,
  Plus,
  Trash2,
  Activity,
  CheckCircle2,
  AlertCircle,
  History,
  Download,
} from 'lucide-react';
import { api } from '../../services/api';
import { Appointment, MedicalRecord, PrescriptionMedicine } from '../../types';

export const DoctorConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([]);

  // Form states
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [temp, setTemp] = useState('98.6 °F');
  const [pulse, setPulse] = useState('72 bpm');

  // Medicines list for prescription
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      medicineName: 'Amoxicillin 500mg',
      dosage: '500 mg',
      frequency: '1-0-1 (After meals)',
      duration: '5 Days',
      instructions: 'Take after meals with water',
    },
  ]);

  // Lab Test request
  const [orderLabTest, setOrderLabTest] = useState(false);
  const [labTestName, setLabTestName] = useState('Complete Blood Count (CBC) & Lipid Profile');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      api.get<Appointment>(`/appointments/${appointmentId}`)
        .then((apt) => {
          setAppointment(apt);
          setSymptoms(apt.reason || '');
          return api.get<MedicalRecord[]>(`/medical-records/patient/${apt.patientId}`);
        })
        .then(setPatientHistory)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [appointmentId]);

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        medicineName: '',
        dosage: '250 mg',
        frequency: '1-0-1 (After meals)',
        duration: '5 Days',
        instructions: '',
      },
    ]);
  };

  const removeMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setError(null);
    setSubmitting(true);

    try {
      // 1. Save EMR Medical Record
      const medRecRes = await api.post<MedicalRecord>('/medical-records', {
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        symptoms,
        diagnosis,
        notes,
        vitals: {
          bloodPressure: bp,
          temperature: temp,
          pulseRate: pulse,
        },
      });

      // 2. Save Prescription if medicines exist
      if (medicines.length > 0 && medicines[0].medicineName.trim()) {
        await api.post('/prescriptions', {
          patientId: appointment.patientId,
          medicalRecordId: medRecRes.id,
          appointmentId: appointment.id,
          diagnosis,
          medicines,
          additionalNotes: notes,
        });
      }

      // 3. Order Lab test if requested
      if (orderLabTest && labTestName.trim()) {
        await api.post('/lab-tests', {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          testName: labTestName,
        });
      }

      // 4. Generate bill
      await api.post('/bills', {
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        consultationFee: appointment.consultationFee,
        medicineCharges: medicines.length * 20,
        labCharges: orderLabTest ? 75 : 0,
      });

      // 5. Update appointment status to COMPLETED
      await api.patch(`/appointments/${appointment.id}/status`, { status: 'COMPLETED' });

      setSuccess(true);
      setTimeout(() => {
        navigate('/doctor/queue');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit consultation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !appointment) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-xs rounded-md">
              Token #{appointment.tokenNumber}
            </span>
            <span className="text-xs font-bold text-teal-400 uppercase">Consultation Workspace</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">{appointment.patientName}</h1>
          <p className="text-xs text-slate-300">
            Phone: {appointment.patientPhone} • Slot: {appointment.appointmentTime}
          </p>
        </div>

        <button
          onClick={() => navigate('/doctor/queue')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl border border-white/20 transition-colors"
        >
          Return to Queue Room
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-200" />
          <span className="font-bold text-sm">
            Consultation completed successfully! Redirecting to Doctor Queue...
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCompleteConsultation} className="space-y-8">
        {/* Vitals Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Patient Vitals Logging</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Temperature</label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pulse Rate</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Symptoms & Diagnosis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Symptoms & Clinical Diagnosis</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Symptoms Reported</label>
              <textarea
                rows={3}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Patient complains of..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              ></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Doctor Diagnosis</label>
              <textarea
                rows={3}
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Clinical evaluation..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Multi-medicine Prescription Writer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Prescribe Medications</span>
            </h3>
            <button
              type="button"
              onClick={addMedicineRow}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 font-bold text-xs rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">Medicine #{idx + 1}</span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={med.medicineName}
                      onChange={(e) => updateMedicine(idx, 'medicineName', e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 500 mg"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                      placeholder="e.g. 1-0-1 (After food)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 Days"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Test Order Checkbox */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="orderLab"
              checked={orderLabTest}
              onChange={(e) => setOrderLabTest(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300"
            />
            <label htmlFor="orderLab" className="font-bold text-xs text-slate-800 cursor-pointer">
              Request Lab Test / Diagnostic Investigation
            </label>
          </div>

          {orderLabTest && (
            <input
              type="text"
              value={labTestName}
              onChange={(e) => setLabTestName(e.target.value)}
              placeholder="Enter lab test name..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 mt-2"
            />
          )}
        </div>

        {/* Doctor Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
            Additional Clinical Advice & Follow-up Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Follow-up in 2 weeks, diet restrictions..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || success}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl transition-colors shadow-xl flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{submitting ? 'Submitting Record & Billing...' : 'Complete Consultation & Issue Rx'}</span>
        </button>
      </form>
    </div>
  );
};
