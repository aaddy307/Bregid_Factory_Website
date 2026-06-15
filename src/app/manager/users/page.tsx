'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import UserTable from '@/components/ui/UserTable';
import CreateAccountModal from '@/components/modals/CreateAccountModal';
import SetTargetModal from '@/components/modals/SetTargetModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import { getUsers, deactivateUser, activateUser } from '@/services/users';
import { User } from '@/store/authStore';
import { useAuthStore } from '@/store/authStore';

export default function ManagerUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    setUsers(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    const success = user.isActive
      ? await deactivateUser(user._id)
      : await activateUser(user._id);
    if (success) {
      fetchUsers();
    }
  };

  const total = users.length;
  const managers = users.filter((u) => u.role === 'manager').length;
  const workers = users.filter((u) => u.role === 'worker').length;
  const active = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Account Management</h1>
          <p className="text-sm text-on-surface-variant">Manage staff accounts, targets, and permissions</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
          <UserPlus size={16} />
          Create Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Total Staff</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{total}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Managers</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{managers}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Workers</div>
          <div className="text-2xl font-semibold text-on-surface mt-1">{workers}</div>
        </div>
        <div className="card p-4">
          <div className="label-caps text-on-surface-variant">Active</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{active}</div>
        </div>
      </div>

      {/* User Table with Actions */}
      <UserTable
        users={users}
        isLoading={isLoading}
        emptyMessage="No staff accounts found"
        showActions={true}
        onEditTarget={(u) => setTargetUser(u)}
        onResetPassword={(u) => setPasswordUser(u)}
        onToggleActive={handleToggleActive}
      />

      {/* Modals */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); fetchUsers(); }}
        userId={currentUser?._id || ''}
      />

      <SetTargetModal
        isOpen={!!targetUser}
        onClose={() => { setTargetUser(null); fetchUsers(); }}
        user={targetUser}
      />

      <ResetPasswordModal
        isOpen={!!passwordUser}
        onClose={() => { setPasswordUser(null); }}
        user={passwordUser}
      />
    </div>
  );
}
