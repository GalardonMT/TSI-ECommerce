import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";

export async function GET() {
  const url = `${BACKEND.replace(/\/$/, '')}/api/inventario/producto/`;

  try {
    const res = await fetch(url);
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}