import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePrescriptionHandler } from '../application/handlers/create-prescription.handler';
import { AnalyticsClientService } from '../infrastructure/grpc/analytics-client.service';
import { ClinicalController } from '../presentation/clinical.controller';

@Module({
  imports: [CqrsModule],
  controllers: [ClinicalController],
  providers: [CreatePrescriptionHandler, AnalyticsClientService],
  exports: [CreatePrescriptionHandler, AnalyticsClientService],
})
export class ClinicalModule {}
