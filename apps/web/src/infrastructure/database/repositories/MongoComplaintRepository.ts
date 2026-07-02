import { Collection } from "mongodb";
import clientPromise from "../mongodb";
import { Complaint } from "@/core/entities/Complaint";

export class MongoComplaintRepository {
  private async getCollection(): Promise<Collection> {
    const client = await clientPromise;
    const db = client.db("goklinik");
    return db.collection("complaints");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): Complaint {
    return {
      id: doc._id.toString(),
      patientId: doc.patientId,
      patientName: doc.patientName,
      polyclinicId: doc.polyclinicId,
      doctorId: doc.doctorId,
      symptoms: doc.symptoms,
      complaintText: doc.complaintText,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(complaint: Omit<Complaint, "id">): Promise<Complaint> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(complaint as Record<string, unknown>);
    return { ...complaint, id: result.insertedId.toString() };
  }

  async findByPatientId(patientId: string): Promise<Complaint[]> {
    const coll = await this.getCollection();
    const docs = await coll.find({ patientId }).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByDoctorId(doctorId: string): Promise<Complaint[]> {
    const coll = await this.getCollection();
    const docs = await coll.find({ doctorId }).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }
}
