import AdminOrdersTable from "@/components/admin/orders/AdminOrdersTable";

export default function AdminOrdersPage() {
	return (
		<section className="w-4/5 xl:w-3/5 mx-auto my-7">
			<div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
				<h1 className="text-3xl">Gestión de reservas</h1>
				<a
					href="/admin"
					className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
				>
					← Volver a admin
				</a>
			</div>
			<AdminOrdersTable />
		</section>
	);
}

