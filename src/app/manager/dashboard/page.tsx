'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Package, X, Calendar } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ProductionTable from '@/components/ui/ProductionTable';
import { getProductionLogs, ProductionLog, ProductionFilter } from '@/services/production';
import { getStock } from '@/services/stock';
import { getUsers } from '@/services/users';
import { getDateRange } from '@/utils/dateHelpers';
import { exportToExcel, exportToPDF } from '@/utils/export';
import { User } from '@/store/authStore';

type Period = 'today' | 'week' | 'month' | 'custom';
type MaterialType = 'leather' | 'buckle' | 'footbed';

export default function ManagerDashboard() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [period, setPeriod] = useState<Period>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [stock, setStock] = useState<unknown>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [breakdownModal, setBreakdownModal] = useState<{ open: boolean; material: MaterialType | null }>({ open: false, material: null });

  void stock; // Used in breakdown modal

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const range = getDateRange(period, period === 'custom' ? customDate : undefined);
    const filter: ProductionFilter = { startDate: range.startDate, endDate: range.endDate };
    if (selectedWorker !== 'all') {
      filter.workerId = selectedWorker;
    }

    const [logsRes, stockRes, workersRes] = await Promise.all([
      getProductionLogs(filter, 1, 200),
      getStock(),
      getUsers(),
    ]);

    setLogs(logsRes.logs);
    setStock(stockRes);
    setWorkers(workersRes.filter((w) => w.role === 'worker'));
    setIsLoading(false);
  }, [period, customDate, selectedWorker]);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]);

  // Calculate stats
  const totalPairs = logs.reduce((sum, l) => sum + l.quantityPairs, 0);
  const totalLeather = logs.reduce((sum, l) => sum + l.leatherDeductedSqf, 0);
  const totalBuckles = logs.reduce((sum, l) => sum + l.buckleDeducted, 0);
  const totalFootbeds = logs.reduce((sum, l) => sum + l.footbedDeducted, 0);

  // Calculate breakdown by category
  const leatherBreakdown = logs.reduce((acc: Record<string, number>, log) => {
    const type = log.leatherType || 'Unknown';
    acc[type] = (acc[type] || 0) + log.leatherDeductedSqf;
    return acc;
  }, {});

  const buckleBreakdown = logs.reduce((acc: Record<string, number>, log) => {
    const type = log.buckleType || 'Unknown';
    acc[type] = (acc[type] || 0) + log.buckleDeducted;
    return acc;
  }, {});

  const footbedBreakdown = logs.reduce((acc: Record<string, number>, log) => {
    const key = `${log.footbedGender} EU ${log.footbedEuSize} - ${log.footbedType}`;
    acc[key] = (acc[key] || 0) + log.footbedDeducted;
    return acc;
  }, {});

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
        <div
          onClick={() => setBreakdownModal({ open: true, material: 'leather' })}
          className="cursor-pointer"
        >
          <StatCard
            label="Leather Used"
            value={`${totalLeather.toFixed(1)} sqf`}
            sublabel="Click for breakdown"
            icon={<Package size={24} />}
          />
        </div>
        <div
          onClick={() => setBreakdownModal({ open: true, material: 'buckle' })}
          className="cursor-pointer"
        >
          <StatCard
            label="Buckles Used"
            value={`${totalBuckles} pcs`}
            sublabel="Click for breakdown"
            icon={<Package size={24} />}
          />
        </div>
        <div
          onClick={() => setBreakdownModal({ open: true, material: 'footbed' })}
          className="cursor-pointer"
        >
          <StatCard
            label="Footbeds Used"
            value={`${totalFootbeds} pcs`}
            sublabel="Click for breakdown"
            icon={<Package size={24} />}
          />
        </div>
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
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const picker = dateInputRef.current;
                  if (picker) {
                    try {
                      picker.showPicker();
                    } catch {
                      picker.click();
                    }
                  }
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  period === 'custom'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface bg-surface'
                }`}
              >
                <Calendar size={14} />
                {period === 'custom' ? customDate : 'Date'}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={period === 'custom' ? customDate : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomDate(e.target.value);
                    setPeriod('custom');
                    setPage(1);
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className="absolute inset-0 opacity-0 pointer-events-none"
              />
            </div>
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

      {/* Breakdown Modal */}
      {breakdownModal.open && breakdownModal.material && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setBreakdownModal({ open: false, material: null })} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md bg-factory-white rounded-2xl shadow-xl z-10 p-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-on-surface leading-tight min-w-0">
                {breakdownModal.material === 'leather' ? 'LEATHER' : breakdownModal.material === 'buckle' ? 'BUCKLES' : 'FOOTBEDS'} USAGE BREAKDOWN
              </h2>
              <button 
                onClick={() => setBreakdownModal({ open: false, material: null })} 
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-surface-container transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {breakdownModal.material === 'leather' && (
                Object.keys(leatherBreakdown).length > 0 ? (
                  Object.entries(leatherBreakdown).map(([type, qty]) => (
                    <div key={type} className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                      <span className="text-sm text-on-surface">{type}</span>
                      <span className="text-sm font-semibold text-leather-tan">{qty.toFixed(2)} sqf</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-4">No leather usage for this period</p>
                )
              )}
              {breakdownModal.material === 'buckle' && (
                Object.keys(buckleBreakdown).length > 0 ? (
                  Object.entries(buckleBreakdown).map(([type, qty]) => (
                    <div key={type} className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                      <span className="text-sm text-on-surface">{type}</span>
                      <span className="text-sm font-semibold text-leather-tan">{qty} pcs</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-4">No buckle usage for this period</p>
                )
              )}
              {breakdownModal.material === 'footbed' && (
                Object.keys(footbedBreakdown).length > 0 ? (
                  Object.entries(footbedBreakdown).map(([key, qty]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                      <span className="text-sm text-on-surface">{key}</span>
                      <span className="text-sm font-semibold text-leather-tan">{qty} pcs</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-4">No footbed usage for this period</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
