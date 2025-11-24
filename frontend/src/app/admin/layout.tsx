'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setHasToken(true);
    }
  })

  return (
    <html lang='es'>
      <body>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          {hasToken && (<header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Pro Nano Chile — Admin</div>
              <nav className="space-x-4">
                <a href="/admin" className="text-sm text-gray-700 hover:underline">Dashboard</a>
                <a href="/admin/login" className="text-sm text-gray-700 hover:underline">Login</a>
                <a href="/" className="text-sm text-gray-500">Sitio</a>
              </nav>
            </div>
          </header>
          )}

          <main className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
