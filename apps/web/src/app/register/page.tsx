"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, User } from "@/core/entities/User";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.PATIENT,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create dummy user from form data
    const newUser: User = {
      id: "usr-" + Math.floor(Math.random() * 10000),
      firebaseUid: "f-" + Math.floor(Math.random() * 10000),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      hospitalId: "hosp-1", // Default hospital
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(formData.role === UserRole.PATIENT ? { medicalRecordNumber: "MRN-NEW" } : {}),
      ...(formData.role === UserRole.DOCTOR ? { specialization: "General Practice" } : {}),
    };

    login(newUser);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">MedixAI</h1>
          <p className="text-gray-500">Create a new account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value={UserRole.PATIENT}>Patient</option>
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.NURSE}>Nurse</option>
              <option value={UserRole.PHARMACY}>Pharmacy</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <button onClick={() => router.push("/login")} className="text-blue-600 font-medium hover:underline">Sign In</button>
        </div>
      </div>
    </div>
  );
}
