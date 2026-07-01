import { IAIProvider, ProviderConfig } from "./IAIProvider";

export class GeminiProvider implements IAIProvider {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log(`[GeminiProvider] Routing to model: ${this.config.model}`);
    
    // In production, this uses the official @google/genai SDK
    return `[GeminiProvider - ${this.config.model}] Processed query: "${userPrompt.substring(0, 30)}..."`;
  }

  async *stream(_systemPrompt: string, _userPrompt: string): AsyncGenerator<string, void, unknown> {
    console.log(`[GeminiProvider] Streaming from model: ${this.config.model}`);
    yield "[Streamed Content Chunk 1] ";
    yield "[Streamed Content Chunk 2]";
  }
}
