'use client';

import { User } from '@/store/authStore';
import Badge from './Badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  onEditTarget?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onToggleActive?: (user: User) => void;
  isManagerView?: boolean;
}

export default function UserTable({
  users,
  isLoading = false,
  emptyMessage = 'No users found',
  showActions = false,
  onEditTarget,
  onResetPassword,
  onToggleActive,
  isManagerView = false,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-container rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'info' as const;
      case 'manager': return 'warning' as const;
      case 'worker': return 'success' as const;
      default: return 'neutral' as const;
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-surface-container/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Staff</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Target</th>
              {showActions && <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-6">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-on-surface">{u.name}</div>
                    <div className="text-xs text-on-surface-variant">{u.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={roleBadgeVariant(u.role)} size="sm">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <div className="flex items-center gap-1.5 text-green-600 text-sm">
                      <CheckCircle size={14} />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-error text-sm">
                      <XCircle size={14} />
                      Inactive
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-on-surface">
                  {u.role === 'worker' ? (u.dailyTarget ? `${u.dailyTarget} pairs` : '—') : '—'}
                </td>
                {showActions && (
                  <td className="px-4 py-3 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === 'worker' && onEditTarget && (
                        <button
                          onClick={() => onEditTarget(u)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                        >
                          Edit Target
                        </button>
                      )}
                      {onResetPassword && (
                        <button
                          onClick={() => onResetPassword(u)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                        >
                          Reset Pass
                        </button>
                      )}
                      {onToggleActive && (
                        <button
                          onClick={() => onToggleActive(u)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            u.isActive
                              ? 'border-error/40 text-error hover:bg-error/5'
                              : 'border-green-400 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
