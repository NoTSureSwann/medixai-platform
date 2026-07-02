import React from "react";
import { Activity, Calendar, FileText, Home, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserRole } from "@/core/entities/User";

export const Sidebar = ({ currentRole }: { currentRole: UserRole }) => {
  const pathname = usePathname();
  const showAI = [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN].includes(currentRole);
  const showAppointments = [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.NURSE].includes(currentRole);
  const showPatients = [UserRole.DOCTOR, UserRole.ADMIN, UserRole.NURSE, UserRole.PHARMACY].includes(currentRole);
  const showRecords = [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.NURSE].includes(currentRole);

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex-col hidden md:flex">
      <div className="p-5 border-b border-gray-200 flex items-center gap-3">
        <Activity className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-bold text-gray-900">GoKlinik</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavItem href="/dashboard" icon={<Home className="w-5 h-5" />} label="Dashboard" active={pathname === "/dashboard"} />
        {showAppointments && <NavItem href="/dashboard/appointments" icon={<Calendar className="w-5 h-5" />} label="Appointments" active={pathname === "/dashboard/appointments"} />}
        {showPatients && <NavItem href="/dashboard/patients" icon={<Users className="w-5 h-5" />} label="Patients" active={pathname === "/dashboard/patients"} />}
        {showRecords && <NavItem href="/dashboard/records" icon={<FileText className="w-5 h-5" />} label="Records" active={pathname === "/dashboard/records"} />}
        {showAI && <NavItem href="/dashboard/ai" icon={<MessageSquare className="w-5 h-5" />} label="AI Assistant" active={pathname === "/dashboard/ai"} />}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/dashboard/settings"} />
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active 
          ? "bg-blue-50 text-blue-700 font-medium" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};
