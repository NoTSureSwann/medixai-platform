import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, Transport } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import * as rxjs from 'rxjs';

interface ActivityRequest {
  userId: string;
  role: string;
  action: string;
  details: string;
}

interface ActivityResponse {
  success: boolean;
  message: string;
}

interface ReportRequest {
  month: string;
  year: string;
}

interface ReportResponse {
  reportId: string;
  pdfUrl: string;
  totalAppointments: number;
  totalRevenue: number;
  status: string;
}

interface GeospatialRequest {
  region: string;
}

interface DiseaseData {
  disease: string;
  cases: number;
  latitude: number;
  longitude: number;
}

interface GeospatialResponse {
  data: DiseaseData[];
}

interface AnalyticsServiceClient {
  trackActivity(request: ActivityRequest): rxjs.Observable<ActivityResponse>;
  generateMonthlyReport(
    request: ReportRequest,
  ): rxjs.Observable<ReportResponse>;
  getGeospatialData(
    request: GeospatialRequest,
  ): rxjs.Observable<GeospatialResponse>;
}

@Injectable()
export class AnalyticsClientService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'analytics',
      protoPath: join(
        __dirname,
        '../../../../../../packages/proto/analytics.proto',
      ),
      url: process.env.GOLANG_GRPC_URL || 'localhost:50051',
    },
  })
  private client: ClientGrpc;

  private analyticsService: AnalyticsServiceClient;

  onModuleInit() {
    this.analyticsService =
      this.client.getService<AnalyticsServiceClient>('AnalyticsService');
  }

  trackActivity(
    userId: string,
    role: string,
    action: string,
    details: string,
  ): rxjs.Observable<ActivityResponse> {
    return this.analyticsService.trackActivity({
      userId,
      role,
      action,
      details,
    });
  }

  generateMonthlyReport(
    month: string,
    year: string,
  ): rxjs.Observable<ReportResponse> {
    return this.analyticsService.generateMonthlyReport({ month, year });
  }

  getGeospatialData(region: string): rxjs.Observable<GeospatialResponse> {
    return this.analyticsService.getGeospatialData({ region });
  }
}
