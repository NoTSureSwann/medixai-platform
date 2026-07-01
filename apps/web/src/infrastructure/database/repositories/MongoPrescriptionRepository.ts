import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { Prescription } from "@/core/entities/Prescription";
import { IPrescriptionRepository } from "@/core/interfaces/IPrescriptionRepository";

export class MongoPrescriptionRepository implements IPrescriptionRepository {
  private async getCollection(): Promise<Collection> {
    const client = await clientPromise;
    const db = client.db("medixai");
    return db.collection("prescriptions");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): Prescription {
    return {
      id: doc._id?.toString() || doc.id,
      patientId: doc.patientId,
      doctorId: doc.doctorId,
      hospitalId: doc.hospitalId,
      status: doc.status,
      medicines: doc.medicines,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async create(prescription: Omit<Prescription, "id">): Promise<Prescription> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(prescription as Record<string, unknown>);
    return { ...prescription, id: result.insertedId.toString() };
  }

  async findById(id: string): Promise<Prescription | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ patientId }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByHospitalId(hospitalId: string): Promise<Prescription[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ hospitalId }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findAllByStatus(status: string): Promise<Prescription[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ status }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
  }
}
