export interface RetrievalResult {
  id: string;
  content: string;
  score: number;
}

export class QdrantClient {
  private url: string;

  constructor() {
    this.url = process.env.QDRANT_URL || "http://localhost:6333";
  }

  async search(collection: string, vector: number[], topK: number = 3): Promise<RetrievalResult[]> {
    console.log(`[QdrantClient] Querying collection ${collection} at ${this.url}`);
    
    // Simulating Qdrant semantic search REST response
    return [
      {
        id: "doc_123",
        content: "Standard operating procedure for handling common cold symptoms in the outpatient clinic involves rest and hydration.",
        score: 0.92,
      },
      {
        id: "doc_456",
        content: "Acetaminophen is indicated for mild to moderate pain and fever. Contraindications include severe liver disease.",
        score: 0.88,
      }
    ].slice(0, topK);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsert(collection: string, id: string, vector: number[], payload: Record<string, unknown>): Promise<void> {
    console.log(`[QdrantClient] Upserting vector to ${collection} at ${this.url}`);
    // Simulating REST POST /collections/{collection}/points
  }
}
