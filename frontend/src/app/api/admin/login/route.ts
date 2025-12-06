import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendUrl } from '@/lib/auth/serverTokens';

const BACKEND_URL = backendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    if (!correo || !password) {
      return NextResponse.json(
        { detail: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Call backend login
    const res = await fetch(`${BACKEND_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json(
        { detail: 'Error parsing backend response' },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { detail: data?.detail || 'Credenciales inválidas' },
        { status: res.status }
      );
    }

    // Backend returns: { user: {...}, tokens: {...}, access: "...", refresh: "..." }
    const user = data?.user;
    const accessToken = data?.access || data?.tokens?.access;
    const refreshToken = data?.refresh || data?.tokens?.refresh;
    
    if (!user) {
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor - no user data' },
        { status: 500 }
      );
    }
    
    if (!user.is_staff && !user.is_superuser) {
      return NextResponse.json(
        { detail: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    // Set HttpOnly cookies for tokens
    const cookieStore = await cookies();
    
    if (accessToken) {
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15, // 15 minutes
        path: '/',
      });
    }

    if (refreshToken) {
      cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    // Return only user data (no tokens to client)
    return NextResponse.json({
      user,
      allowed: true,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'Error del servidor: ' + String(error) },
      { status: 500 }
    );
  }
}
