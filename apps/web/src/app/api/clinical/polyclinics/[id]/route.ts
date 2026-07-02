export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { MongoPolyclinicRepository } from "@/infrastructure/database/repositories/MongoPolyclinicRepository";

const polyclinicRepo = new MongoPolyclinicRepository();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await polyclinicRepo.update(id, body);
    return NextResponse.json({ polyclinic: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await polyclinicRepo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
