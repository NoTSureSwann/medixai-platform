import { ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { Hospital } from "../../../core/entities/Hospital";

export class MongoHospitalRepository {
  private collectionName = "hospitals";

  private async getCollection() {
    const client = await clientPromise;
    return client.db("goklinik").collection<Omit<Hospital, "id">>(this.collectionName);
  }

  private mapDocumentToHospital(doc: Record<string, unknown>): Hospital {
    const { _id, ...rest } = doc;
    return { id: String(_id), ...rest } as Hospital;
  }

  async findById(id: string): Promise<Hospital | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await collection.findOne({ _id: new ObjectId(id) as any });
    return doc ? this.mapDocumentToHospital(doc) : null;
  }

  async create(hospital: Omit<Hospital, "id">): Promise<Hospital> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(hospital);
    return { ...hospital, id: result.insertedId.toString() };
  }
}
