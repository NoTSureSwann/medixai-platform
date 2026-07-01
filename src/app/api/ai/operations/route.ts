import { NextResponse } from "next/server";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { IntentClassifier, ChatIntent } from "@/infrastructure/ai-gateway/IntentClassifier";
import { OperationsLLMClient } from "@/infrastructure/ai-gateway/OperationsLLMClient";
import { VectorDBClient } from "@/infrastructure/ai-gateway/VectorDBClient";
import { z } from "zod";

const opsChatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionData: z.record(z.string(), z.unknown()).optional(),
});

const vectorDb = new VectorDBClient();
const opsLlm = new OperationsLLMClient();

async function operationsChatHandler(req: Request) {
  const body = await req.json();
  const { message, sessionData = {} } = opsChatSchema.parse(body);

  // 1. Intent Classification
  const intent = IntentClassifier.classify(message);

  let responseText = "";

  // 2. Agentic Routing based on Intent
  if (intent === ChatIntent.BOOK_APPOINTMENT) {
    // Route to Booking Agent (Placeholder for DB read/write operations)
    responseText = "It looks like you want to book an appointment. Which department or doctor would you like to see?";
  } else {
    // FAQ, BPJS, Billing -> Route to RAG Pipeline
    const searchResults = await vectorDb.search(message, 3);
    const context = searchResults.map(res => res.content);

    responseText = await opsLlm.generateOpsResponse(intent, message, sessionData, context);
  }

  // 3. Return API Response
  return NextResponse.json({
    intent,
    reply: responseText,
  });
}

export const POST = withErrorHandler(operationsChatHandler);
