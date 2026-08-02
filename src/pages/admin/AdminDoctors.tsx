import React, { useEffect, useState } from 'react';
import { Stethoscope, PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { DoctorProfile, Department } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Add / Edit Doctor Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [docForm, setDocForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    specialization: '',
    departmentId: '',
    consultationFee: 150,
    experience: 5,
    roomNumber: 'Cabin 101',
    availableDays: 'Mon, Tue, Wed, Thu, Fri',
    availableHours: '09:00 - 17:00',
  });

  const fetchData = async () => {
    try {
      const [docsData, deptsData] = await Promise.all([
        api.get<DoctorProfile[]>('/doctors'),
        api.get<Department[]>('/departments'),
      ]);
      setDoctors(docsData);
      setDepartments(deptsData);
      if (deptsData.length > 0) {
        setDocForm((prev) => ({ ...prev, departmentId: deptsData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (docForm.id) {
        // Edit
        await api.put(`/doctors/${docForm.id}`, docForm);
        alert('Doctor updated successfully');
      } else {
        // Create
        await api.post('/doctors', docForm);
        alert('Doctor registered successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save doctor');
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage hospital specialists, consultation fees & schedules.</p>
        </div>

        <button
          onClick={() => {
            setDocForm({
              id: '',
              name: '',
              email: '',
              password: 'password123',
              specialization: 'General Specialist',
              departmentId: departments[0]?.id || '',
              consultationFee: 150,
              experience: 5,
              roomNumber: 'Cabin 101',
              availableDays: 'Mon, Tue, Wed, Thu, Fri',
              availableHours: '09:00 - 17:00',
            });
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Specialist Doctor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor name or specialization..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
        />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={doc.profileImage}
                alt={doc.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{doc.name}</h3>
                <p className="text-xs text-teal-700 font-bold">{doc.specialization}</p>
                <p className="text-[10px] text-slate-500">{doc.departmentName}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-slate-900">${doc.consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room / Cabin:</span>
                <span className="font-bold text-slate-900">{doc.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience:</span>
                <span className="font-bold text-slate-900">{doc.experience} Years</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setDocForm({
                    id: doc.id,
                    name: doc.name,
                    email: doc.email,
                    password: '',
                    specialization: doc.specialization,
                    departmentId: doc.departmentId,
                    consultationFee: doc.consultationFee,
                    experience: doc.experience,
                    roomNumber: doc.roomNumber,
                    availableDays: doc.availableDays,
                    availableHours: doc.availableHours,
                  });
                  setShowModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                Edit Doctor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Doctor Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={docForm.id ? 'Edit Doctor' : 'Register New Doctor'}>
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Doctor Name</label>
            <input
              type="text"
              required
              value={docForm.name}
              onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
              placeholder="Dr. John Smith"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          {!docForm.id && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={docForm.email}
                  onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                  placeholder="doctor@medicare360.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={docForm.password}
                  onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Department</label>
              <select
                value={docForm.departmentId}
                onChange={(e) => setDocForm({ ...docForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Specialization</label>
              <input
                type="text"
                required
                value={docForm.specialization}
                onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Fee ($)</label>
              <input
                type="number"
                value={docForm.consultationFee}
                onChange={(e) => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Experience (Yrs)</label>
              <input
                type="number"
                value={docForm.experience}
                onChange={(e) => setDocForm({ ...docForm, experience: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Room / Cabin</label>
              <input
                type="text"
                value={docForm.roomNumber}
                onChange={(e) => setDocForm({ ...docForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-colors shadow-md"
          >
            Save Specialist Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};
