import { NextResponse } from "next/server";
import { RegisterPatientCommand } from "@/core/commands/auth/RegisterPatientCommand";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { z } from "zod";

const registerSchema = z.object({
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
});

async function postHandler(req: Request) {
  const body = await req.json();
  const data = registerSchema.parse(body);

  const command = new RegisterPatientCommand();
  const result = await command.execute(data);

  return NextResponse.json(result, { status: 201 });
}

export const POST = withErrorHandler(postHandler);
