import { NextResponse } from 'next/server';
import { extractAccessToken } from '@/lib/auth/serverTokens';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000';

async function forward(path: string, init?: RequestInit) {
  const url = `${BACKEND.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }
  const text = await res.text().catch(() => '');
  return new NextResponse(text, { status: res.status });
}

function buildHeaders(req: Request, extra: Record<string,string> = {}) {
  const cookieHeader = req.headers.get('cookie');
  const authHeader = req.headers.get('authorization');
  const headers: Record<string,string> = { ...extra };
  if (cookieHeader) headers.cookie = cookieHeader;
  if (authHeader) {
    headers.Authorization = authHeader;
  } else {
    const token = extractAccessToken({ headers: req.headers });
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function GET(req: Request) {
  // Prefer the canonical auth/me endpoint the backend exposes,
  // then try the users-specific path if present.
  const headers = buildHeaders(req);
  try {
    // backend exposes /api/auth/me/ (see backend/urls.py)
    const primary = await forward(`/api/auth/me/`, { headers });
    if (primary.status !== 404) return primary;
  } catch (e) {
    // ignore and try fallback
  }

  try {
    return await forward(`/api/usuarios/me/`, { headers });
  } catch (e) {
    return NextResponse.json({ detail: 'Backend unreachable' }, { status: 502 });
  }
}

export async function PATCH(req: Request) {
  const headers = buildHeaders(req, { 'Content-Type': 'application/json' });
  const body = await req.text().catch(() => '');

  // The backend defines the update endpoint as /api/usuarios/update/
  try {
    return await forward(`/api/usuarios/update/`, { method: 'PATCH', headers, body });
  } catch (e) {
    // fallback below
  }

  // If body contains id, try /api/usuarios/{id}/
  try {
    const parsed = JSON.parse(body || '{}');
    const id = parsed?.id || parsed?.user?.id || null;
    if (id) {
      return await forward(`/api/usuarios/${id}/`, { method: 'PATCH', headers, body });
    }
  } catch (e) {
    // ignore
  }

  // Last fallback: try auth/me (some backends accept PATCH here)
  try {
    return await forward(`/api/auth/me/`, { method: 'PATCH', headers, body });
  } catch (e) {
    return NextResponse.json({ detail: 'Backend unreachable or invalid request' }, { status: 502 });
  }
}
