import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser, backendUrl } from '@/lib/auth/serverTokens';
import { LOGOUT_COOKIE_NAMES } from '@/lib/auth/logoutHelper';

export const dynamic = 'force-dynamic';

async function logoutAction() {
  'use server';
  const cookieStore: any = await (cookies() as any);
  const refreshToken =
    cookieStore.get('refresh_token')?.value ??
    cookieStore.get('refresh')?.value ??
    null;

  if (refreshToken) {
    try {
      await fetch(`${backendUrl()}/api/auth/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      console.warn('[admin/logoutAction] backend logout failed', error);
    }
  }

  const secure = process.env.NODE_ENV === 'production';
  LOGOUT_COOKIE_NAMES.forEach((name) => {
    cookieStore.set(name, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });
  });

  redirect('/admin/login');
}

export default async function AdminPage() {
  // Some type setups mark cookies() as async; handle both.
  const cookieStore: any = await (cookies() as any); // ensure resolved
  const auth = await requireUser({ cookies: cookieStore }, 'staff');
  if (!auth?.user) redirect('/admin/login');

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Panel de administrador</h1>
        <form action={logoutAction}>
          <button className="px-3 py-2 bg-red-600 text-white rounded" type="submit">Cerrar sesión</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Usuarios</h2>
          <p className="mt-2 text-sm text-gray-600">Gestiona usuarios, visualiza registros y actividad.</p>
          <div className="mt-4">
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Abrir usuarios</Link>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Pedidos</h2>
          <p className="mt-2 text-sm text-gray-600">Visualiza y gestiona pedidos.</p>
          <div className="mt-4">
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">Abrir pedidos</Link>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Productos</h2>
          <p className="mt-2 text-sm text-gray-600">Gestiona los artículos del catálogo.</p>
          <div className="mt-4">
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">Abrir productos</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
