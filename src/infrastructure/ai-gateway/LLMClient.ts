import { AIGateway } from "./AIGateway";
import { GeminiProvider } from "./providers/GeminiProvider";
import { GroqProvider } from "./providers/GroqProvider";
import { UserRole } from "@/core/entities/User";

export interface UserContext {
  role: UserRole;
  name?: string;
  hospitalId?: string;
  departmentId?: string;
}

export class LLMClient {
  private gateway: AIGateway;

  constructor() {
    // Clinical queries prioritize high-reasoning Gemini, fallback to Groq
    const primary = new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY || "", model: "gemini-1.5-pro" });
    const fallback = new GroqProvider({ apiKey: process.env.GROQ_API_KEY || "", model: "llama-3.3-70b-versatile" });
    
    this.gateway = new AIGateway(primary, fallback);
  }

  async generateResponse(query: string, context: string[], userCtx: UserContext = { role: UserRole.PATIENT }): Promise<string> {
    let roleInstructions = "";
    
    switch (userCtx.role) {
      case UserRole.ADMIN:
        roleInstructions = "You are assisting a Hospital Administrator. Focus on providing hospital analytics, operational reports, and dashboard insights. Be concise and data-driven.";
        break;
      case UserRole.DOCTOR:
        roleInstructions = "You are assisting a Medical Doctor. Focus on summarizing medical literature, explaining lab results in clinical terms, and providing high-level technical references from the context.";
        break;
      case UserRole.PATIENT:
      default:
        roleInstructions = "You are assisting a Patient. Explain health information in simple, clear, and empathetic language. Answer FAQs and provide education, but explicitly remind them that you do not replace a doctor's diagnosis.";
        break;
    }

    let tenantInstructions = "";
    if (userCtx.hospitalId) {
      tenantInstructions += `\n[TENANT ISOLATION] You are operating within Hospital ID: ${userCtx.hospitalId}. Restrict any operational suggestions to this tenant.`;
    }
    if (userCtx.departmentId) {
      tenantInstructions += `\n[DEPARTMENT FOCUS] The user belongs to Department ID: ${userCtx.departmentId}. Prioritize clinical knowledge relevant to this department.`;
    }

    const systemPrompt = `
      You are MedixAI, an Enterprise Medical Intelligence Assistant.
      
      [ROLE-SPECIFIC INSTRUCTIONS]
      ${roleInstructions}
      ${tenantInstructions}
      
      [LANGUAGES]
      1. Automatically detect the user's language (Indonesian or English).
      2. If Indonesian: Use formal Bahasa Indonesia (EYD), adapt medical terms appropriately.
      3. If English: Use CEFR C1-level professional academic English.
      4. Never translate unless explicitly requested.

      [CONSTRAINTS]
      1. Tone: Professional, empathetic, accurate, and evidence-oriented.
      2. Limit: Do NOT diagnose or prescribe medications. Always distinguish between educational info and professional advice.
      3. Grounding: Avoid unsupported claims. Rely strictly on the following curated medical context.
      
      [CONTEXT]
      ${context.join("\n")}
    `;

    console.log("[LLMClient] Sending prompt to Gateway with context size:", context.length);
    
    return await this.gateway.executeWithFallback(systemPrompt, query);
  }
}
