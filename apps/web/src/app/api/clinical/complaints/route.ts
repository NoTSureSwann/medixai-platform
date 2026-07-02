export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { MongoComplaintRepository } from "@/infrastructure/database/repositories/MongoComplaintRepository";
import { ComplaintStatus } from "@/core/entities/Complaint";
import { forwardToGateway } from "@/lib/apiGateway";

const complaintRepo = new MongoComplaintRepository();

export async function GET(request: Request) {
  // Try forwarding to NestJS core service
  const gatewayResponse = await forwardToGateway(request, "nestjs", `/clinical/complaints`);
  if (gatewayResponse) return gatewayResponse;

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || request.headers.get("Authorization")?.replace("Bearer ", "");
    
    // For doctor dashboard
    const doctorId = searchParams.get('doctorId');

    if (!patientId && !doctorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For mock testing
    const safePatientId = patientId === "mock-patient-token" ? "patient-123" : patientId;
    const safeDoctorId = doctorId === "mock-doctor-token" ? "doc-123" : doctorId;
    
    let complaints;
    if (safeDoctorId) {
      complaints = await complaintRepo.findByDoctorId(safeDoctorId);
    } else if (safePatientId) {
      complaints = await complaintRepo.findByPatientId(safePatientId);
    }
    
    return NextResponse.json({ complaints });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Try forwarding to NestJS core service
  const gatewayResponse = await forwardToGateway(request, "nestjs", `/clinical/complaints`);
  if (gatewayResponse) return gatewayResponse;

  try {
    const patientToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!patientToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const safePatientId = body.patientId || (patientToken === "mock-patient-token" ? "patient-123" : patientToken);
    
    const complaint = await complaintRepo.create({
      patientId: safePatientId,
      patientName: body.patientName || "Unknown Patient",
      polyclinicId: body.polyclinicId,
      doctorId: body.doctorId || "doc-123",
      symptoms: body.symptoms,
      complaintText: body.complaintText,
      status: ComplaintStatus.SUBMITTED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
