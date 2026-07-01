import { Collection } from "mongodb";
import clientPromise from "../mongodb";
import { Invoice } from "@/core/entities/Invoice";
import { IBillingRepository } from "@/core/interfaces/IBillingRepository";

export class MongoBillingRepository implements IBillingRepository {
  private async getCollection(): Promise<Collection> {
    const client = await clientPromise;
    const db = client.db("medixai");
    return db.collection("invoices");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(doc: any): Invoice {
    return {
      id: doc._id?.toString() || doc.id,
      patientId: doc.patientId,
      hospitalId: doc.hospitalId,
      prescriptionId: doc.prescriptionId,
      amount: doc.amount,
      status: doc.status,
      paymentMethod: doc.paymentMethod,
      paymentReference: doc.paymentReference,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async create(invoice: Omit<Invoice, "id">): Promise<Invoice> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(invoice as Record<string, unknown>);
    return { ...invoice, id: result.insertedId.toString() } as Invoice;
  }

  async findById(id: string): Promise<Invoice | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ id });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByPatientId(patientId: string): Promise<Invoice[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ patientId }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ status }).toArray();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { id },
      { $set: { status, updatedAt: new Date() } }
    );
  }
}
