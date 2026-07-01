"use client";

import React from "react";
import { UserRole } from "@/core/entities/User";
import { useAuth } from "@/contexts/AuthContext";
import { AIChatbox } from "@/components/chat/AIChatbox";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { PharmacyDashboard } from "@/components/dashboard/PharmacyDashboard";

import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboardContent = () => {
    switch (user.role) {
      case UserRole.ADMIN:
      case UserRole.SUPER_ADMIN: return <AdminDashboard />;
      case UserRole.DOCTOR: return <DoctorDashboard />;
      case UserRole.PHARMACY: return <PharmacyDashboard />;
      case UserRole.PATIENT:
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to MedixAI Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          You are currently viewing as <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-700 font-medium text-xs uppercase">{user.role}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          {renderDashboardContent()}
        </div>

        {[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN].includes(user.role) && (
          <div className="xl:col-span-1 h-[700px]">
            <AIChatbox currentRole={user.role} />
          </div>
        )}
      </div>
    </>
  );
}
