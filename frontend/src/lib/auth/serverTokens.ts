import { NextResponse } from 'next/server';

const RAW_BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000';

const BACKEND = RAW_BACKEND.replace(/\/$/, '');

const ACCESS_COOKIE_NAMES = ['access_token', 'access', 'token'];
const REFRESH_COOKIE_NAMES = ['refresh_token', 'refresh'];

export type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

function pickFromCookieHeader(header: string | null | undefined, names: string[]): string | null {
  if (!header) return null;
  for (const name of names) {
    const regex = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
    const match = header.match(regex);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

function pickFromCookieStore(store: CookieReader | undefined, names: string[]): string | null {
  if (!store) return null;
  for (const name of names) {
    const value = store.get?.(name)?.value;
    if (value) return value;
  }
  return null;
}

export function extractAccessToken(source: { headers?: Headers; cookies?: CookieReader | null }): string | null {
  const authHeader = source.headers?.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = source.headers?.get('cookie') || null;
  return (
    pickFromCookieStore(source.cookies ?? undefined, ACCESS_COOKIE_NAMES) ||
    pickFromCookieHeader(cookieHeader, ACCESS_COOKIE_NAMES)
  );
}

export function extractRefreshToken(source: { headers?: Headers; cookies?: CookieReader | null }): string | null {
  const cookieHeader = source.headers?.get('cookie') || null;
  return (
    pickFromCookieStore(source.cookies ?? undefined, REFRESH_COOKIE_NAMES) ||
    pickFromCookieHeader(cookieHeader, REFRESH_COOKIE_NAMES)
  );
}

async function fetchUser(accessToken: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.access || null;
  } catch {
    return null;
  }
}

export type AuthResolution = {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  refreshedAccessToken: string | null;
};

export async function resolveUser(source: { headers?: Headers; cookies?: CookieReader | null }): Promise<AuthResolution> {
  let accessToken = extractAccessToken(source);
  const refreshToken = extractRefreshToken(source);

  let user: any | null = null;
  let refreshedAccessToken: string | null = null;

  if (accessToken) {
    user = await fetchUser(accessToken);
  }

  if (!user && refreshToken) {
    refreshedAccessToken = await refreshAccessToken(refreshToken);
    if (refreshedAccessToken) {
      accessToken = refreshedAccessToken;
      user = await fetchUser(refreshedAccessToken);
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    refreshedAccessToken,
  };
}

type RoleRequirement = 'any' | 'staff' | 'superuser';

function hasRequiredRole(user: any, role: RoleRequirement): boolean {
  if (!user) return false;
  if (role === 'any') return true;
  if (role === 'staff') return !!(user.is_staff || user.is_superuser);
  if (role === 'superuser') return !!user.is_superuser;
  return false;
}

export async function requireUser(source: { headers?: Headers; cookies?: CookieReader | null }, role: RoleRequirement = 'any') {
  const resolution = await resolveUser(source);
  if (!resolution.user) return null;
  if (!hasRequiredRole(resolution.user, role)) return null;
  return resolution;
}

export function applyRefreshedAccessCookie(response: NextResponse, token: string | null | undefined) {
  if (!token) return;
  response.cookies.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  });
}

export function backendUrl() {
  return BACKEND;
}

export function accessCookieNames() {
  return [...ACCESS_COOKIE_NAMES];
}

export function refreshCookieNames() {
  return [...REFRESH_COOKIE_NAMES];
}
