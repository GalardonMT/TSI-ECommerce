import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function POST(request: NextRequest) {
  let bodyText = await request.text().catch(() => "");
  let refreshToken: string | null = null;

  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed && typeof parsed.refresh === "string") {
        refreshToken = parsed.refresh;
      }
    } catch {
      // ignore invalid JSON and fallback to cookies
    }
  }

  if (!refreshToken) {
    refreshToken =
      request.cookies.get("refresh_token")?.value ??
      request.cookies.get("refresh")?.value ??
      null;
  }

  if (!refreshToken) {
    return NextResponse.json({ detail: "Refresh token missing" }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${BACKEND}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    let data: any = null;
    try {
      data = await backendResponse.json();
    } catch {
      data = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(data ?? { detail: "Refresh failed" }, { status: backendResponse.status });
    }

    const newAccess = data?.access ?? data?.token ?? data?.tokens?.access ?? null;
    const res = NextResponse.json(data);

    if (newAccess) {
      res.cookies.set("access_token", newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/",
      });
    }

    return res;
  } catch (e) {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}
