import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";
import { getUserFromHeaders } from "@/lib/auth/verifyToken";

const BACKEND = backendUrl();

export async function GET(request: NextRequest) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (user as any).access as string | undefined;
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const search = request.nextUrl.search;

  const backendResponse = await fetch(`${BACKEND}/api/ventas/pedidos/${search}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await backendResponse.json().catch(() => null);
  return NextResponse.json(data, { status: backendResponse.status });
}
