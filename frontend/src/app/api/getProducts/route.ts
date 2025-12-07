import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function GET() {
  try {
    const response = await fetch(`${BACKEND}/api/inventario/producto/`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}