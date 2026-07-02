import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

export interface KnowledgeChunk {
  _id?: ObjectId;
  id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class MongoKnowledgeRepository {
  private collectionName = 'knowledge_base';

  private async getCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<KnowledgeChunk>(this.collectionName);
  }

  async addDocument(content: string, embedding: number[], metadata?: Record<string, unknown>): Promise<string> {
    const collection = await this.getCollection();
    const result = await collection.insertOne({
      content,
      embedding,
      metadata,
      createdAt: new Date(),
    });
    return result.insertedId.toString();
  }

  async addDocuments(documents: { content: string, embedding: number[], metadata?: Record<string, unknown> }[]): Promise<void> {
    if (documents.length === 0) return;
    const collection = await this.getCollection();
    await collection.insertMany(documents.map(doc => ({
      ...doc,
      createdAt: new Date(),
    })));
  }

  /**
   * Search for similar documents using MongoDB Atlas Vector Search
   * 
   * Prerequisites for Atlas:
   * 1. You must create an Atlas Vector Search Index on the `knowledge_base` collection.
   * 2. Index Name: `vector_index` (or modify the $vectorSearch pipeline below)
   * 3. Index Definition (JSON):
   * {
   *   "fields": [
   *     {
   *       "numDimensions": 768, // Google text-embedding-004 has 768 dimensions
   *       "path": "embedding",
   *       "similarity": "cosine",
   *       "type": "vector"
   *     }
   *   ]
   * }
   */
  async searchSimilar(vector: number[], limit: number = 5): Promise<Array<{ id: string, content: string, score: number, metadata?: Record<string, unknown> }>> {
    const collection = await this.getCollection();
    
    // Check if running on local/mock env vs actual Atlas
    // In local dev without Atlas Vector Search, this pipeline will fail.
    // For walking skeleton, we will wrap it in try/catch and return mock if it fails.
    try {
      const results = await collection.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: vector,
            numCandidates: Math.max(limit * 10, 100),
            limit: limit
          }
        },
        {
          $project: {
            content: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]).toArray();

      return results.map((doc: any) => ({
        id: doc._id.toString(),
        content: doc.content,
        metadata: doc.metadata,
        score: doc.score
      }));
    } catch (error) {
      console.error("[MongoKnowledgeRepository] Vector Search failed. Falling back to mock results. Ensure you are on MongoDB Atlas with a configured Vector Search index.", error);
      // Fallback for local dev / unconfigured Atlas
      return [];
    }
  }
}
