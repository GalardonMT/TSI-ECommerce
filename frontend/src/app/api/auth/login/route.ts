import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}
