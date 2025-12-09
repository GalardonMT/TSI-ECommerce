"use client";
import { useEffect, useState } from 'react';
import ModalCreateUser from '@/components/admin/users/modalCreateUser';
import ModalUpdateUser from '@/components/admin/users/modalUpdateUser';
import UserCard from '@/components/admin/users/userCard';
import { createUser, updateUser, deleteUser } from '@/app/api/admin/users/manageUsers';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      // Token sent automatically via HttpOnly cookie
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      // fetch current user
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        try { setCurrentUser(await meRes.json()); } catch {}
      }
    } catch (e) {
      setUsers([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(payload: any) {
    const res = await createUser(payload);
    if (res.ok) {
      setShowCreate(false);
      await load();
    }
    return res;
  }

  async function handleUpdate(id: number, payload: any) {
    const res = await updateUser(id, payload);
    if (res.ok) {
      setEditing(null);
      await load();
    }
    return res;
  }

  async function handleDelete(id: number) {
    const res = await deleteUser(id);
    if (res.ok) {
      window.location.reload();
      return res;
    }
    return res;
  }

  const searchTerm = search.trim().toLowerCase();
  const filtered = !searchTerm
    ? users
    : users.filter((u) => {
        const idMatch = u.id?.toString() === searchTerm; // exact ID match
        const nameMatch = `${u.nombre ?? ''} ${u.apellido_paterno ?? ''} ${u.apellido_materno ?? ''}`
          .toLowerCase()
          .includes(searchTerm);
        const emailMatch = (u.correo ?? u.email ?? '').toLowerCase().includes(searchTerm);
        return idMatch || nameMatch || emailMatch;
      });

  // grouped lists
  const superusers = filtered.filter((u) => u.is_superuser);
  const staffOnly = filtered.filter((u) => u.is_staff && !u.is_superuser);
  const nonStaff = filtered.filter((u) => !u.is_staff && !u.is_superuser);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Administrar usuarios</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID exacto, nombre o correo"
            className="border px-3 py-2 rounded text-sm w-72 md:w-96"
          />
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Crear empleado</button>
          <a
            href="/admin"
            className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
          >
            ← Volver a admin
          </a>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Superusuarios ({superusers.length})</h2>
            <div className="space-y-3">
              {superusers.map((u) => (
                <UserCard key={u.id} user={u} currentUserId={currentUser?.id} onEdit={() => setEditing(u)} onDelete={() => handleDelete(u.id)} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Personal ({staffOnly.length})</h2>
            <div className="space-y-3">
              {staffOnly.map((u) => (
                <UserCard key={u.id} user={u} currentUserId={currentUser?.id} onEdit={() => setEditing(u)} onDelete={() => handleDelete(u.id)} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Usuarios ({nonStaff.length})</h2>
            <div className="space-y-3">
              {nonStaff.map((u) => (
                <UserCard key={u.id} user={u} currentUserId={currentUser?.id} onEdit={() => setEditing(u)} onDelete={() => handleDelete(u.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreate && <ModalCreateUser onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {editing && <ModalUpdateUser user={editing} onClose={() => setEditing(null)} onUpdate={handleUpdate} />}
    </section>
  );
}
