export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateRange(period: 'today' | 'week' | 'month' | 'custom', customDate?: string): { startDate: string; endDate: string } {
  const now = new Date();
  let endDate = now.toISOString().split('T')[0];

  let startDate: string;
  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    }
    case 'custom':
      startDate = customDate || endDate;
      endDate = customDate || endDate;
      break;
  }

  return { startDate, endDate };
}

export function formatEURSize(size: number): string {
  return `EU ${size}`;
}
