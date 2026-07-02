"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, User } from "@/core/entities/User";
import { useRouter } from "next/navigation";
import { emailPasswordLoginAction } from "../actions/authActions";
import { DUMMY_ACCOUNTS } from "@/constants/dummyAccounts";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await emailPasswordLoginAction(email, password);

    if (res.success && res.user) {
      login(res.user as User);
      router.push("/dashboard");
    } else {
      setError(res.error || "Login gagal");
    }
    setLoading(false);
  };

  const handleQuickLogin = async (account: typeof DUMMY_ACCOUNTS[0]) => {
    setError("");
    setLoading(true);
    setEmail(account.email);
    setPassword(account.password);

    const res = await emailPasswordLoginAction(account.email, account.password);

    if (res.success && res.user) {
      login(res.user as User);
      router.push("/dashboard");
    } else {
      setError(res.error || "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">GoKlinik</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
            <input 
              type="text" 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="pasien.goklinik.platform.idn"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center uppercase tracking-wider">
            Quick Login (Akun Demo)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DUMMY_ACCOUNTS.map((account) => (
              <button 
                key={account.email}
                onClick={() => handleQuickLogin(account)}
                disabled={loading}
                className="py-2 px-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {account.role === UserRole.PATIENT && "🧑 Pasien"}
                {account.role === UserRole.PHARMACY && "💊 Farmasi"}
                {account.role === UserRole.DOCTOR && "🩺 Dokter"}
                {account.role === UserRole.ADMIN && "⚙️ Admin"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Password default: <code className="bg-gray-100 px-1.5 py-0.5 rounded">GoKlinik2026!</code>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account? <button onClick={() => router.push("/register")} className="text-blue-600 font-medium hover:underline">Register</button>
        </div>
      </div>
    </div>
  );
}
