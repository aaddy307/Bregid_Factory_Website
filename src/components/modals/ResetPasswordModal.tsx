'use client';

import { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { resetUserPassword } from '@/services/users';
import { User } from '@/store/authStore';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const success = await resetUserPassword(user._id, newPassword);
    setIsSubmitting(false);

    if (success) {
      onClose();
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError('Failed to reset password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-factory-white rounded-2xl shadow-xl z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-leather-tan/10 flex items-center justify-center">
              <KeyRound size={20} className="text-leather-tan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Reset Password</h2>
              <p className="text-sm text-on-surface-variant">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="input-field"
              required
              minLength={6}
              autoFocus
            />
          </div>

          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="input-field"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
