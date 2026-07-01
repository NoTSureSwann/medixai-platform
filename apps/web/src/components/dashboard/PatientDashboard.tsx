"use client";

import React, { useEffect, useState } from "react";
import { PaymentMethod, Invoice, InvoiceStatus } from "@/core/entities/Invoice";
import { Prescription } from "@/core/entities/Prescription";
import { Polyclinic } from "@/core/entities/Polyclinic";
import { Complaint } from "@/core/entities/Complaint";
import { useAuth } from "@/contexts/AuthContext";

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
        <h2 className="text-xl font-bold">Patient Overview</h2>
        <button 
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Download Report (PDF)
        </button>
      </div>

      {/* Ajukan Keluhan Baru */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
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
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Submit Keluhan
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Live Appointment Records</h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${syncStatus.includes('Active') || syncStatus.includes('Updated') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 animate-pulse"></span>
            {syncStatus}
          </span>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div id="patient-report-content" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 bg-gray-50 rounded-lg">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Riwayat Keluhan Saya</h3>
          {complaints.length === 0 && (
            <p className="text-gray-500 text-sm">Tidak ada keluhan aktif.</p>
          )}
          {complaints.map((c) => (
            <div key={c.id} className="p-4 border border-gray-200 rounded-lg mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm text-blue-700">
                  {polyclinics.find(p => p.id === c.polyclinicId)?.name || 'Unknown'}
                </span>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{c.status}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Gejala: {c.symptoms}</p>
              <p className="text-sm text-gray-700 mt-1">{c.complaintText}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">My Prescriptions</h3>
          {prescriptions.length === 0 && (
            <p className="text-gray-500 text-sm">No prescriptions.</p>
          )}
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 border border-gray-200 rounded-lg mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Prescription #{rx.id?.slice(-4)}</span>
                <span className={`text-xs px-2 py-1 rounded ${rx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {rx.status}
                </span>
              </div>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {rx.medicines.map((m, idx) => (
                  <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h3 className="text-lg font-bold mb-4">Complete Payment</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                {showModal.paymentMethod === PaymentMethod.QRIS ? "Scan QR Code" : "Virtual Account Number"}
              </p>
              <div className="font-mono text-xl font-bold break-all">
                {showModal.paymentReference}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => handlePay(showModal.id!)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                Simulate Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
