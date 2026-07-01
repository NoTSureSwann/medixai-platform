"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the Terms & Privacy Policy to register.");
      return;
    }
    // TODO: Connect to CQRS RegisterPatientCommand API
    alert("Registration implementation pending.");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create an Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="patient@email.com"
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
              I accept the Legal Terms
            </label>
            <p className="text-gray-500 mt-0.5">
              By registering, you acknowledge that you have read and agree to our{" "}
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
          Register Account
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
