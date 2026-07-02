export class EmbeddingsClient {
  constructor() {
    // Dummy embedding client since Groq is used for Chat and no Embedding API is configured.
  }

  /**
   * Generates a 768-dimensional dummy embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    console.log(`[EmbeddingsClient] Generating DUMMY vector for: "${text.substring(0, 30)}..."`);
    // Fallback to random vector of length 768 for graceful degradation in skeleton
    // To make it slightly deterministic based on text length:
    const length = text.length;
    return new Array(768).fill(0).map((_, i) => (Math.sin(length + i) + 1) / 2);
  }
}

