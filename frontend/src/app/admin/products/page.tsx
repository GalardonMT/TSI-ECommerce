import AdminProductsList from '@/components/admin/products/AdminProductsList';

export default async function AdminProductsPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""; 
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
