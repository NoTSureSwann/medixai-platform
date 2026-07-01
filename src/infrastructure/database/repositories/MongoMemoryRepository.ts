import { Collection } from "mongodb";
import clientPromise from "../mongodb";
import { ConversationMemory, Message } from "@/core/entities/ConversationMemory";

export class MongoMemoryRepository {
  private collectionName = "conversation_memory";

  private async getCollection(): Promise<Collection<Omit<ConversationMemory, "id">>> {
    const client = await clientPromise;
    return client.db("medixai").collection<Omit<ConversationMemory, "id">>(this.collectionName);
  }

  async getSessionMemory(userId: string, sessionId: string): Promise<ConversationMemory | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ userId, sessionId });
    if (!doc) return null;
    const docWithId = doc as ConversationMemory & { _id: { toString: () => string } };
    const { _id, ...rest } = docWithId;
    return { id: _id.toString(), ...rest } as ConversationMemory;
  }

  async addMessage(userId: string, hospitalId: string, sessionId: string, message: Message): Promise<void> {
    const collection = await this.getCollection();
    
    // We only keep the last 10 messages to optimize context window
    await collection.updateOne(
      { userId, sessionId },
      { 
        $push: { 
          messages: {
            $each: [message],
            $slice: -10 // Keep last 10
          }
        },
        $setOnInsert: { hospitalId, updatedAt: new Date() }
      },
      { upsert: true }
    );
  }
}
