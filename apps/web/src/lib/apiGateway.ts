import { NextResponse } from "next/server";

const NESTJS_URL = process.env.NESTJS_SERVICE_URL || "http://localhost:5000";
const GOLANG_URL = process.env.GOLANG_SERVICE_URL || "http://localhost:50051";

export async function forwardToGateway(
  request: Request,
  service: "nestjs" | "golang",
  path: string
) {
  const url = service === "nestjs" ? `${NESTJS_URL}${path}` : `${GOLANG_URL}${path}`;
  
  try {
    const headers = new Headers(request.headers);
    
    // Perform fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
    
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.body ? request.body : undefined,
      signal: controller.signal,
    } as RequestInit);
    
    clearTimeout(timeout);
    
    // Return proxy response
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.warn(`[API Gateway] Failed to contact ${service} service at ${url}. Falling back to local handler.`, error);
    return null; // Return null so the local API route knows it should fallback
  }
}
