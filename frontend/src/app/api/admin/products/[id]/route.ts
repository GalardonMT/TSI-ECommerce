import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/verifyToken';
import { applyRefreshedAccessCookie, backendUrl } from '@/lib/auth/serverTokens';

const BACKEND = backendUrl();

// Helper to build backend detail URL ensuring single trailing slash
function backendDetailUrl(id: string | number) {
  return `${BACKEND}/api/inventario/producto/${id}/`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffUser = await requireStaff(req.headers);
  if (!staffUser) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const refreshed = (staffUser as any)?.refreshedAccess as string | undefined;
  const token = staffUser.access;
  const headers: Record<string,string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = backendDetailUrl(id);
  const res = await fetch(url, { headers, cache: 'no-store' });
  const data = await res.json().catch(() => null);
  const response = NextResponse.json(data, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffUser = await requireStaff(req.headers);
  if (!staffUser) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const refreshed = (staffUser as any)?.refreshedAccess as string | undefined;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ detail: 'Invalid JSON body' }, { status: 400 });
  const token = staffUser.access;
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = backendDetailUrl(id);
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  // Return serializer data (product) or error detail
  const response = NextResponse.json(data, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffUser = await requireStaff(req.headers);
  if (!staffUser) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const refreshed = (staffUser as any)?.refreshedAccess as string | undefined;
  const token = staffUser.access;
  const headers: Record<string,string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = backendDetailUrl(id);
  const res = await fetch(url, { method: 'DELETE', headers });
  if (!res.ok) {
    const errData = await res.json().catch(async () => {
      const text = await res.text().catch(() => '');
      return { detail: text || 'Delete failed' };
    });
    const response = NextResponse.json(errData, { status: res.status });
    applyRefreshedAccessCookie(response, refreshed);
    return response;
  }
  // Some backends return 204 No Content; NextResponse.json cannot be used with 204
  const response = res.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ ok: true }, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}
