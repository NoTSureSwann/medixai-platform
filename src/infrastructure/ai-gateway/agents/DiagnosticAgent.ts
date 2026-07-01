import { IAgent, AgentContext } from "./IAgent";
import { AIGateway } from "../AIGateway";
import { GeminiProvider } from "../providers/GeminiProvider";

export class DiagnosticAgent implements IAgent {
  name = "DiagnosticAgent";
  description = "Handles clinical, medical, and diagnostic queries.";
  private gateway: AIGateway;

  constructor() {
    // Locked to Gemini 1.5 Pro for high clinical reasoning
    const provider = new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY || "", model: "gemini-1.5-pro" });
    this.gateway = new AIGateway(provider, provider); // Fallback is also Gemini for now
  }

  async execute(query: string, context: AgentContext): Promise<string> {
    const historyText = context.history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
    
    const systemPrompt = `
      You are MedixAI Diagnostic Agent, specialized in clinical and medical reasoning.
      
      [ROLE: ${context.role}]
      If User is PATIENT: Explain in simple terms. DO NOT prescribe. Remind them to see a doctor.
      If User is DOCTOR: Provide high-level clinical summaries, references, and professional reasoning.
      
      [TENANT & DEPARTMENT]
      Hospital ID: ${context.hospitalId || 'N/A'}
      Department: ${context.departmentId || 'N/A'}
      
      [MEMORY HISTORY]
      ${historyText}

      [RETRIEVED MEDICAL CONTEXT]
      ${context.retrievedContext.join("\n")}
    `;

    return await this.gateway.executeWithFallback(systemPrompt, query);
  }
}
