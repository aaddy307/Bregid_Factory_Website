'use client';

import { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { setWorkerTarget } from '@/services/users';
import { User } from '@/store/authStore';

interface SetTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function SetTargetModal({ isOpen, onClose, user }: SetTargetModalProps) {
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setTarget(user.dailyTarget?.toString() || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const value = parseInt(target);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid target');
      return;
    }

    setIsSubmitting(true);
    const success = await setWorkerTarget(user._id, value);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError('Failed to update target');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-factory-white rounded-2xl shadow-xl z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-leather-tan/10 flex items-center justify-center">
              <Target size={20} className="text-leather-tan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Set Daily Target</h2>
              <p className="text-sm text-on-surface-variant">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Daily Target (pairs)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 15"
              className="input-field text-lg"
              min="0"
              autoFocus
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Set to 0 to remove target
            </p>
          </div>

          {error && (
            <div className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
