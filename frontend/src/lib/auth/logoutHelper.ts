import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();
export const LOGOUT_COOKIE_NAMES = ["access_token", "refresh_token", "access", "token"] as const;

export async function buildLogoutResponse(request: NextRequest, logPrefix: string) {
  const refreshCookie =
    request.cookies.get("refresh_token")?.value ??
    request.cookies.get("refresh")?.value ??
    null;

  if (refreshCookie) {
    try {
      await fetch(`${BACKEND}/api/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshCookie }),
      });
    } catch (error) {
      console.warn(`[${logPrefix}] Failed to inform backend logout`, error);
    }
  }

  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  LOGOUT_COOKIE_NAMES.forEach((name) => {
    res.cookies.set(name, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
  });

  return res;
}
