'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for stored tokens or auth info in localStorage
    try {
      const hasAuth = !!(
        localStorage.getItem('access') ||
        localStorage.getItem('refresh') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth')
      );
      if (!hasAuth) {
        // not authorized -> redirect to admin login
        router.replace('/admin/login');
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
    } catch (e) {
      // If localStorage access fails, redirect to login conservatively
      router.replace('/admin/login');
      setAuthorized(false);
    }
  }, [router]);

  function handleLogout() {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    } catch (e) {
      // ignore
    }
    router.push('/admin/login');
  }

  if (authorized === null) {
    // still checking: avoid flashing content
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Users</h2>
          <p className="mt-2 text-sm text-gray-600">Manage users, view registrations and activity.</p>
          <div className="mt-4">
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Open users</Link>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-gray-600">View and manage orders.</p>
          <div className="mt-4">
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">Open orders</Link>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Products</h2>
          <p className="mt-2 text-sm text-gray-600">Manage catalog items.</p>
          <div className="mt-4">
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">Open products</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
