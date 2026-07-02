import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { EmbeddingsClient } from "@/infrastructure/ai-gateway/EmbeddingsClient";
import { MongoKnowledgeRepository } from "@/infrastructure/database/repositories/MongoKnowledgeRepository";
import { z } from "zod";
import { UserRole } from "@/core/entities/User";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PATIENT),
  hospitalId: z.string().optional().default("DEFAULT_HOSPITAL"),
});

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

const embeddings = new EmbeddingsClient();
const knowledgeRepo = new MongoKnowledgeRepository();

async function chatHandler(req: Request) {
  const body = await req.json();
  
  // 1. Validate Input
  const { messages, role, hospitalId } = chatSchema.parse(body);
  const latestMessage = messages[messages.length - 1]?.content || "";

  // 2. Retrieval (RAG Pipeline)
  const vector = await embeddings.generateEmbedding(latestMessage);
  const searchResults = await knowledgeRepo.searchSimilar(vector, 3);
  const retrievedContext = searchResults.map(res => res.content).join("\n\n");

  // 3. Construct System Prompt
  const systemPrompt = `
    You are GoKlinik Assistant, an intelligent medical and operational assistant.
    
    [ROLE CONTEXT]
    The user you are talking to is a: ${role}.
    If User is PATIENT: Explain in simple terms. DO NOT prescribe medication. Remind them to see a doctor for formal diagnosis.
    If User is DOCTOR: Provide high-level clinical summaries, references, and professional reasoning.
    If User is ADMIN/PHARMACY: Focus on operational, inventory, or billing details.
    
    [TENANT CONTEXT]
    Hospital ID: ${hospitalId}
    
    [RETRIEVED KNOWLEDGE BASE CONTEXT]
    Please base your answers on the following verified knowledge base documents if relevant to the query:
    ---
    ${retrievedContext || "No specific documents found."}
    ---
    If the context doesn't answer the question, you can use your general medical knowledge but add a disclaimer.
  `;

  // 4. Generate Stream
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: messages,
  });

  // Automatically streams to the client
  return result.toTextStreamResponse();
}

export const POST = withErrorHandler(chatHandler);
