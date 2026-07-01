"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the Terms & Privacy Policy to login.");
      return;
    }
    // TODO: Connect to Firebase Auth
    alert("Login implementation pending.");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="doctor@hospital.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Term Agreement & Privacy Policy */}
        <div className="flex items-start gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center h-5 mt-0.5">
            <input 
              id="terms" 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
          </div>
          <div className="text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the Legal Terms
            </label>
            <p className="text-gray-500 mt-0.5">
              By logging in, you agree to our{" "}
              <a href="/legal/Terms_and_Conditions.pdf" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a>
              {" "}and{" "}
              <a href="/legal/Privacy_Policy.pdf" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors mt-4"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
