import AdminOrdersTable from "@/components/admin/orders/AdminOrdersTable";

export default function AdminOrdersPage() {
	return (
		<section className="w-4/5 xl:w-3/5 mx-auto my-7">
			<h1 className="text-3xl mb-5">Gestión de reservas</h1>
			<AdminOrdersTable />
		</section>
	);
}

