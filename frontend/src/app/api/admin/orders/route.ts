import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/verifyToken";
import { applyRefreshedAccessCookie, backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function GET(request: NextRequest) {
  const staffUser = await requireStaff(request.headers);
  if (!staffUser) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (staffUser as any).access as string | undefined;
  const refreshed = (staffUser as any).refreshedAccess as string | undefined;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const backendResponse = await fetch(`${BACKEND}/api/ventas/reservas-admin/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await backendResponse.json().catch(() => null);
  const response = NextResponse.json(data, { status: backendResponse.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}

export async function PATCH(request: NextRequest) {
  const staffUser = await requireStaff(request.headers);
  if (!staffUser) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (staffUser as any).access as string | undefined;
  const refreshed = (staffUser as any).refreshedAccess as string | undefined;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const { id_reserva, estado } = body as { id_reserva?: number; estado?: string };
  if (!id_reserva || !estado) {
    return NextResponse.json({ detail: "id_reserva y estado son requeridos" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const backendResponse = await fetch(`${BACKEND}/api/ventas/reservas-admin/${id_reserva}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ estado }),
  });

  const data = await backendResponse.json().catch(() => null);
  const response = NextResponse.json(data, { status: backendResponse.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}
