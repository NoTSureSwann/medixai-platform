export interface Message {
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

export interface ConversationMemory {
  id?: string;
  userId: string;
  hospitalId: string;
  sessionId: string;
  messages: Message[];
  updatedAt: Date;
}
