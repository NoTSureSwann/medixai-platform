import { IAIProvider, ProviderConfig } from "./IAIProvider";
import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export class GroqProvider implements IAIProvider {
  private config: ProviderConfig;
  private provider: any;

  constructor(config: ProviderConfig) {
    this.config = config;
    
    // Using Vercel AI Gateway if configured
    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const gatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN;
    
    if (gatewayUrl && gatewayToken) {
      this.provider = createOpenAI({
        baseURL: `${gatewayUrl}/groq`, // Vercel AI Gateway format
        apiKey: gatewayToken,
      });
    } else {
      this.provider = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.apiKey || process.env.GROQ_API_KEY,
      });
    }
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log(`[GroqProvider] Routing to model: ${this.config.model}`);
    
    const { text } = await generateText({
      model: this.provider(this.config.model || "llama3-70b-8192"),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    return text;
  }

  async *stream(systemPrompt: string, userPrompt: string): AsyncGenerator<string, void, unknown> {
    console.log(`[GroqProvider] Streaming from model: ${this.config.model}`);
    
    const { textStream } = streamText({
      model: this.provider(this.config.model || "llama3-70b-8192"),
      system: systemPrompt,
      prompt: userPrompt,
    });
    
    for await (const textPart of textStream) {
      yield textPart;
    }
  }
}
