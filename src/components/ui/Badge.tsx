'use client';

interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variants = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-surface-variant text-on-surface-variant border-outline-variant',
};

export default function Badge({ variant, children, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
