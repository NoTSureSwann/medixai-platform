import { UserContext } from "../LLMClient";
import { Message } from "@/core/entities/ConversationMemory";

export interface AgentContext extends UserContext {
  history: Message[];
  retrievedContext: string[];
}

export interface IAgent {
  name: string;
  description: string;
  execute(query: string, context: AgentContext): Promise<string>;
}
