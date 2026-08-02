import React, { useEffect, useState } from 'react';
import { Building2, PlusCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchDepts = async () => {
    try {
      const data = await api.get<Department[]>('/departments');
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', form);
      alert('Department added successfully');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchDepts();
    } catch (err: any) {
      alert(err.message || 'Failed to add department');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Departments</h1>
          <p className="text-xs text-slate-500 font-medium">Manage clinical departments and clinical wings.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{dept.name}</h3>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Active Department
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{dept.description}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Hospital Department">
        <form onSubmit={handleAddDept} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Department Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Neurology"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-colors shadow-md"
          >
            Create Department
          </button>
        </form>
      </Modal>
    </div>
  );
};
