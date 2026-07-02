"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlassNavbar } from "@/components/ui/glass/GlassNavbar";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // Edge Middleware already handles auth redirects.
  // We only need a loading state while client-side hydration restores user from localStorage.
  if (!user) {
    return <div className="h-screen w-full flex items-center justify-center bg-transparent">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar currentRole={user.role} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <GlassNavbar />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
