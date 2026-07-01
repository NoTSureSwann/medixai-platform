import React from "react";
import { Activity, Calendar, FileText, Home, MessageSquare, Settings, Users } from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex-col hidden md:flex">
      <div className="p-5 border-b border-gray-200 flex items-center gap-3">
        <Activity className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-bold text-gray-900">MedixAI</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavItem icon={<Home className="w-5 h-5" />} label="Dashboard" active />
        <NavItem icon={<Calendar className="w-5 h-5" />} label="Appointments" />
        <NavItem icon={<Users className="w-5 h-5" />} label="Patients" />
        <NavItem icon={<FileText className="w-5 h-5" />} label="Records" />
        <NavItem icon={<MessageSquare className="w-5 h-5" />} label="AI Assistant" />
      </nav>

      <div className="p-3 border-t border-gray-200">
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active 
          ? "bg-blue-50 text-blue-700 font-medium" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};
