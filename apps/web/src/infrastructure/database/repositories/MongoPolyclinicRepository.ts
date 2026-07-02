import { Collection } from "mongodb";
import clientPromise from "../mongodb";
import { Polyclinic } from "@/core/entities/Polyclinic";

export class MongoPolyclinicRepository {
  private async getCollection(): Promise<Collection> {
    const client = await clientPromise;
    const db = client.db("goklinik");
    return db.collection("polyclinics");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): Polyclinic {
    return {
      id: doc._id?.toString() || doc.id,
      name: doc.name,
      description: doc.description,
      diseaseCategory: doc.diseaseCategory,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async create(polyclinic: Omit<Polyclinic, "id">): Promise<Polyclinic> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(polyclinic as Record<string, unknown>);
    return { ...polyclinic, id: result.insertedId.toString() };
  }

  async findAll(): Promise<Polyclinic[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async update(id: string, updates: Partial<Polyclinic>): Promise<Polyclinic | null> {
    const collection = await this.getCollection();
    await collection.updateOne({ id }, { $set: { ...updates, updatedAt: new Date() } });
    const doc = await collection.findOne({ id });
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
  }
}
