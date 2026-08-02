import React, { useState } from 'react';
import { CreditCard, Printer, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';
import { Bill } from '../../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { api } from '../../services/api';

interface BillInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onPaymentSuccess?: () => void;
}

export const BillInvoiceModal: React.FC<BillInvoiceModalProps> = ({
  isOpen,
  onClose,
  bill,
  onPaymentSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'CASH'>('RAZORPAY_UPI');
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  if (!bill) return null;

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const res = await api.post<{ bill: Bill; payment: any }>('/bills/payments', {
        billId: bill.id,
        paymentMethod,
      });

      setSuccessTxn(res.payment.transactionId);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hospital Bill Invoice #${bill.id}`} maxWidth="xl">
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl">
          <div>
            <h3 className="font-bold text-lg">MEDICARE360 HEALTHCARE</h3>
            <p className="text-xs text-slate-300">Invoice Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge status={successTxn ? 'PAID' : bill.status} />
        </div>

        {/* Patient Details */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Patient Name</p>
            <p className="font-bold text-slate-800">{bill.patientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Email / Contact</p>
            <p className="font-medium text-slate-800">{bill.patientEmail || 'On Record'}</p>
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Service Item</th>
                <th className="px-4 py-3 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="px-4 py-2.5">Doctor Consultation Fee</td>
                <td className="px-4 py-2.5 text-right">${bill.consultationFee.toFixed(2)}</td>
              </tr>
              {bill.medicineCharges > 0 && (
                <tr>
                  <td className="px-4 py-2.5">Pharmacy / Medicine Charges</td>
                  <td className="px-4 py-2.5 text-right">${bill.medicineCharges.toFixed(2)}</td>
                </tr>
              )}
              {bill.labCharges > 0 && (
                <tr>
                  <td className="px-4 py-2.5">Diagnostic & Lab Test Charges</td>
                  <td className="px-4 py-2.5 text-right">${bill.labCharges.toFixed(2)}</td>
                </tr>
              )}
              {bill.roomCharges > 0 && (
                <tr>
                  <td className="px-4 py-2.5">Room & Bed Charges</td>
                  <td className="px-4 py-2.5 text-right">${bill.roomCharges.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2.5">Hospital Facility & Service Charges</td>
                <td className="px-4 py-2.5 text-right">${bill.serviceCharges.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-slate-500 text-xs">GST / Tax</td>
                <td className="px-4 py-2.5 text-right text-slate-500 text-xs">${bill.gst.toFixed(2)}</td>
              </tr>
              {bill.discount > 0 && (
                <tr className="text-emerald-600">
                  <td className="px-4 py-2.5">Discount Applied</td>
                  <td className="px-4 py-2.5 text-right">-${bill.discount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-black text-slate-900 text-base">
              <tr>
                <td className="px-4 py-3">Total Payable Amount</td>
                <td className="px-4 py-3 text-right text-teal-600">${bill.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paid Confirmation Box if paid */}
        {(bill.status === 'PAID' || successTxn) && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Bill Paid Successfully</p>
              <p className="text-xs text-emerald-700">
                Transaction ID: {successTxn || bill.transactionId} ({bill.paymentMethod || 'RAZORPAY'})
              </p>
            </div>
          </div>
        )}

        {/* Razorpay Checkout Payment Box if Pending */}
        {bill.status === 'PENDING' && !successTxn && (
          <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-sm">Secure Razorpay Sandbox Checkout</span>
              </div>
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                Test Mode
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_UPI')}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMethod === 'RAZORPAY_UPI'
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_CARD')}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMethod === 'RAZORPAY_CARD'
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Cash (Counter)
                </button>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{processing ? 'Processing Payment...' : `Pay $${bill.totalAmount.toFixed(2)} Now`}</span>
            </button>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
