import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000';

async function getMe(cookieHeader: string | null, authHeader: string | null) {
  const url = `${BACKEND.replace(/\/$/, '')}/api/auth/me/`;
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.cookie = cookieHeader;
  if (authHeader) headers.Authorization = authHeader;
  const res = await fetch(url, { headers: Object.keys(headers).length ? headers : undefined });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

export async function GET(req: Request) {
  // list users - forward Authorization or cookie headers to backend
  const cookieHeader = req.headers.get('cookie');
  const authHeader = req.headers.get('authorization');
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.cookie = cookieHeader;
  if (authHeader) headers.Authorization = authHeader;
  const url = `${BACKEND.replace(/\/$/, '')}/api/usuarios/users/`;
  const res = await fetch(url, { headers: Object.keys(headers).length ? headers : undefined });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  // create user - only superusers allowed (enforced here and backend)
  const cookieHeader = req.headers.get('cookie');
  const authHeader = req.headers.get('authorization');
  const me = await getMe(cookieHeader, authHeader).catch(() => null);
  if (!me || !me.is_superuser) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const url = `${BACKEND.replace(/\/$/, '')}/api/usuarios/users/`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookieHeader) headers.cookie = cookieHeader;
  if (authHeader) headers.Authorization = authHeader;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
