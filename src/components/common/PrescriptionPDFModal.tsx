import React from 'react';
import { Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Prescription } from '../../types';
import { Modal } from './Modal';

interface PrescriptionPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export const PrescriptionPDFModal: React.FC<PrescriptionPDFModalProps> = ({
  isOpen,
  onClose,
  prescription,
}) => {
  if (!prescription) return null;

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICARE360 HOSPITAL', 15, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Healthcare & Patient Care System', 15, 26);

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL PRESCRIPTION', 15, 48);

    // Patient & Doctor Info Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 54, 180, 42, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient Name: ${prescription.patientName}`, 20, 64);
    doc.text(`Date: ${prescription.date}`, 130, 64);

    doc.setFont('helvetica', 'normal');
    doc.text(`Prescribed By: ${prescription.doctorName}`, 20, 72);
    doc.text(`Specialization: ${prescription.doctorSpecialization}`, 20, 80);
    doc.text(`Prescription ID: #${prescription.id}`, 130, 72);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 88);

    // Rx Symbol
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136); // teal-600
    doc.text('Rx', 15, 110);

    // Medicines Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    let y = 122;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, 114, 180, 8, 'F');
    doc.text('Medicine Name', 18, 119.5);
    doc.text('Dosage', 85, 119.5);
    doc.text('Frequency', 120, 119.5);
    doc.text('Duration', 165, 119.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    prescription.medicines.forEach((med, idx) => {
      doc.text(`${idx + 1}. ${med.medicineName}`, 18, y);
      doc.text(med.dosage, 85, y);
      doc.text(med.frequency, 120, y);
      doc.text(med.duration, 165, y);

      if (med.instructions) {
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`   Note: ${med.instructions}`, 18, y);
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
      }

      y += 10;
    });

    if (prescription.additionalNotes) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Instructions:', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.additionalNotes, 15, y);
    }

    // Doctor Signature Line
    doc.setLineWidth(0.5);
    doc.line(130, 250, 190, 250);
    doc.setFont('helvetica', 'bold');
    doc.text(prescription.doctorName, 130, 256);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Authorized Doctor Signature', 130, 262);

    doc.save(`Prescription_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.date}.pdf`);
  };

  const printPrescription = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Medical Prescription" maxWidth="2xl">
      <div className="space-y-6">
        {/* Prescription Header */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">MEDICARE360 HEALTHCARE</h2>
            <p className="text-xs text-slate-300">Prescription ID: #{prescription.id}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-400">Rx</span>
          </div>
        </div>

        {/* Doctor & Patient Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Patient Information</p>
            <p className="font-extrabold text-slate-900 text-base mt-0.5">{prescription.patientName}</p>
            <p className="text-xs text-slate-600">Diagnosis: {prescription.diagnosis}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Prescribing Doctor</p>
            <p className="font-extrabold text-slate-900 text-base mt-0.5">{prescription.doctorName}</p>
            <p className="text-xs text-slate-600">{prescription.doctorSpecialization}</p>
            <p className="text-xs text-slate-500 mt-1">Date: {prescription.date}</p>
          </div>
        </div>

        {/* Medicines List */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Prescribed Medications ({prescription.medicines.length})</span>
          </h4>
          <div className="space-y-3">
            {prescription.medicines.map((med, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {index + 1}. {med.medicineName} <span className="text-xs font-semibold text-teal-600">({med.dosage})</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">Frequency: {med.frequency}</p>
                  {med.instructions && (
                    <p className="text-xs text-slate-500 italic mt-0.5">Note: {med.instructions}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                    Duration: {med.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prescription.additionalNotes && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
            <span className="font-bold">Doctor Notes:</span> {prescription.additionalNotes}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            onClick={printPrescription}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center space-x-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
