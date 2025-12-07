import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";
import { getUserFromHeaders } from "@/lib/auth/verifyToken";

const BACKEND = backendUrl();

export async function GET(request: NextRequest) {
  // Ensure user is authenticated based on access cookie
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (user as any).access as string | undefined;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const backendResponse = await fetch(`${BACKEND}/api/ventas/carrito/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await backendResponse.json().catch(() => null);
  return NextResponse.json(data, { status: backendResponse.status });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (user as any).access as string | undefined;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ detail: 'Invalid JSON body' }, { status: 400 });
  }

  const backendResponse = await fetch(`${BACKEND}/api/ventas/carrito/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json().catch(() => null);
  return NextResponse.json(data, { status: backendResponse.status });
}
