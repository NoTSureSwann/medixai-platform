"use client";

import React from "react";
import { UserRole } from "@/core/entities/User";
import { useAuth } from "@/contexts/AuthContext";
import { AIChatbox } from "@/components/chat/AIChatbox";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { PharmacyDashboard } from "@/components/dashboard/PharmacyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard className="flex flex-col md:flex-row md:items-center justify-between border-l-4 border-l-[var(--color-info)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {user.name}!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Anda login sebagai <span className="uppercase font-semibold text-[var(--color-info)]">{user.role}</span>
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          {renderDashboardContent()}
        </div>

        {[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN].includes(user.role) && (
          <GlassCard className="xl:col-span-1 h-[700px] flex flex-col p-0 overflow-hidden shadow-xl shadow-[var(--color-info)]/10">
            <AIChatbox currentRole={user.role} />
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
