import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/verifyToken";
import { applyRefreshedAccessCookie, backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function POST(request: NextRequest) {
  const staffUser = await requireStaff(request.headers);
  if (!staffUser) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ detail: "Invalid payload" }, { status: 400 });
  }

  if (!payload.nombre || typeof payload.nombre !== "string" || !payload.nombre.trim()) {
    return NextResponse.json({ detail: "El nombre de la categoría es obligatorio" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const accessToken = (staffUser as any).access as string | undefined;
  const refreshedToken = (staffUser as any).refreshedAccess as string | undefined;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const backendResponse = await fetch(`${BACKEND}/api/inventario/categoria/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await backendResponse.json().catch(() => null);
  const response = NextResponse.json(data, { status: backendResponse.status });
  applyRefreshedAccessCookie(response, refreshedToken);
  return response;
}
