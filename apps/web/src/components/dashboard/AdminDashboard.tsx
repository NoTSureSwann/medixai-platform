"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Prescription } from "@/core/entities/Prescription";
import { PaymentMethod } from "@/core/entities/Invoice";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/clinical/prescriptions", {
        headers: { Authorization: `Bearer ${user?.id}` },
      });
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  }, [user]);

  const handleGenerateInvoice = async (prescriptionId: string, patientId: string, medicines: any[]) => {
    const totalAmount = medicines.reduce((acc, curr) => acc + parseInt(curr.notes || "0", 10), 0);
    
    try {
      await fetch("/api/billing/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          patientId: patientId,
          prescriptionId,
          amount: totalAmount > 0 ? totalAmount : 50000,
          paymentMethod: PaymentMethod.QRIS
        }),
      });
      
      // Update prescription status to DISPENSED (or billed)
      await fetch(`/api/clinical/prescriptions/${prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ status: "DISPENSED" }),
      });

      alert("Invoice generated and sent to patient!");
      void fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Admin Workspace</h2>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-4">Billing & Invoicing (Awaiting Invoice Generation)</h3>
        <p className="text-xs text-gray-500 mb-4">Review prescriptions validated by doctors and generate invoices for patients.</p>
        
        {prescriptions.filter(rx => rx.validationStatus === 'VALIDATED' && rx.status === 'PENDING').length === 0 && (
          <p className="text-gray-500 text-sm">No pending billing items.</p>
        )}

        <div className="grid gap-4">
          {prescriptions.filter(rx => rx.validationStatus === 'VALIDATED' && rx.status === 'PENDING').map((rx) => (
            <div key={rx.id} className="p-4 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-medium text-sm block mb-1">Prescription #{rx.id?.slice(-4)} for {rx.patientName || rx.patientId}</span>
                <span className="text-xs text-green-700 font-semibold mb-2 block">✓ Validated by {rx.doctorName || rx.doctorId}</span>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {rx.pharmacyMedicines?.map((m, idx) => (
                    <li key={idx}>{m.medicineName} {m.dosage} (x{m.quantity}) - Rp {m.notes || 0}</li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-gray-900 mt-2">
                  Total: Rp {rx.pharmacyMedicines?.reduce((acc, curr) => acc + parseInt(curr.notes || "0", 10), 0).toLocaleString()}
                </p>
              </div>
              
              <button 
                onClick={() => handleGenerateInvoice(rx.id!, rx.patientId, rx.pharmacyMedicines || [])}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Generate Bill (QRIS)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
