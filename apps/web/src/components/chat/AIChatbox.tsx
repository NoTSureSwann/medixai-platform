"use client";

import React, { useState } from "react";
import { UserRole } from "@/core/entities/User";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";

interface AIChatboxProps {
  currentRole: UserRole;
  hospitalId?: string;
}

export const AIChatbox = ({ currentRole, hospitalId = "DEFAULT_HOSPITAL" }: AIChatboxProps) => {
  const [realtimeData, setRealtimeData] = useState<{ type: string, version: number, timestamp: number, message: string } | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content: "Hello! I am GoKlinik Assistant. How can I help you today?",
    }
  ]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          role: currentRole,
          hospitalId,
        }),
      });
      
      const data = await response.json();
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text || "Sorry, I am unable to process that." }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: "An error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 shadow-sm z-10">
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

      {realtimeData && (
        <div className="bg-blue-50 p-2 text-xs text-blue-800 border-b border-blue-100 text-center">
          Realtime Update: {realtimeData.message}
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gray-50">
        {messages.map((msg: {id: string, role: string, content: string}) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-lg max-w-[85%] text-sm ${msg.role === "user" ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-800 shadow-sm leading-relaxed whitespace-pre-wrap"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-lg bg-white border border-gray-200 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask GoKlinik as a ${currentRole.toLowerCase()}...`}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
