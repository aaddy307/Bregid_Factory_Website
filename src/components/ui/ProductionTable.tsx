'use client';

import { formatEURSize } from '@/utils/dateHelpers';

interface ProductionRow {
  _id: string;
  workerName: string;
  productName: string;
  sku: string;
  gender: 'Men' | 'Women';
  euSize: number;
  quantityPairs: number;
  timestamp: string;
  logDate: string;
}

interface ProductionTableProps {
  logs: ProductionRow[];
  isLoading?: boolean;
  emptyMessage?: string;
  showWorker?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export default function ProductionTable({
  logs,
  isLoading = false,
  emptyMessage = 'No production entries found',
  showWorker = true,
  sortColumn,
  sortDirection,
  onSort,
}: ProductionTableProps) {
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

  if (logs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1 text-leather-tan">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:text-on-surface select-none"
      onClick={() => onSort?.(column)}
    >
      {children}
      {renderSortIcon(column)}
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-surface-container/50">
            <tr>
              {showWorker && <SortableHeader column="workerName">Worker</SortableHeader>}
              <SortableHeader column="productName">Product</SortableHeader>
              <SortableHeader column="sku">SKU</SortableHeader>
              <SortableHeader column="gender">Gender</SortableHeader>
              <SortableHeader column="euSize">Size</SortableHeader>
              <SortableHeader column="quantityPairs">Qty</SortableHeader>
              <SortableHeader column="logDate">Date</SortableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-surface-container-low transition-colors">
                {showWorker && (
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{log.workerName}</td>
                )}
                <td className="px-4 py-3 text-sm text-on-surface">{log.productName}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant font-mono">{log.sku}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    log.gender === 'Men' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {log.gender}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface">{formatEURSize(log.euSize)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-on-surface">{log.quantityPairs}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">{log.logDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
