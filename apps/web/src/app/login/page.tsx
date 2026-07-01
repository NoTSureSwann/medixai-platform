"use client";

import React from "react";
import { useAuth, DUMMY_USERS } from "@/contexts/AuthContext";
import { UserRole } from "@/core/entities/User";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleDummyLogin = (role: UserRole) => {
    const user = DUMMY_USERS[role];
    if (user) {
      login(user);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">MedixAI</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled
            />
          </div>
          <button 
            type="submit" 
            disabled
            className="w-full py-2.5 bg-gray-300 text-white rounded-lg font-medium cursor-not-allowed"
          >
            Sign In (Use Fast Login below)
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center uppercase tracking-wider">
            Fast Login (Dummy Data)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleDummyLogin(UserRole.PATIENT)}
              className="py-2 px-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Patient
            </button>
            <button 
              onClick={() => handleDummyLogin(UserRole.DOCTOR)}
              className="py-2 px-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Doctor
            </button>
            <button 
              onClick={() => handleDummyLogin(UserRole.PHARMACY)}
              className="py-2 px-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Pharmacy
            </button>
            <button 
              onClick={() => handleDummyLogin(UserRole.ADMIN)}
              className="py-2 px-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account? <button onClick={() => router.push("/register")} className="text-blue-600 font-medium hover:underline">Register</button>
        </div>
      </div>
    </div>
  );
}
