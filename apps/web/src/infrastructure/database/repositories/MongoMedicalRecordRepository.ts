import { ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { MedicalRecord } from "../../../core/entities/MedicalRecord";

export class MongoMedicalRecordRepository {
  private collectionName = "medical_records";

  private async getCollection() {
    const client = await clientPromise;
    return client.db("goklinik").collection<Omit<MedicalRecord, "id">>(this.collectionName);
  }

  private mapDocumentToRecord(doc: Record<string, unknown>): MedicalRecord {
    const { _id, ...rest } = doc;
    return { id: String(_id), ...rest } as MedicalRecord;
  }

  async findById(id: string): Promise<MedicalRecord | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await collection.findOne({ _id: new ObjectId(id) as any });
    return doc ? this.mapDocumentToRecord(doc) : null;
  }

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ patientId }).sort({ createdAt: -1 }).toArray();
    return docs.map(this.mapDocumentToRecord);
  }

  async create(record: Omit<MedicalRecord, "id">): Promise<MedicalRecord> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(record);
    return { ...record, id: result.insertedId.toString() };
  }
}
