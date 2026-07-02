export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { MongoPolyclinicRepository } from "@/infrastructure/database/repositories/MongoPolyclinicRepository";

const polyclinicRepo = new MongoPolyclinicRepository();

export async function GET() {
  try {
    const polyclinics = await polyclinicRepo.findAll();
    return NextResponse.json({ polyclinics });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const polyclinic = await polyclinicRepo.create({
      name: body.name,
      description: body.description,
      diseaseCategory: body.diseaseCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ polyclinic }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
