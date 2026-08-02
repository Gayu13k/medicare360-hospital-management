import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { Department, DoctorProfile, Appointment } from '../../types';

export const PatientBookAppointment: React.FC = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00');
  const [reason, setReason] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    Promise.all([api.get<Department[]>('/departments'), api.get<DoctorProfile[]>('/doctors')])
      .then(([depts, docs]) => {
        setDepartments(depts);
        setDoctors(docs);
        if (depts.length > 0) setSelectedDeptId(depts[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors = doctors.filter((doc) => doc.departmentId === selectedDeptId);

  useEffect(() => {
    if (filteredDoctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(filteredDoctors[0].id);
    }
  }, [selectedDeptId, filteredDoctors, selectedDoctorId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post<Appointment>('/appointments', {
        doctorId: selectedDoctorId,
        departmentId: selectedDeptId,
        appointmentDate,
        appointmentTime,
        reason: reason || 'Routine Medical Checkup',
      });

      setBookedAppointment(res);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Time slots list
  const availableSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-extrabold border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Instant Token Generation</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
          Book Doctor Appointment
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Select department, doctor, and time slot to receive your live queue token.
        </p>
      </div>

      {/* Success Confirmation Card */}
      {bookedAppointment ? (
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-4 bg-white/20 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-200">
              Appointment Confirmed
            </span>
            <h2 className="text-3xl font-black mt-1">Your Live Token is #{bookedAppointment.tokenNumber}</h2>
            <p className="text-xs text-teal-100 max-w-md mx-auto mt-2">
              Appointment scheduled with <strong>{bookedAppointment.doctorName}</strong> on{' '}
              <strong>{bookedAppointment.appointmentDate}</strong> at{' '}
              <strong>{bookedAppointment.appointmentTime}</strong>.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-xs font-medium max-w-md mx-auto grid grid-cols-2 gap-4">
            <div>
              <span className="opacity-75 block text-[10px] uppercase">Department</span>
              <span className="font-bold text-sm">{bookedAppointment.departmentName}</span>
            </div>
            <div>
              <span className="opacity-75 block text-[10px] uppercase">Consultation Fee</span>
              <span className="font-bold text-sm">${bookedAppointment.consultationFee}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-2">
            <button
              onClick={() => navigate('/patient/live-queue')}
              className="px-6 py-3 bg-white text-teal-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
            >
              Track Live Token Queue Now
            </button>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="px-6 py-3 bg-teal-800/60 hover:bg-teal-800 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Appointment Booking Form */
        <form onSubmit={handleBook} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Department Selection */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>1. Select Hospital Department</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setSelectedDoctorId('');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedDeptId === dept.id
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs font-bold'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{dept.name}</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                    {dept.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Doctor Selection */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-3 flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>2. Select Specialist Doctor</span>
            </label>
            {filteredDoctors.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl">
                No doctors available in this department.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                      selectedDoctorId === doc.id
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={doc.profileImage}
                      alt={doc.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{doc.name}</p>
                      <p className="text-[11px] text-teal-700 font-semibold">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Fee: ${doc.consultationFee} • {doc.experience} yrs exp
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Date & Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2 flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <span>3. Appointment Date</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>4. Select Time Slot</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setAppointmentTime(slot)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors ${
                      appointmentTime === slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
              Reason for Consultation (Symptoms / Medical Notes)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe symptoms, e.g. chest discomfort, routine checkup, persistent headache..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !selectedDoctorId}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Creating Token & Booking...' : 'Confirm Appointment & Generate Token'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
