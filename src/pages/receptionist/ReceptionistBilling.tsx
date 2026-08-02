import React, { useEffect, useState } from 'react';
import { CreditCard, PlusCircle, Search } from 'lucide-react';
import { api } from '../../services/api';
import { Bill, PatientProfile } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { BillInvoiceModal } from '../../components/common/BillInvoiceModal';

export const ReceptionistBilling: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Generate Bill Modal state
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [billForm, setBillForm] = useState({
    patientId: '',
    consultationFee: 150,
    medicineCharges: 0,
    labCharges: 0,
    serviceCharges: 20,
    discount: 0,
  });

  const fetchData = async () => {
    try {
      const [billsData, patientsData] = await Promise.all([
        api.get<Bill[]>('/bills'),
        api.get<PatientProfile[]>('/patients'),
      ]);
      setBills(billsData);
      setPatients(patientsData);
      if (patientsData.length > 0) {
        setBillForm((prev) => ({ ...prev, patientId: patientsData[0].id }));
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

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bills', billForm);
      alert('Hospital invoice generated successfully!');
      setShowGenModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate bill');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Payment Counter</h1>
          <p className="text-xs text-slate-500 font-medium">Generate hospital bills and process cash or online payments.</p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">#{bill.id}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{bill.patientName}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-extrabold text-teal-700">${bill.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge status={bill.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-teal-700 font-bold rounded-lg border border-slate-200 text-[11px]"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Bill Modal */}
      <Modal isOpen={showGenModal} onClose={() => setShowGenModal(false)} title="Generate Hospital Invoice">
        <form onSubmit={handleGenerateBill} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Select Patient</label>
            <select
              value={billForm.patientId}
              onChange={(e) => setBillForm({ ...billForm, patientId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                value={billForm.consultationFee}
                onChange={(e) => setBillForm({ ...billForm, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Medicine Charges ($)</label>
              <input
                type="number"
                value={billForm.medicineCharges}
                onChange={(e) => setBillForm({ ...billForm, medicineCharges: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Lab Charges ($)</label>
              <input
                type="number"
                value={billForm.labCharges}
                onChange={(e) => setBillForm({ ...billForm, labCharges: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Discount ($)</label>
              <input
                type="number"
                value={billForm.discount}
                onChange={(e) => setBillForm({ ...billForm, discount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-colors shadow-md"
          >
            Create Hospital Invoice
          </button>
        </form>
      </Modal>

      <BillInvoiceModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onPaymentSuccess={fetchData}
      />
    </div>
  );
};
