import { AIGateway } from "./AIGateway";
import { GroqProvider } from "./providers/GroqProvider";
import { GeminiProvider } from "./providers/GeminiProvider";

export class OperationsLLMClient {
  private gateway: AIGateway;

  constructor() {
    // Operational queries prioritize ultra-fast Groq, fallback to Gemini
    const primary = new GroqProvider({ apiKey: process.env.GROQ_API_KEY || "", model: "llama-3.3-70b-versatile" });
    const fallback = new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY || "", model: "gemini-1.5-flash" });
    
    this.gateway = new AIGateway(primary, fallback);
  }

  async generateOpsResponse(intent: string, query: string, sessionData: Record<string, unknown>, context: string[]): Promise<string> {
    const systemPrompt = `
      You are the GoKlinik Operations Assistant.
      Intent Detected: ${intent}
      
      Constraints:
      1. You MUST NOT answer medical or clinical questions. Redirect to Medical Assistant.
      2. Rely strictly on the following [CONTEXT] documents for BPJS/Billing/FAQ.
      3. Keep answers concise, empathetic, and professional.

      User Context: ${JSON.stringify(sessionData)}
      
      CONTEXT:
      ${context.join("\n")}
    `;

    console.log("[OpsLLMClient] Handling intent:", intent);
    console.debug("[OpsLLMClient] System Prompt length:", systemPrompt.length);
    
    return await this.gateway.executeWithFallback(systemPrompt, query);
  }
}
