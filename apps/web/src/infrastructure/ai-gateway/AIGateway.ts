import { IAIProvider } from "./providers/IAIProvider";

export class AIGateway {
  private primaryProvider: IAIProvider;
  private fallbackProvider?: IAIProvider;

  constructor(primary: IAIProvider, fallback?: IAIProvider) {
    this.primaryProvider = primary;
    this.fallbackProvider = fallback;
  }

  /**
   * Executes a generation request with automatic fallback and retry logic.
   */
  async executeWithFallback(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      console.log("[AIGateway] Attempting primary provider...");
      return await this.primaryProvider.generate(systemPrompt, userPrompt);
    } catch (error) {
      console.warn("[AIGateway] Primary provider failed:", error);
      
      if (this.fallbackProvider) {
        console.log("[AIGateway] Attempting fallback provider...");
        return await this.fallbackProvider.generate(systemPrompt, userPrompt);
      }
      
      throw new Error("All AI providers failed to fulfill the request.");
    }
  }
}
