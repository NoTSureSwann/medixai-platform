"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Prescription } from "@/core/entities/Prescription";

export const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Pharmacy inputs
  const [medicineInput, setMedicineInput] = useState("");
  const [dosageInput, setDosageInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/clinical/prescriptions", {
          headers: { Authorization: `Bearer ${user?.id || 'mock-pharmacy-token'}` },
        });
        const data = await res.json();
        if (isMounted) {
          setPrescriptions(data.prescriptions || []);
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
    return () => { isMounted = false; };
  }, [user]);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/clinical/prescriptions", {
        headers: { Authorization: `Bearer ${user?.id || 'mock-pharmacy-token'}` },
      });
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToDoctor = async (prescriptionId: string) => {
    if (!medicineInput || !priceInput) return;
    setSubmitting(prescriptionId);
    try {
      await fetch(`/api/clinical/prescriptions/${prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          validationStatus: "WAITING_DOCTOR_VALIDATION",
          pharmacyMedicines: [{
            medicineName: medicineInput,
            dosage: dosageInput,
            quantity: parseInt(quantityInput, 10),
            notes: priceInput // Using notes to store price temporarily
          }]
        }),
      });
      alert("Sent to Doctor for Validation!");
      setMedicineInput("");
      setDosageInput("");
      setQuantityInput("");
      setPriceInput("");
      void refreshData();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pharmacy Workspace</h2>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4">Pending Doctor Prescriptions</h3>
        <p className="text-xs text-gray-500 mb-4">Input actual medicine stock and price, then send to Doctor for validation.</p>
        
        {prescriptions.filter(rx => rx.validationStatus === 'PENDING_PHARMACY' || !rx.validationStatus).length === 0 && (
          <p className="text-gray-500 text-sm">No pending prescriptions from doctors.</p>
        )}

        <div className="grid gap-4">
          {prescriptions.filter(rx => rx.validationStatus === 'PENDING_PHARMACY' || !rx.validationStatus).map((rx) => (
            <div key={rx.id} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <span className="font-medium text-sm block mb-1">Prescription #{rx.id?.slice(-4)} for {rx.patientName || rx.patientId}</span>
                <span className="text-xs text-blue-600 block mb-2">Doctor: {rx.doctorName || rx.doctorId}</span>
                
                <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Doctor Requested:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-3">
                  {rx.medicines.map((m, idx) => (
                    <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity})</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium mb-3">Pharmacy Input</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Actual Medicine/Brand</label>
                    <input 
                      type="text" 
                      value={medicineInput} 
                      onChange={(e) => setMedicineInput(e.target.value)}
                      placeholder={rx.medicines[0]?.medicineName}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700">Dosage</label>
                      <input 
                        type="text" 
                        value={dosageInput} 
                        onChange={(e) => setDosageInput(e.target.value)}
                        placeholder={rx.medicines[0]?.dosage}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-gray-700">Qty</label>
                      <input 
                        type="number" 
                        value={quantityInput} 
                        onChange={(e) => setQuantityInput(e.target.value)}
                        placeholder={rx.medicines[0]?.quantity.toString()}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Price (Rp)</label>
                    <input 
                      type="number" 
                      value={priceInput} 
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => handleSendToDoctor(rx.id!)}
                    disabled={submitting === rx.id}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting === rx.id ? "Sending..." : "Send to Doctor for Validation"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
