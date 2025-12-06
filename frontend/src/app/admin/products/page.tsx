import AdminProductsList from '@/components/admin/products/AdminProductsList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { backendUrl, requireUser } from '@/lib/auth/serverTokens';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    // Basic gate: require access_token cookie
    const cookieStore: any = await (cookies() as any);
    const auth = await requireUser({ cookies: cookieStore }, 'staff');
    if (!auth?.user) redirect('/admin/login');

    const API_BASE = backendUrl();
    const url = `${API_BASE}/api/inventario/producto`;
    let products: any[] = [];
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) products = await res.json();
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Admin — Productos</h1>
            </div>
            <AdminProductsList products={products} />
        </div>
    );
}
