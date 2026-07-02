"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DynamicMapWrapper from '@/components/maps/DynamicMapWrapper';
import { Activity, ShieldCheck, Zap, Bot, Database, Menu, X, MessageSquare, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">GoKlinik</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-gray-600 text-sm font-medium">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#ai-assistant" className="hover:text-gray-900 transition-colors">AI Assistant</Link>
            <Link href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</Link>
            <Link href="#about" className="hover:text-gray-900 transition-colors">About Us</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
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

          {/* Hamburger Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-4 shadow-lg absolute w-full">
            <Link href="#features" className="block text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="#ai-assistant" className="block text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>AI Assistant</Link>
            <Link href="#solutions" className="block text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Solutions</Link>
            <Link href="#about" className="block text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/auth/login" className="text-center py-2 text-gray-700 font-medium border border-gray-300 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="text-center py-2 bg-blue-600 text-white font-medium rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
            <Zap className="w-4 h-4" />
            <span>GoKlinik Enterprise Platform is Live</span>
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
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Desktop Feature: AI Assistant Preview */}
      <section id="ai-assistant" className="py-20 px-6 bg-white overflow-hidden hidden md:block">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200">
                <Bot className="w-4 h-4" />
                <span>Powered by Groq & Voyage AI</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Advanced AI Medical Assistant</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Empower your medical staff with an ultra-fast AI assistant. Get instant differential diagnosis suggestions, drug interaction warnings, and semantic search across millions of medical records.
              </p>
              <ul className="space-y-3 pt-4">
                {['Sub-second response time with Llama-3', 'Context-aware RAG vector search', 'Secure and HIPAA compliant architecture'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl blur-3xl opacity-20 transform rotate-3"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">AI Diagnostic Terminal</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100 max-w-[80%] self-end">
                    What are the common symptoms of Dengue Fever?
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 text-sm text-gray-800 border border-indigo-100 shadow-sm">
                      <p className="font-medium text-indigo-900 mb-2">Dengue Fever Indicators:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Sudden high fever (104°F / 40°C)</li>
                        <li>Severe headache & pain behind the eyes</li>
                        <li>Joint and muscle pain (breakbone fever)</li>
                        <li>Nausea, vomiting, and skin rash</li>
                      </ul>
                      <p className="mt-3 text-xs text-indigo-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Generated in 0.34s via Groq Llama-3
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-20 px-6 bg-gray-50 md:bg-white border-t border-gray-200 md:border-none">
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
              <span className="text-xl font-bold text-gray-900">GoKlinik</span>
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
              <li>✉️ contact@goklinik.co.id</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} GoKlinik Enterprise Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
