"use client";

import React, { useState } from "react";
import { UserRole } from "@/core/entities/User";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AIChatbox } from "@/components/chat/AIChatbox";

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar currentRole={role} onRoleChange={setRole} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to MedixAI Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">
                You are currently viewing as <span className="px-2 py-0.5 bg-blue-50 rounded text-blue-700 font-medium text-xs uppercase">{role}</span>.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                        Module {i}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 h-[400px] flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="flex-1 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    Activity feed will appear here...
                  </div>
                </div>
              </div>

              {/* Right Column (AI Chat) */}
              <div className="lg:col-span-1 h-[750px]">
                <AIChatbox currentRole={role} />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
