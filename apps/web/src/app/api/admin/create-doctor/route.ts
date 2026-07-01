import { NextResponse } from "next/server";
import { CreateDoctorCommand } from "@/core/commands/admin/CreateDoctorCommand";
import { withAuth, AuthenticatedRequest } from "@/shared/middlewares/authMiddleware";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { UserRole } from "@/core/entities/User";
import { z } from "zod";

const createDoctorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  specialization: z.string().min(1),
});

async function postHandler(req: AuthenticatedRequest) {
  const body = await req.json();
  const data = createDoctorSchema.parse(body);

  const command = new CreateDoctorCommand();
  const result = await command.execute(data);

  return NextResponse.json(result, { status: 201 });
}

const securedHandler = withAuth(postHandler as unknown as (req: AuthenticatedRequest, ...args: unknown[]) => Promise<NextResponse>, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
export const POST = withErrorHandler(securedHandler as unknown as (req: Request) => Promise<NextResponse>);
