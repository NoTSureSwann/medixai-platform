export interface ProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIProvider {
  /**
   * Generates a single string response from the provider.
   */
  generate(systemPrompt: string, userPrompt: string): Promise<string>;

  /**
   * Returns a stream (placeholder signature) for streaming responses.
   */
  stream(systemPrompt: string, userPrompt: string): AsyncGenerator<string, void, unknown>;
}
