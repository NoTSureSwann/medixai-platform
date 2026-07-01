import { ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { Appointment, AppointmentStatus } from "../../../core/entities/Appointment";
import { IAppointmentRepository } from "../../../core/interfaces/IAppointmentRepository";

export class MongoAppointmentRepository implements IAppointmentRepository {
  private collectionName = "appointments";

  private async getCollection() {
    const client = await clientPromise;
    return client.db("medixai").collection<Omit<Appointment, "id">>(this.collectionName);
  }

  private mapDocumentToAppt(doc: Record<string, unknown>): Appointment {
    const { _id, ...rest } = doc;
    return { id: String(_id), ...rest } as Appointment;
  }

  async findById(id: string): Promise<Appointment | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await collection.findOne({ _id: new ObjectId(id) as any });
    return doc ? this.mapDocumentToAppt(doc) : null;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ patientId }).sort({ scheduledTime: -1 }).toArray();
    return docs.map(this.mapDocumentToAppt);
  }

  async findByDoctorId(doctorId: string, date?: Date): Promise<Appointment[]> {
    const collection = await this.getCollection();
    const query: Record<string, unknown> = { doctorId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.scheduledTime = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    const docs = await collection.find(query).sort({ scheduledTime: 1 }).toArray();
    return docs.map(this.mapDocumentToAppt);
  }

  async create(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(appointment);
    return { ...appointment, id: result.insertedId.toString() };
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    if (!ObjectId.isValid(id)) return null;
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: new ObjectId(id) as any },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result ? this.mapDocumentToAppt(result) : null;
  }
}
