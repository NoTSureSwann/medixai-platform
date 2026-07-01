import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePrescriptionCommand } from '../application/commands/create-prescription.command';
import {
  MedicineLineItem,
  Prescription,
} from '../domain/entities/Prescription';

@Controller('clinical')
export class ClinicalController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('prescriptions')
  async createPrescription(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      hospitalId: string;
      medicines: MedicineLineItem[];
    },
  ): Promise<Prescription> {
    return this.commandBus.execute<CreatePrescriptionCommand, Prescription>(
      new CreatePrescriptionCommand(
        body.patientId,
        body.doctorId,
        body.hospitalId,
        body.medicines,
      ),
    );
  }

  @Get('healthz')
  healthCheck() {
    return { status: 'ok', service: 'core-service' };
  }
}
