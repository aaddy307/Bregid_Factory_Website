'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { createUser } from '@/services/users';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreateAccountModal({ isOpen, onClose, userId }: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'owner' | 'manager' | 'worker'>('worker');
  const [password, setPassword] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    const user = await createUser(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        dailyTarget: role === 'worker' ? parseInt(dailyTarget) || 0 : undefined,
        password,
      },
      userId
    );

    setIsSubmitting(false);

    if (user) {
      onClose();
      setName('');
      setEmail('');
      setPhone('');
      setRole('worker');
      setPassword('');
      setDailyTarget('');
    } else {
      setError('Failed to create account. Email may already be in use.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-factory-white rounded-2xl shadow-xl z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-leather-tan/10 flex items-center justify-center">
              <UserPlus size={20} className="text-leather-tan" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface">Create Account</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Julian R."
              className="input-field"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="input-field"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 XXX XXX XXXX"
              className="input-field"
            />
          </div>

          {/* Role */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['owner', 'manager', 'worker'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all capitalize ${
                    role === r
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Target (workers only) */}
          {role === 'worker' && (
            <div>
              <label className="label-caps text-on-surface-variant block mb-2">Daily Target (pairs)</label>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
                placeholder="e.g. 15"
                className="input-field"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
