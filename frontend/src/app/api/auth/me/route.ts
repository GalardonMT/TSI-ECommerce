import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { applyRefreshedAccessCookie, resolveUser } from '@/lib/auth/serverTokens';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { user, refreshedAccessToken } = await resolveUser({ headers: req.headers, cookies: cookieStore });
    if (!user) {
      return NextResponse.json({ detail: 'No autenticado' }, { status: 401 });
    }
    const response = NextResponse.json(user);
    applyRefreshedAccessCookie(response, refreshedAccessToken);
    return response;
  } catch (e) {
    return NextResponse.json({ detail: 'Error del servidor', error: String(e) }, { status: 500 });
  }
}
