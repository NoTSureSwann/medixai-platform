"use client";

import React, { useState } from "react";
import { UserRole } from "@/core/entities/User";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface AIChatboxProps {
  currentRole: UserRole;
}

export const AIChatbox = ({ currentRole }: AIChatboxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am GoKlinik. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeData, setRealtimeData] = useState<{ type: string, version: number, timestamp: number, message: string } | null>(null);

  React.useEffect(() => {
    if (currentRole !== UserRole.PATIENT) return;
    const eventSource = new EventSource('/api/clinical/appointments/sync');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'APPOINTMENT_UPDATE') {
        setRealtimeData(data);
      }
    };
    return () => eventSource.close();
  }, [currentRole]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          role: currentRole,
          realtimeContext: realtimeData ? `Realtime Appointment Update: ${JSON.stringify(realtimeData)}` : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: `Error: ${data.error || "Failed to fetch response."}` }]);
      }
    } catch (_error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered a network error connecting to the Gateway." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">GoKlinik Assistant</h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
          {currentRole}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-lg max-w-[80%] text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-lg bg-white border border-gray-200 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask GoKlinik as a ${currentRole.toLowerCase()}...`}
            className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
