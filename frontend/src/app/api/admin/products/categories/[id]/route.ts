import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/verifyToken";
import { applyRefreshedAccessCookie, backendUrl } from "@/lib/auth/serverTokens";

const BACKEND = backendUrl();

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffUser = await requireStaff(request.headers);
  if (!staffUser) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = {};
  const accessToken = (staffUser as any).access as string | undefined;
  const refreshedToken = (staffUser as any).refreshedAccess as string | undefined;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const backendResponse = await fetch(`${BACKEND}/api/inventario/categoria/${id}/`, {
    method: "DELETE",
    headers,
  });

  const responseBody = await backendResponse.text();
  let parsedBody: any = null;
  if (responseBody) {
    try {
      parsedBody = JSON.parse(responseBody);
    } catch (error) {
      parsedBody = { detail: responseBody };
    }
  }

  if (!backendResponse.ok) {
    const errorResponse = NextResponse.json(
      parsedBody || { detail: "No se pudo eliminar la categoría" },
      { status: backendResponse.status }
    );
    applyRefreshedAccessCookie(errorResponse, refreshedToken);
    return errorResponse;
  }

  const successResponse = backendResponse.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(parsedBody || { ok: true }, { status: backendResponse.status });
  applyRefreshedAccessCookie(successResponse, refreshedToken);
  return successResponse;
}
