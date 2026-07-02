import { IAIProvider, ProviderConfig } from "./IAIProvider";
import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export class GeminiProvider implements IAIProvider {
  private config: ProviderConfig;
  private provider: ReturnType<typeof createGoogleGenerativeAI>;

  constructor(config: ProviderConfig) {
    this.config = config;
    
    // Using Vercel AI Gateway if configured
    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const gatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN;
    
    if (gatewayUrl && gatewayToken) {
      this.provider = createGoogleGenerativeAI({
        baseURL: `${gatewayUrl}/google`, // Vercel AI Gateway format
        apiKey: gatewayToken,
      });
    } else {
      this.provider = createGoogleGenerativeAI({
        apiKey: config.apiKey || process.env.GEMINI_API_KEY,
      });
    }
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log(`[GeminiProvider] Routing to model: ${this.config.model}`);
    
    const { text } = await generateText({
      model: this.provider(this.config.model || "models/gemini-1.5-pro"),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    return text;
  }

  async *stream(systemPrompt: string, userPrompt: string): AsyncGenerator<string, void, unknown> {
    console.log(`[GeminiProvider] Streaming from model: ${this.config.model}`);
    
    const { textStream } = streamText({
      model: this.provider(this.config.model || "models/gemini-1.5-pro"),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    for await (const textPart of textStream) {
      yield textPart;
    }
  }
}
