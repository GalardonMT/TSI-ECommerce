"use server";

type LoginResult = {
  ok: boolean;
  status: number;
  user?: any;
  tokens?: { access?: string; refresh?: string } | null;
  access?: string | null;
  refresh?: string | null;
  error?: string | null;
  allowed?: boolean;
};

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Attempts to authenticate against the backend and ensures the account has admin permissions.
 * This helper is intended to be used server-side (Next.js App Router API route or server action).
 * It forwards credentials to the Django login endpoint, returns the user and tokens, and sets
 * `allowed` to true only when the user is active and has admin permission (`is_staff` or `is_superuser`
 * or a role name that contains 'admin').
 */
export default async function adminAuth(correo: string, password: string): Promise<LoginResult> {
  const url = `${BACKEND.replace(/\/$/, '')}/api/auth/login/`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
      // keep cookies if backend and frontend are same origin; this helper does not set cookies itself
    });

    const status = res.status;
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, status, error: (data && (data.detail || data.error)) || 'Login failed', allowed: false };
    }

    const user = data?.user ?? null;
    const tokens = data?.tokens ?? null;
    const access = data?.access ?? (tokens ? tokens.access : null) ?? null;
    const refresh = data?.refresh ?? (tokens ? tokens.refresh : null) ?? null;

    // Determine admin permission
    let allowed = false;
    try {
      if (user) {
        if (user.is_active === false) allowed = false;
        else if (user.is_staff || user.is_superuser) allowed = true;
        else if (user.rol && typeof user.rol === 'object') {
          const nombre = (user.rol.nombre_rol || '').toString().toLowerCase();
          if (nombre.includes('admin') || nombre.includes('administrador')) allowed = true;
        }
      }
    } catch (e) {
      // If anything unexpected happens just deny access
      allowed = false;
    }

    return { ok: true, status, user, tokens, access, refresh, allowed };
  } catch (err: any) {
    return { ok: false, status: 0, error: String(err?.message || err), allowed: false };
  }
}