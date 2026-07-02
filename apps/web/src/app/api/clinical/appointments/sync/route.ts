export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

// A global counter or flag we can simulate changing data with
let mockVersion = Date.now();

// Simulate a database trigger updating the version every 10 seconds
setInterval(() => {
  mockVersion = Date.now();
}, 10000);

export async function GET(request: Request) {
  // Set up Server-Sent Events (SSE) headers
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection success message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "connected", timestamp: Date.now() })}\n\n`));

      // Keep connection alive and send updates
      const interval = setInterval(() => {
        const payload = {
          type: "APPOINTMENT_UPDATE",
          version: mockVersion,
          timestamp: Date.now(),
          message: "Data synced"
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }, 3000); // Check/Push every 3 seconds

      // Handle client disconnects if necessary (cleanup)
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
