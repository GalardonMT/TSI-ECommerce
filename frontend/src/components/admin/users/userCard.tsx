"use client";
import React from 'react';

export default function UserCard({ user, currentUserId, onEdit, onDelete }: { user: any; currentUserId?: number; onEdit: () => void; onDelete: () => void }) {
  function handleDeleteClick() {
    const name = user?.nombre || user?.correo || 'this user';
    const ok = confirm(`Eliminar ${name}? Esta acción no se puede deshacer.`);
    if (ok) onDelete();
  }

  const isSelf = currentUserId === user.id;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{user.nombre} {user.apellido_paterno || ''}</div>
          <div className="text-sm text-gray-600">{user.correo}</div>
          {isSelf && <div className="text-xs text-blue-600">(Tu cuenta)</div>}
        </div>
        <div className="text-right">
          <div className="text-sm">ID {user.id}</div>
          <div className="text-sm">{user.is_superuser ? 'Superuser' : user.is_staff ? 'Staff' : 'User'}</div>
        </div>
      </div>

      {!isSelf && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={onEdit} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Editar</button>
          <button onClick={handleDeleteClick} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Eliminar</button>
        </div>
      )}
    </div>
  );
}