import { IAgent, AgentContext } from "./IAgent";
import { AIGateway } from "../AIGateway";
import { GroqProvider } from "../providers/GroqProvider";

export class OperationsAgent implements IAgent {
  name = "OperationsAgent";
  description = "Handles hospital operations, schedules, queues, and general FAQs.";
  private gateway: AIGateway;

  constructor() {
    // Locked to Groq Llama-3 for high-speed operational tasks
    const provider = new GroqProvider({ apiKey: process.env.GROQ_API_KEY || "", model: "llama-3.3-70b-versatile" });
    this.gateway = new AIGateway(provider, provider);
  }

  async execute(query: string, context: AgentContext): Promise<string> {
    const historyText = context.history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
    
    const systemPrompt = `
      You are GoKlinik Operations Agent, specialized in hospital scheduling, queues, and administration.
      
      [ROLE: ${context.role}]
      Help the user with administrative tasks, billing, queues, or finding their way around the hospital.
      
      [TENANT & DEPARTMENT]
      Hospital ID: ${context.hospitalId || 'N/A'}
      Department: ${context.departmentId || 'N/A'}
      
      [MEMORY HISTORY]
      ${historyText}

      [RETRIEVED OPERATIONAL CONTEXT]
      ${context.retrievedContext.join("\n")}
    `;

    return await this.gateway.executeWithFallback(systemPrompt, query);
  }
}
