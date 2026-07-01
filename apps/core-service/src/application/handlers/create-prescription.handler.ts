import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePrescriptionCommand } from '../commands/create-prescription.command';
import { Prescription, PrescriptionStatus } from '../../domain/entities/Prescription';

@CommandHandler(CreatePrescriptionCommand)
export class CreatePrescriptionHandler implements ICommandHandler<CreatePrescriptionCommand> {
  // constructor(private readonly prescriptionRepo: IPrescriptionRepository) {}

  async execute(command: CreatePrescriptionCommand): Promise<Prescription> {
    const { patientId, doctorId, hospitalId, medicines } = command;

    const prescription: Prescription = {
      id: crypto.randomUUID(),
      patientId,
      doctorId,
      hospitalId,
      medicines,
      status: PrescriptionStatus.PENDING,
      validationStatus: 'PENDING_PHARMACY',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // return this.prescriptionRepo.create(prescription);
    return prescription;
  }
}
