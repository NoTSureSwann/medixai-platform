import { NextResponse } from "next/server";
import { DomainError } from "@/core/exceptions/DomainError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandler(handler: (req: Request, ...args: any[]) => any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: unknown) {
      console.error("API Error:", error);

      if (error instanceof DomainError) {
        return NextResponse.json(
          { error: error.name, message: error.message },
          { status: error.statusCode }
        );
      }

      // Handle Zod Validation Errors if used in the handler
      if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
        return NextResponse.json(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { error: "ValidationError", details: (error as any).errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "InternalServerError", message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}
