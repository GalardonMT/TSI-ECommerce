import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    const opts = { path: '/', maxAge: 0 } as const;
    res.cookies.set('access_token', '', opts);
    res.cookies.set('refresh_token', '', opts);
    res.cookies.set('access', '', opts);
    res.cookies.set('token', '', opts);
    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ detail: 'Error del servidor' }, { status: 500 });
  }
}
