import { NextResponse } from 'next/server';
import { requireSuperUser } from '@/lib/auth/verifyToken';
import { applyRefreshedAccessCookie, backendUrl } from '@/lib/auth/serverTokens';

const BACKEND = backendUrl();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const superUser = await requireSuperUser(req.headers);
  if (!superUser) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
  const refreshed = (superUser as any)?.refreshedAccess as string | undefined;
  const body = await req.json().catch(() => null);
  const url = `${BACKEND}/api/usuarios/users/${id}/`;
  const token = superUser.access;
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  const response = NextResponse.json(data, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const superUser = await requireSuperUser(req.headers);
  if (!superUser) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
  const refreshed = (superUser as any)?.refreshedAccess as string | undefined;
  const url = `${BACKEND}/api/usuarios/users/${id}/`;
  const token = superUser.access;
  const headers: Record<string,string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: 'DELETE', headers });
  const response = new NextResponse(null, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}
