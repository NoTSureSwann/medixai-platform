"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, User } from "@/core/entities/User";
import { useRouter } from "next/navigation";
import { emailPasswordLoginAction } from "../actions/authActions";
import { DUMMY_ACCOUNTS } from "@/constants/dummyAccounts";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Anda harus menyetujui Syarat dan Ketentuan.");
      return;
    }
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
    if (!termsAccepted) {
      setError("Anda harus menyetujui Syarat dan Ketentuan.");
      return;
    }
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* The background uses --mesh-bg from globals.css */}
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md glass-panel rounded-2xl p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-blue-600 mb-2"
          >
            GoKlinik
          </motion.h1>
          <p className="text-gray-500 font-medium">Enterprise Medical Intelligence</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleEmailLogin}>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-white/60 dark:bg-black/30 border border-gray-200/60 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:text-white"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-white/60 dark:bg-black/30 border border-gray-200/60 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group mt-6">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <div className="w-5 h-5 border-2 border-gray-400 dark:border-gray-500 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors group-hover:border-blue-500 flex items-center justify-center">
                 <Check className={`w-3.5 h-3.5 text-white ${termsAccepted ? 'opacity-100' : 'opacity-0'} transition-opacity`} strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
              I agree to the <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Privacy Policy</a>
            </span>
          </label>

          <button 
            type="submit" 
            disabled={loading || !termsAccepted}
            className="w-full py-3 mt-4 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-md disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/50 dark:border-gray-600/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--glass-bg)] text-gray-500 dark:text-gray-400 font-medium rounded-full backdrop-blur-md">
              Quick Login (Demo)
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {DUMMY_ACCOUNTS.map((account) => (
            <motion.button 
              whileHover={{ scale: termsAccepted ? 1.02 : 1 }}
              whileTap={{ scale: termsAccepted ? 0.98 : 1 }}
              key={account.email}
              onClick={() => handleQuickLogin(account)}
              disabled={loading || !termsAccepted}
              className="py-2.5 px-4 border border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm text-blue-700 dark:text-blue-300 rounded-xl text-sm font-semibold hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5"
            >
              {account.role === UserRole.PATIENT && "🧑 Pasien"}
              {account.role === UserRole.PHARMACY && "💊 Farmasi"}
              {account.role === UserRole.DOCTOR && "🩺 Dokter"}
              {account.role === UserRole.ADMIN && "⚙️ Admin"}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
