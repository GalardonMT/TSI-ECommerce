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

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return NextResponse.json(data ?? { detail: "Credenciales inválidas" }, { status: response.status });
    }

    const user = data?.user ?? null;
    const accessToken = data?.access ?? data?.tokens?.access ?? null;
    const refreshToken = data?.refresh ?? data?.tokens?.refresh ?? null;

    const res = NextResponse.json({ user, access: accessToken, refresh: refreshToken });

    const secure = process.env.NODE_ENV === "production";
    if (accessToken) {
      res.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      });
    }

    if (refreshToken) {
      res.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}
