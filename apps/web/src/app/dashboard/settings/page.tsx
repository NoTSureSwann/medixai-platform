"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/core/entities/User";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    hospitalId: "",
    specialization: "",
    medicalRecordNumber: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        hospitalId: user.hospitalId || "",
        specialization: user.specialization || "",
        medicalRecordNumber: user.medicalRecordNumber || "",
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build update payload based on role
    const updates: Partial<User> = {
      name: formData.name,
      hospitalId: formData.hospitalId,
    };

    if (user.role === UserRole.DOCTOR) {
      updates.specialization = formData.specialization;
    } else if (user.role === UserRole.PATIENT) {
      updates.medicalRecordNumber = formData.medicalRecordNumber;
    }

    updateProfile(updates);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details and role-specific configurations.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              disabled
              value={user.email}
              className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input 
              type="text" 
              disabled
              value={user.role}
              className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital ID</label>
            <input 
              type="text" 
              required
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {user.role === UserRole.DOCTOR && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input 
                type="text" 
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {user.role === UserRole.PATIENT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Record Number (MRN)</label>
              <input 
                type="text" 
                value={formData.medicalRecordNumber}
                onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

        </div>

        <div className="pt-4 border-t border-gray-200 flex items-center gap-4">
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          
          {isSaved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Successfully saved
            </span>
          )}
        </div>

      </form>
    </div>
  );
}
