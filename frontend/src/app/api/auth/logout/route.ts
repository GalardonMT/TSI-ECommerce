import { NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/auth/logoutHelper";

export async function POST(request: NextRequest) {
  return buildLogoutResponse(request, "auth");
}
