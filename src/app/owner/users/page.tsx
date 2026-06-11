'use client';

import { useState, useEffect } from 'react';
import UserTable from '@/components/ui/UserTable';
import { getUsers } from '@/services/users';
import { User } from '@/store/authStore';

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getUsers();
      setUsers(result);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const total = users.length;
  const active = users.filter((u) => u.isActive).length;
  const managers = users.filter((u) => u.role === 'manager').length;
  const workers = users.filter((u) => u.role === 'worker').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-on-surface">Staff Directory</h1>
        <p className="text-sm text-on-surface-variant">Read-only view of all staff accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Total Staff</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{total}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Active</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{active}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Managers</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{managers}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Workers</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{workers}</div>
        </div>
      </div>

      {/* Read-only User Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        emptyMessage="No staff accounts found"
        showActions={false}
      />
    </div>
  );
}
