import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
  // Accept a JSON body with { refresh: '...' } and forward to backend
  const body = await req.text().catch(() => '');
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  try {
    return await forward(`/api/auth/refresh/`, { method: 'POST', headers, body });
  } catch (e) {
    return NextResponse.json({ detail: 'Backend unreachable' }, { status: 502 });
  }
}
