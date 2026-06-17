'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Download } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ProductionTable from '@/components/ui/ProductionTable';
import StockTable from '@/components/ui/StockTable';
import { getProductionLogs, getWorkerPerformance, getProductBreakdown, ProductionLog, ProductionFilter } from '@/services/production';
import { getStock, getMaterialCategories, MaterialCategory } from '@/services/stock';
import { getDateRange } from '@/utils/dateHelpers';
import { exportToExcel, exportToPDF } from '@/utils/export';

type Period = 'today' | 'week' | 'month' | 'custom';
type DateRangePeriod = 'today' | 'week' | 'month';

export default function OwnerDashboard() {
  // Auth state managed via restoreSession in layout
  const [period, setPeriod] = useState<Period>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [workers, setWorkers] = useState<{ workerId: string; workerName: string; totalPairs: number }[]>([]);
  const [productBreakdown, setProductBreakdown] = useState<{ productName: string; sku: string; totalPairs: number }[]>([]);
  const [stock, setStock] = useState<unknown>(null);
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedStockMaterial, setSelectedStockMaterial] = useState<'leather' | 'buckle' | 'footbed'>('leather');
  const PAGE_SIZE = 20;

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    let filter: ProductionFilter = {};
    if (period === 'custom') {
      filter = { 
        startDate: customStart || undefined, 
        endDate: customEnd || undefined 
      };
    } else {
      const range = getDateRange(period as DateRangePeriod);
      filter = { startDate: range.startDate, endDate: range.endDate };
    }

    const [logsRes, workersRes, productsRes, stockRes, categoriesRes] = await Promise.all([
      getProductionLogs(filter, 1, 200),
      getWorkerPerformance(filter.startDate || '', filter.endDate),
      getProductBreakdown(filter.startDate || '', filter.endDate),
      getStock(),
      getMaterialCategories(),
    ]);

    setLogs(logsRes.logs);
    setWorkers(workersRes);
    setProductBreakdown(productsRes);
    setStock(stockRes);
    setMaterialCategories(categoriesRes);

    setIsLoading(false);
  }, [period, customStart, customEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]);

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = {
      headers: ['Worker', 'Product', 'SKU', 'Gender', 'Size', 'Qty', 'Date'],
      rows: logs.map((l) => [l.workerName, l.productName, l.sku, l.gender, `EU ${l.euSize}`, l.quantityPairs, l.logDate]),
      filename: `production-report-${period}`,
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

  // Calculate period stats
  const periodPairs = logs.reduce((sum, l) => sum + l.quantityPairs, 0);
  const periodLeather = logs.reduce((sum, l) => sum + l.leatherDeductedSqf, 0);
  const periodBuckle = logs.reduce((sum, l) => sum + (l.buckleDeducted || 0), 0);
  const periodFootbed = logs.reduce((sum, l) => sum + (l.footbedDeducted || 0), 0);

  const periodLabel =
    period === 'today' ? 'Today' :
    period === 'week' ? 'This Week' :
    period === 'month' ? 'This Month' :
    'Custom';

  return (
    <div className="space-y-6">
      {/* Period Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-surface-container rounded-lg w-full md:w-auto">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setShowDatePicker(false); }}
              className={`text-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full sm:w-auto text-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              period === 'custom'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar size={14} className="shrink-0" />
            <span className="truncate">Custom</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleExport('excel')}
            className="btn-secondary text-sm flex-1 md:flex-initial justify-center"
          >
            <Download size={14} />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary text-sm flex-1 md:flex-initial justify-center"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {showDatePicker && (
        <div className="card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="label-caps text-on-surface-variant block mb-1">From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => { setCustomStart(e.target.value); setPeriod('custom'); }}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="input-field cursor-pointer"
              />
            </div>
            <div className="w-full">
              <label className="label-caps text-on-surface-variant block mb-1">To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => { setCustomEnd(e.target.value); setPeriod('custom'); }}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="input-field cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pairs Produced"
          value={`${periodPairs} pairs`}
          sublabel={`${periodLabel} production`}
        />
        <StatCard
          label="Leather Used"
          value={`${periodLeather.toFixed(1)} sqf`}
          sublabel={`${periodLabel} consumption`}
        />
        <StatCard
          label="Buckles Used"
          value={`${periodBuckle} pcs`}
          sublabel={`${periodLabel} consumption`}
        />
        <StatCard
          label="Footbeds Used"
          value={`${periodFootbed} pcs`}
          sublabel={`${periodLabel} consumption`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Performance */}
        <div className="card p-4 lg:p-5">
          <h2 className="font-semibold text-on-surface mb-4">Worker Performance</h2>
          {workers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No production data</p>
          ) : (
            <div className="space-y-2">
              {workers
                .sort((a, b) => b.totalPairs - a.totalPairs)
                .map((w, i) => (
                  <div key={w.workerId} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-leather-tan/20 text-leather-tan' :
                        i === 1 ? 'bg-surface-variant text-on-surface-variant' :
                        i === 2 ? 'bg-surface-variant text-on-surface-variant' :
                        'text-on-surface-variant'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-on-surface">{w.workerName}</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">{w.totalPairs} pairs</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Product Breakdown */}
        <div className="card p-4 lg:p-5">
          <h2 className="font-semibold text-on-surface mb-4">Product Breakdown</h2>
          {productBreakdown.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No production data</p>
          ) : (
            <div className="space-y-2">
              {productBreakdown.map((p) => (
                <div key={p.sku} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm text-on-surface truncate">{p.productName}</div>
                    <div className="text-xs text-on-surface-variant font-mono">{p.sku}</div>
                  </div>
                  <span className="text-sm font-semibold text-on-surface ml-4">{p.totalPairs} pairs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Production Table */}
      <div>
        <h2 className="font-semibold text-on-surface mb-3">Production Log</h2>
        <ProductionTable
          logs={paginatedLogs}
          isLoading={isLoading}
          emptyMessage="No production entries for this period"
          showWorker={true}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
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

      {/* Stock Overview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-on-surface">Raw Material Stock</h2>
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg self-start sm:self-auto">
            {(['leather', 'buckle', 'footbed'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedStockMaterial(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  selectedStockMaterial === m
                    ? 'bg-leather-tan text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <StockTable
          stock={stock as import('@/services/stock').Stock}
          isLoading={isLoading}
          thresholds={(stock as import('@/services/stock').Stock)?.thresholds}
          material={selectedStockMaterial}
          categories={materialCategories.filter((c) => c.type === selectedStockMaterial)}
        />
      </div>
    </div>
  );
}
