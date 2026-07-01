"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Complaint } from "@/core/entities/Complaint";
import { Prescription } from "@/core/entities/Prescription";

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new prescription
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user) return;
      try {
        const [compRes, rxRes] = await Promise.all([
          fetch(`/api/clinical/complaints?doctorId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
          fetch(`/api/clinical/prescriptions?doctorId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } })
        ]);
        const compData = await compRes.json();
        const rxData = await rxRes.json();
        
        if (isMounted) {
          setComplaints(compData.complaints || []);
          setPrescriptions(rxData.prescriptions || []);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    };
    
    // Defer the execution to avoid the synchronous setState warning in effect
    setTimeout(() => {
      fetchData();
    }, 0);

    return () => { isMounted = false; };
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [compRes, rxRes] = await Promise.all([
        fetch(`/api/clinical/complaints?doctorId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } }),
        fetch(`/api/clinical/prescriptions?doctorId=${user.id}`, { headers: { Authorization: `Bearer ${user.id}` } })
      ]);
      const compData = await compRes.json();
      const rxData = await rxRes.json();
      
      setComplaints(compData.complaints || []);
      setPrescriptions(rxData.prescriptions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !user) return;
    setSubmitting(true);
    
    try {
      await fetch("/api/clinical/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          patientId: selectedComplaint.patientId,
          patientName: selectedComplaint.patientName,
          doctorId: user.id,
          doctorName: user.name,
          hospitalId: user.hospitalId || "HOSPITAL-1",
          medicines: [{
            medicineName: medicine,
            dosage,
            quantity: parseInt(quantity, 10),
          }]
        }),
      });
      setSelectedComplaint(null);
      setMedicine("");
      setDosage("");
      setQuantity("");
      alert("Prescription sent to Pharmacy!");
      void refreshData();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleValidate = async (prescriptionId: string) => {
    try {
      await fetch(`/api/clinical/prescriptions/${prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ validationStatus: "VALIDATED" }),
      });
      alert("Prescription Validated!");
      void refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Doctor Workspace</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-4 text-lg">Incoming Patient Appointments</h3>
            {complaints.length === 0 ? (
              <p className="text-gray-500 text-sm">No incoming patients.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map(c => (
                  <div key={c.id} className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-900">{c.patientName || c.patientId}</h4>
                      <span className="text-xs bg-white border border-blue-200 px-2 py-1 rounded">{c.status}</span>
                    </div>
                    <p className="text-sm text-gray-700"><strong>Symptoms:</strong> {c.symptoms}</p>
                    <p className="text-sm text-gray-600 mb-3">{c.complaintText}</p>
                    <button 
                      onClick={() => setSelectedComplaint(c)}
                      className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Diagnose & Prescribe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedComplaint && (
            <div className="bg-white p-6 rounded-lg border border-blue-300 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Prescribe for {selectedComplaint.patientName || selectedComplaint.patientId}</h3>
              <form onSubmit={handlePrescribe} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Requested Medicine</label>
                  <input 
                    type="text" 
                    value={medicine} onChange={e => setMedicine(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700">Dosage</label>
                    <input 
                      type="text" 
                      value={dosage} onChange={e => setDosage(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700">Qty</label>
                    <input 
                      type="number" 
                      value={quantity} onChange={e => setQuantity(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Draft to Pharmacy"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4 text-lg">Pharmacy Validation Inbox</h3>
          <p className="text-xs text-gray-500 mb-4">Prescriptions that Pharmacy has inputted and require your final validation.</p>
          
          {prescriptions.filter(r => r.validationStatus === "WAITING_DOCTOR_VALIDATION").length === 0 ? (
            <p className="text-gray-500 text-sm">No prescriptions waiting for validation.</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.filter(r => r.validationStatus === "WAITING_DOCTOR_VALIDATION").map(rx => (
                <div key={rx.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">For Patient: {rx.patientName || rx.patientId}</h4>
                  
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">You Requested:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      {rx.medicines.map((m, idx) => (
                        <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity})</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pharmacy Inputted:</p>
                    <ul className="text-sm text-gray-900 list-disc list-inside font-medium">
                      {rx.pharmacyMedicines?.map((m, idx) => (
                        <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity}) {m.notes ? `- Rp ${m.notes}` : ''}</li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleValidate(rx.id!)}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                  >
                    Validate & Approve Medicine
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
