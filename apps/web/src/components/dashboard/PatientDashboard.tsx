"use client";

import React, { useEffect, useState } from "react";
import { PaymentMethod, Invoice, InvoiceStatus } from "@/core/entities/Invoice";
import { Prescription } from "@/core/entities/Prescription";
import { Polyclinic } from "@/core/entities/Polyclinic";
import { Complaint } from "@/core/entities/Complaint";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassModal } from "@/components/ui/glass/GlassModal";
import { Activity, Clock, ShieldCheck, FileText, ChevronRight, Download } from "lucide-react";
import { motion } from "framer-motion";

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [appointments, setAppointments] = useState<{ id: string, date: string, time: string, doctor: string, status: string, version: number }[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>("Connecting...");
  
  // Form state
  const [symptoms, setSymptoms] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [selectedPolyclinic, setSelectedPolyclinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<Invoice | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user) return;
      try {
        const [invRes, rxRes, polyRes, compRes] = await Promise.all([
          fetch(`/api/billing/invoices?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
          fetch(`/api/clinical/prescriptions?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
          fetch("/api/clinical/polyclinics"),
          fetch(`/api/clinical/complaints?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
        ]);
        const invData = await invRes.json();
        const rxData = await rxRes.json();
        const polyData = await polyRes.json();
        const compData = await compRes.json();
        
        if (isMounted) {
          setInvoices(invData.invoices || []);
          setPrescriptions(rxData.prescriptions || []);
          setPolyclinics(polyData.polyclinics || []);
          setComplaints(compData.complaints || []);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    };

    setTimeout(() => {
      fetchData();
    }, 0);

    // SSE Setup for Realtime Appointments
    const eventSource = new EventSource('/api/clinical/appointments/sync');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'connected') {
        setSyncStatus('Live Sync Active');
      } else if (data.type === 'APPOINTMENT_UPDATE') {
        // Mocking real-time appointment updates based on the SSE event version
        const newAppointments = [
          { id: 'APT-001', date: new Date().toLocaleDateString(), time: '09:00 AM', doctor: 'Dr. John Doe', status: 'Scheduled', version: data.version },
          { id: 'APT-002', date: new Date(Date.now() + 86400000).toLocaleDateString(), time: '14:30 PM', doctor: 'Dr. Jane Smith', status: 'Confirmed', version: data.version }
        ];
        setAppointments(newAppointments);
        setSyncStatus(`Updated at ${new Date(data.timestamp).toLocaleTimeString()}`);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setSyncStatus('Connection Lost. Retrying...');
      eventSource.close();
      // In a real app, implement a retry mechanism or fallback to polling here
    };

    return () => {
      eventSource.close();
      isMounted = false;
    };
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [invRes, rxRes, polyRes, compRes] = await Promise.all([
        fetch(`/api/billing/invoices?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
        fetch(`/api/clinical/prescriptions?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
        fetch("/api/clinical/polyclinics"),
        fetch(`/api/clinical/complaints?patientId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
      ]);
      const invData = await invRes.json();
      const rxData = await rxRes.json();
      const polyData = await polyRes.json();
      const compData = await compRes.json();
      
      setInvoices(invData.invoices || []);
      setPrescriptions(rxData.prescriptions || []);
      setPolyclinics(polyData.polyclinics || []);
      setComplaints(compData.complaints || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (invoiceId: string) => {
    try {
      await fetch("/api/billing/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || 'mock-patient-token'}`,
        },
        body: JSON.stringify({ invoiceId }),
      });
      setShowModal(null);
      void refreshData(); // Refresh data
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolyclinic || !selectedDoctor) {
      alert("Pilih Poli Klinik dan Dokter terlebih dahulu!");
      return;
    }
    try {
      await fetch("/api/clinical/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || 'mock-patient-token'}`,
        },
        body: JSON.stringify({
          patientId: user?.id || 'mock-patient-id',
          patientName: user?.name || 'John Doe',
          polyclinicId: selectedPolyclinic,
          doctorId: selectedDoctor,
          symptoms,
          complaintText
        }),
      });
      setSymptoms("");
      setComplaintText("");
      setSelectedPolyclinic("");
      setSelectedDoctor("");
      void refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("patient-report-content");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin:       0.5,
      filename:     'patient-medical-report.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-[var(--color-info)]" /> Patient Overview</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
          className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-info)] to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-xl shadow-[var(--color-info)]/30 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export EMR Report
        </motion.button>
      </div>

      {/* Ajukan Keluhan Baru */}
      <GlassCard hoverEffect>
        <h3 className="font-semibold mb-4 text-lg">Ajukan Keluhan Medis (Symptoms & Complaints)</h3>
        <form onSubmit={handleComplaintSubmit} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Poli Klinik</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedPolyclinic}
              onChange={(e) => setSelectedPolyclinic(e.target.value)}
              required
            >
              <option value="">-- Pilih Poli Klinik (16 Penyakit) --</option>
              {polyclinics.map(poly => (
                <option key={poly.id} value={poly.id}>{poly.name} - {poly.diseaseCategory}</option>
              ))}
            </select>
          </div>
          {selectedPolyclinic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Dokter</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
              >
                <option value="">-- Pilih Dokter Spesialis --</option>
                {polyclinics.find(p => p.id === selectedPolyclinic)?.doctors?.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gejala yang dialami</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Demam, Batuk, Pusing"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detail Keluhan</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Jelaskan secara detail keluhan anda..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-[var(--color-info)] text-white rounded-lg font-medium hover:opacity-90 transition-all focus-ring shadow-lg shadow-[var(--color-info)]/20">
            Submit Keluhan
          </button>
        </form>
      </GlassCard>

      <GlassCard hoverEffect>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Clock className="text-[var(--color-warning)]" /> Live Appointment Records</h3>
          <GlassBadge variant={syncStatus.includes('Active') || syncStatus.includes('Updated') ? "success" : "emergency"}>
            <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 animate-pulse"></span>
            {syncStatus}
          </GlassBadge>
        </div>
        
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No appointments scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{apt.id}</td>
                    <td className="px-4 py-3">{apt.date} at {apt.time}</td>
                    <td className="px-4 py-3">{apt.doctor}</td>
                    <td className="px-4 py-3">
                      <GlassBadge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                        {apt.status}
                      </GlassBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <div id="patient-report-content" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="text-[var(--color-info)] h-5 w-5" /> Riwayat Keluhan Saya</h3>
          {complaints.length === 0 && (
            <p className="text-gray-500 text-sm">Tidak ada keluhan aktif.</p>
          )}
          {complaints.map((c) => (
            <div key={c.id} className="p-4 border border-gray-200 rounded-lg mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm text-blue-700">
                  {polyclinics.find(p => p.id === c.polyclinicId)?.name || 'Unknown'}
                </span>
                <GlassBadge variant={c.status === 'SUBMITTED' ? 'warning' : 'success'}>{c.status}</GlassBadge>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Gejala: {c.symptoms}</p>
              <p className="text-sm mt-1">{c.complaintText}</p>
            </div>
          ))}
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4">My Pending Bills</h3>
          {invoices.filter(i => i.status === InvoiceStatus.UNPAID).length === 0 && (
            <p className="text-gray-500 text-sm">No pending bills.</p>
          )}
          {invoices.filter(i => i.status === InvoiceStatus.UNPAID).map((invoice) => (
            <div key={invoice.id} className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-red-900">Hospital Bill</p>
                <p className="text-sm text-red-700">Rp {invoice.amount.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">Method: {invoice.paymentMethod}</p>
              </div>
              <button 
                onClick={() => setShowModal(invoice)}
                className="px-4 py-2 bg-[var(--color-emergency)] text-white rounded-lg text-sm font-medium hover:opacity-90 shadow-lg shadow-[var(--color-emergency)]/20 transition-all focus-ring"
              >
                Pay Now
              </button>
            </div>
          ))}
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="text-[var(--color-success)] h-5 w-5" /> My Prescriptions</h3>
          {prescriptions.length === 0 && (
            <p className="text-gray-500 text-sm">No prescriptions.</p>
          )}
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 border border-gray-200 rounded-lg mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Prescription #{rx.id?.slice(-4)}</span>
                <GlassBadge variant={rx.status === 'PENDING' ? 'warning' : 'success'}>
                  {rx.status}
                </GlassBadge>
              </div>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {rx.medicines.map((m, idx) => (
                  <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity})</li>
                ))}
              </ul>
            </div>
          ))}
        </GlassCard>
      </div>

      <GlassModal 
        isOpen={!!showModal} 
        onClose={() => setShowModal(null)}
        title="Complete Payment"
      >
        {showModal && (
          <div className="space-y-4">
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl mb-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {showModal.paymentMethod === PaymentMethod.QRIS ? "Scan QR Code" : "Virtual Account Number"}
              </p>
              <div className="font-mono text-xl font-bold break-all">
                {showModal.paymentReference}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2 border border-[var(--glass-border)] rounded-lg font-medium hover:bg-[var(--glass-border)] transition-colors focus-ring"
              >
                Cancel
              </button>
              <button 
                onClick={() => handlePay(showModal.id!)}
                className="flex-1 px-4 py-2 bg-[var(--color-success)] text-white rounded-lg font-medium hover:opacity-90 shadow-lg shadow-[var(--color-success)]/20 transition-all focus-ring"
              >
                Simulate Payment
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
