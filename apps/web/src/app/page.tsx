import React from 'react';
import Link from 'next/link';
import DynamicMapWrapper from '@/components/maps/DynamicMapWrapper';
import { Activity, ShieldCheck, Zap, Bot, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MedixAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-gray-600 text-sm font-medium">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</Link>
            <Link href="#about" className="hover:text-gray-900 transition-colors">About Us</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
            <Zap className="w-4 h-4" />
            <span>MedixAI Enterprise Platform is Live</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Intelligence Meets <br />Healthcare.
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the future of medical care. Advanced AI diagnostics, unified patient records, and lightning-fast hospital operations—all powered by a secure enterprise architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/auth/register"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
            >
              Enter Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Feature Cards */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "AI Gateway", icon: <Bot className="w-7 h-7" />, desc: "Multi-model orchestration using Groq & Gemini for ultra-fast, intelligent diagnostics." },
            { title: "Role-Based Security", icon: <ShieldCheck className="w-7 h-7" />, desc: "Enterprise MongoDB RBAC with Firebase Identity verification on every request." },
            { title: "Unified RAG", icon: <Database className="w-7 h-7" />, desc: "Seamless semantic search across millions of medical records and hospital SOPs." }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Realtime Geospatial Maps */}
      <section id="geospatial" className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Realtime Geospatial Surveillance</h2>
            <p className="text-gray-600">
              Track outbreaks across Indonesia in real-time. Our AI automatically analyzes patterns 
              and recommends early intervention strategies for hospitals.
            </p>
          </div>
          
          <DynamicMapWrapper />
        </div>
      </section>

      {/* Footer / Contact Us */}
      <footer id="about" className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MedixAI</span>
            </div>
            <p className="text-gray-600 text-sm max-w-sm mb-6">
              The leading Enterprise Medical Intelligence Platform. We empower hospitals with AI-driven diagnostics, seamless data integration, and geospatial insights.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600">AI Diagnostics</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Hospital Operations</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Patient Records</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Geospatial Tracking</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📍 Menara Bidakara, Jakarta Selatan, Indonesia</li>
              <li>📞 +62 21 555 1234</li>
              <li>✉️ contact@medixai.co.id</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MedixAI Enterprise Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
