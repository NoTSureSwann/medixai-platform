import { IAIProvider, ProviderConfig } from "./IAIProvider";

export class GroqProvider implements IAIProvider {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log(`[GroqProvider] Routing to ultra-fast model: ${this.config.model}`);
    
    // In production, this uses the official groq-sdk
    return `[GroqProvider - ${this.config.model}] High-speed response for: "${userPrompt.substring(0, 30)}..."`;
  }

  async *stream(_systemPrompt: string, _userPrompt: string): AsyncGenerator<string, void, unknown> {
    console.log(`[GroqProvider] Streaming at high TPS from model: ${this.config.model}`);
    yield "[Fast Chunk 1] ";
    yield "[Fast Chunk 2]";
  }
}
