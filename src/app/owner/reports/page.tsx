'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import ProductionTable from '@/components/ui/ProductionTable';
import { getProductionLogs, ProductionLog } from '@/services/production';
import { getDateRange } from '@/utils/dateHelpers';
import { exportToExcel, exportToPDF } from '@/utils/export';

type Period = 'today' | 'week' | 'month' | 'custom';
type DateRangePeriod = 'today' | 'week' | 'month';

export default function OwnerReports() {
  const [period, setPeriod] = useState<Period>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [sortColumn, setSortColumn] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchLogs = async () => {
    setIsLoading(true);

    let filter: any = {};
    if (period === 'custom' && customStart && customEnd) {
      filter = { startDate: customStart, endDate: customEnd };
    } else {
      const range = getDateRange(period as DateRangePeriod);
      filter = { startDate: range.startDate, endDate: range.endDate };
    }

    const result = await getProductionLogs(filter, 1, 200);
    setLogs(result.logs);
    setTotalLogs(result.total);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [period, customStart, customEnd, page]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = {
      headers: ['Worker', 'Product', 'SKU', 'Gender', 'Size', 'Qty', 'Date'],
      rows: logs.map((l) => [l.workerName, l.productName, l.sku, l.gender, `EU ${l.euSize}`, l.quantityPairs, l.logDate]),
      filename: `production-report-${period}-${new Date().toISOString().split('T')[0]}`,
      title: `Production Report - ${period.toUpperCase()}`,
    };

    if (format === 'excel') {
      exportToExcel(data);
    } else {
      exportToPDF(data);
    }
  };

  // Client-side pagination
  const paginatedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Production Reports</h1>
          <p className="text-sm text-on-surface-variant">View and export production data</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container rounded-lg w-full md:w-auto">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPage(1); }}
              className={`flex-1 md:flex-initial text-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
          <button
            onClick={() => setPeriod(period === 'custom' ? 'today' : 'custom')}
            className={`flex-1 md:flex-initial text-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              period === 'custom'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar size={14} />
            Custom
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => handleExport('excel')} className="btn-secondary text-sm flex-1 md:flex-initial justify-center">
            <Download size={14} />
            Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary text-sm flex-1 md:flex-initial justify-center">
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {period === 'custom' && (
        <div className="card p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label-caps text-on-surface-variant block mb-1">From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-caps text-on-surface-variant block mb-1">To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-field"
              />
            </div>
            <button onClick={() => { setPeriod('custom'); fetchLogs(); }} className="btn-primary text-sm">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Production Table */}
      <ProductionTable
        logs={paginatedLogs}
        isLoading={isLoading}
        emptyMessage="No production entries for this period"
        showWorker={true}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Showing page {page} of {totalPages} ({logs.length} entries)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
