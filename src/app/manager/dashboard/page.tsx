'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ProductionTable from '@/components/ui/ProductionTable';
import { getProductionLogs, ProductionLog } from '@/services/production';
import { getStock } from '@/services/stock';
import { getUsers } from '@/services/users';
import { getDateRange } from '@/utils/dateHelpers';
import { exportToExcel, exportToPDF } from '@/utils/export';
import { User } from '@/store/authStore';

type Period = 'today' | 'week' | 'month';

export default function ManagerDashboard() {
  // Auth state managed via restoreSession in layout
  const [period, setPeriod] = useState<Period>('today');
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stock, setStock] = useState<any>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchData = async () => {
    setIsLoading(true);

    const range = getDateRange(period);
    const filter: any = { startDate: range.startDate, endDate: range.endDate };
    if (selectedWorker !== 'all') {
      filter.workerId = selectedWorker;
    }

    const [logsRes, stockRes, workersRes] = await Promise.all([
      getProductionLogs(filter, 1, 200),
      getStock(),
      getUsers(),
    ]);

    setLogs(logsRes.logs);
    setTotalLogs(logsRes.total);
    setStock(stockRes);
    setWorkers(workersRes.filter((w) => w.role === 'worker'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [period, selectedWorker, page]);

  // Calculate stats
  const totalPairs = logs.reduce((sum, l) => sum + l.quantityPairs, 0);
  const totalLeather = logs.reduce((sum, l) => sum + l.leatherDeductedSqf, 0);
  const totalBuckles = logs.reduce((sum, l) => sum + l.buckleDeducted, 0);
  const totalFootbeds = logs.reduce((sum, l) => sum + l.footbedDeducted, 0);

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = {
      headers: ['Worker', 'Product', 'SKU', 'Gender', 'Size', 'Qty', 'Date'],
      rows: logs.map((l) => [l.workerName, l.productName, l.sku, l.gender, `EU ${l.euSize}`, l.quantityPairs, l.logDate]),
      filename: `production-log-${period}-${new Date().toISOString().split('T')[0]}`,
      title: `Production Log - ${period.toUpperCase()}`,
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
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pairs"
          value={totalPairs}
          sublabel={`${period.toUpperCase()} period`}
        />
        <StatCard
          label="Leather Used"
          value={`${totalLeather.toFixed(1)} sqm`}
          sublabel="Total consumption"
        />
        <StatCard
          label="Buckles Used"
          value={`${totalBuckles} pcs`}
          sublabel="Total consumption"
        />
        <StatCard
          label="Footbeds Used"
          value={`${totalFootbeds} pcs`}
          sublabel="Total consumption"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg w-full sm:w-auto">
            {(['today', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setPage(1); }}
                className={`flex-1 sm:flex-initial text-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <select
            value={selectedWorker}
            onChange={(e) => { setSelectedWorker(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-auto min-w-[140px]"
          >
            <option value="all">All Workers</option>
            {workers.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
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

      {/* Production Log */}
      <div>
        <h2 className="font-semibold text-on-surface mb-3">Production Log</h2>
        <ProductionTable
          logs={paginatedLogs}
          isLoading={isLoading}
          emptyMessage="No production entries found"
          showWorker={true}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-on-surface-variant">
              Page {page} of {totalPages} ({logs.length} entries)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                Previous
              </button>
              <span className="text-sm text-on-surface-variant">{page}</span>
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
    </div>
  );
}
