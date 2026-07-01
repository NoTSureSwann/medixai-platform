import { NextResponse } from "next/server";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { AIOrchestrator } from "@/infrastructure/ai-gateway/orchestrator/AIOrchestrator";
import { QdrantClient } from "@/infrastructure/ai-gateway/QdrantClient";
import { EmbeddingsClient } from "@/infrastructure/ai-gateway/EmbeddingsClient";
import { MongoMemoryRepository } from "@/infrastructure/database/repositories/MongoMemoryRepository";
import { AgentContext } from "@/infrastructure/ai-gateway/agents/IAgent";
import { z } from "zod";
import { UserRole } from "@/core/entities/User";
import { AIEvaluator } from "@/infrastructure/ai-gateway/evaluation/AIEvaluator";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PATIENT),
  sessionId: z.string().optional().default("session_default"),
  userId: z.string().optional().default("user_default"),
});

const qdrant = new QdrantClient();
const embeddings = new EmbeddingsClient();
const orchestrator = new AIOrchestrator();
const memoryRepo = new MongoMemoryRepository();
const evaluator = new AIEvaluator();

async function chatHandler(req: Request) {
  const body = await req.json();
  
  // 1. Validate Input
  const { message, role, sessionId, userId } = chatSchema.parse(body);
  const hospitalId = "DEFAULT_HOSPITAL"; // Simulate context

  // 2. Fetch Conversation Memory
  const sessionMemory = await memoryRepo.getSessionMemory(userId, sessionId);
  const history = sessionMemory?.messages || [];

  // 3. Retrieval (RAG Pipeline)
  const vector = await embeddings.generateEmbedding(message);
  const searchResults = await qdrant.search("medical_kb", vector, 3);
  const retrievedContext = searchResults.map(res => res.content);

  // 4. Orchestration & Generation
  const context: AgentContext = {
    role,
    hospitalId,
    history,
    retrievedContext,
  };

  const responseText = await orchestrator.routeAndExecute(message, context);

  // 5. Update Memory (Continuous Learning context)
  await memoryRepo.addMessage(userId, hospitalId, sessionId, {
    role: "user",
    content: message,
    timestamp: new Date()
  });
  
  await memoryRepo.addMessage(userId, hospitalId, sessionId, {
    role: "ai",
    content: responseText,
    timestamp: new Date()
  });

  // 6. Async AI Evaluation (LLM-as-a-judge)
  evaluator.evaluate(message, responseText, retrievedContext).then(evalResult => {
    console.log(`[Eval] Score: ${evalResult.score}. Reasoning: ${evalResult.reasoning}`);
  }).catch(console.error);

  // 7. Return API Response
  return NextResponse.json({
    reply: responseText,
    metadata: {
      citations: searchResults.map(res => ({ id: res.id, score: res.score })),
      confidence: 0.95
    }
  });
}

export const POST = withErrorHandler(chatHandler);
