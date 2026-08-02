import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Bill } from '../../types';
import { BillInvoiceModal } from '../../components/common/BillInvoiceModal';
import { Badge } from '../../components/common/Badge';

export const PatientBills: React.FC = () => {
  const { patientProfile } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBills = async () => {
    if (patientProfile) {
      try {
        const data = await api.get<Bill[]>(`/bills/patient/${patientProfile.id}`);
        setBills(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBills();
  }, [patientProfile]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Invoices & Payments</h1>
        <p className="text-xs text-slate-500 font-medium">
          View itemized medical bills and make instant payments via Razorpay sandbox.
        </p>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No hospital bills found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Hospital Invoice #{bill.id}</p>
                  <p className="text-[11px] text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge status={bill.status} />
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span className="font-bold text-slate-900">${bill.consultationFee.toFixed(2)}</span>
                </div>
                {bill.medicineCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Pharmacy / Medicines:</span>
                    <span className="font-bold text-slate-900">${bill.medicineCharges.toFixed(2)}</span>
                  </div>
                )}
                {bill.labCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Lab Test Charges:</span>
                    <span className="font-bold text-slate-900">${bill.labCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-teal-600">${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBill(bill)}
                className={`w-full py-3 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                  bill.status === 'PENDING'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{bill.status === 'PENDING' ? 'Pay Now via Razorpay' : 'View Paid Invoice'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <BillInvoiceModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onPaymentSuccess={fetchBills}
      />
    </div>
  );
};
