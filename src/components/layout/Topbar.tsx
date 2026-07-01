import React from "react";
import { UserRole } from "@/core/entities/User";
import { Bell, Search, User } from "lucide-react";

interface TopbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Topbar = ({ currentRole, onRoleChange }: TopbarProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search patients, records, analytics..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher for Demo Purposes */}
        <div className="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4">
          <span className="text-xs text-gray-500 font-medium">Role</span>
          <select 
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.DOCTOR}>Doctor</option>
            <option value={UserRole.PATIENT}>Patient</option>
          </select>
        </div>

        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
