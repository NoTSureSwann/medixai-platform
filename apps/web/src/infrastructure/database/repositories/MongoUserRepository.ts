import { ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { User } from "../../../core/entities/User";
import { IUserRepository } from "../../../core/interfaces/IUserRepository";

export class MongoUserRepository implements IUserRepository {
  private collectionName = "users";

  private async getCollection() {
    const client = await clientPromise;
    return client.db("medixai").collection<Omit<User, "id">>(this.collectionName);
  }

  private mapDocumentToUser(doc: Record<string, unknown>): User {
    const { _id, ...rest } = doc;
    return { id: String(_id), ...rest } as User;
  }

  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await collection.findOne({ _id: new ObjectId(id) as any });
    return doc ? this.mapDocumentToUser(doc) : null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ firebaseUid });
    return doc ? this.mapDocumentToUser(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ email });
    return doc ? this.mapDocumentToUser(doc) : null;
  }

  async create(user: Omit<User, "id">): Promise<User> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(user);
    return { ...user, id: result.insertedId.toString() };
  }

  async update(id: string, userUpdate: Partial<User>): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: new ObjectId(id) as any },
      { $set: userUpdate },
      { returnDocument: "after" }
    );
    return result ? this.mapDocumentToUser(result) : null;
  }
}
