import { ICommand } from '@nestjs/cqrs';
import { MedicineLineItem } from '../../domain/entities/Prescription';

export class CreatePrescriptionCommand implements ICommand {
  constructor(
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly hospitalId: string,
    public readonly medicines: MedicineLineItem[],
  ) {}
}
