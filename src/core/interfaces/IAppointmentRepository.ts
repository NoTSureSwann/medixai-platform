import { Appointment } from "../entities/Appointment";

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findByDoctorId(doctorId: string, date?: Date): Promise<Appointment[]>;
  create(appointment: Omit<Appointment, "id">): Promise<Appointment>;
  updateStatus(id: string, status: string): Promise<Appointment | null>;
}
