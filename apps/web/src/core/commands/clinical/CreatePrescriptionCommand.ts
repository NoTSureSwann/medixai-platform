import { ICommand } from "../../interfaces/ICommand";
import { Prescription, PrescriptionStatus, MedicineLineItem } from "../../entities/Prescription";
import { IPrescriptionRepository } from "../../interfaces/IPrescriptionRepository";

export class CreatePrescriptionCommand implements ICommand<Prescription> {
  constructor(
    public readonly payload: {
      patientId: string;
      doctorId: string;
      hospitalId: string;
      medicines: MedicineLineItem[];
    },
    private readonly prescriptionRepo: IPrescriptionRepository
  ) {}

  async execute(): Promise<Prescription> {
    const prescription: Omit<Prescription, "id"> = {
      patientId: this.payload.patientId,
      doctorId: this.payload.doctorId,
      hospitalId: this.payload.hospitalId,
      medicines: this.payload.medicines,
      status: PrescriptionStatus.PENDING,
      validationStatus: "PENDING_PHARMACY",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.prescriptionRepo.create(prescription);
  }
}
