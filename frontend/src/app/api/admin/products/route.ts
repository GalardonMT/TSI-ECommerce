import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/verifyToken';
import { applyRefreshedAccessCookie, backendUrl } from '@/lib/auth/serverTokens';

const BACKEND = backendUrl();

export async function POST(req: Request) {
  // staff or superuser required for creating products
  const staffUser = await requireStaff(req.headers);
  if (!staffUser) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const refreshed = (staffUser as any)?.refreshedAccess as string | undefined;
  
  const body = await req.json().catch(() => null);
  const url = `${BACKEND}/api/inventario/producto/`;
  const token = staffUser.access;
  
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  const data = await res.json().catch(() => null);
  const response = NextResponse.json(data, { status: res.status });
  applyRefreshedAccessCookie(response, refreshed);
  return response;
}
