export class EmbeddingsClient {
  /**
   * Generates a 1024-dimensional embedding using Voyage AI (voyage-3)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.VOYAGE_API_KEY;
    
    if (!apiKey) {
      console.warn(`[EmbeddingsClient] VOYAGE_API_KEY not found! Falling back to dummy vector for: "${text.substring(0, 30)}..."`);
      // Fallback to random vector of length 1024
      const length = text.length;
      return new Array(1024).fill(0).map((_, i) => (Math.sin(length + i) + 1) / 2);
    }

    console.log(`[EmbeddingsClient] Generating Voyage AI vector for: "${text.substring(0, 30)}..."`);
    
    try {
      const response = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input: [text],
          model: "voyage-3",
          output_dimension: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`Voyage AI API error: ${response.statusText} - ${await response.text()}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("[EmbeddingsClient] Error generating embedding:", error);
      throw error;
    }
  }
}

