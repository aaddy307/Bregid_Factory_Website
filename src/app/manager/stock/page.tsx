'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Calendar, X } from 'lucide-react';
import StockCard from '@/components/ui/StockCard';
import StockTable from '@/components/ui/StockTable';
import AddStockModal from '@/components/modals/AddStockModal';
import { getStock, getStockLogs, Stock as StockType, StockLog, getMaterialCategories, MaterialCategory } from '@/services/stock';
import { useAuthStore } from '@/store/authStore';

export default function ManagerStockPage() {
  const { user } = useAuthStore();
  const [stock, setStock] = useState<StockType | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<StockLog | null>(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [activeTab, setActiveTab] = useState<'management' | 'history'>('management');
  const [selectedMaterial, setSelectedMaterial] = useState<'leather' | 'buckle' | 'footbed'>('leather');
  const [historyMaterial, setHistoryMaterial] = useState<'all' | 'leather' | 'buckle' | 'footbed'>('all');
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [historyDateFilter, setHistoryDateFilter] = useState<string | null>(null);

  const fetchStock = async () => {
    setIsLoading(true);
    const [stockData, logsData, categoriesData] = await Promise.all([
      getStock(),
      getStockLogs(50),
      getMaterialCategories(),
    ]);
    setStock(stockData);
    setStockLogs(logsData);
    setMaterialCategories(categoriesData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredLogs = stockLogs.filter((l) => {
    const matchesMaterial = historyMaterial === 'all' || l.material === historyMaterial;
    const matchesSupplier = !searchSupplier || (l.supplierName || '').toLowerCase().includes(searchSupplier.toLowerCase());
    const matchesDate = !historyDateFilter || l.timestamp.split('T')[0] === historyDateFilter;
    return matchesMaterial && matchesSupplier && matchesDate;
  });

  const isLeatherLow = stock?.thresholds ? (stock.leatherSqf ?? 0) <= stock.thresholds.leatherSqf : false;
  const isBuckleLow = stock?.thresholds ? (stock.buckleQty ?? 0) <= stock.thresholds.buckleQty : false;
  const totalFootbedQty = stock?.footbeds?.reduce((sum, fb) => sum + fb.qty, 0) || 0;
  const isFootbedLow = stock?.thresholds ? totalFootbedQty <= stock.thresholds.footbedQty : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Inventory Control</h1>
          <p className="text-sm text-on-surface-variant">Monitor and manage raw material inventory</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
          <Package size={16} />
          Add Stock Entry
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveTab('management')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'management'
              ? 'border-leather-tan text-leather-tan'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Stock Management
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-leather-tan text-leather-tan'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Stock History
        </button>
      </div>

      {/* Conditional Views */}
      {activeTab === 'management' ? (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="font-semibold text-on-surface mb-3">Material Stock</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <StockCard
                title="Leather"
                quantity={stock ? stock.leatherSqf.toLocaleString() : '-'}
                unit="sqf"
                isLow={isLeatherLow}
                threshold={stock?.thresholds?.leatherSqf}
                icon={<Package size={24} />}
                onClick={() => setSelectedMaterial('leather')}
                active={selectedMaterial === 'leather'}
              />
              <StockCard
                title="Buckle"
                quantity={stock ? stock.buckleQty.toLocaleString() : '-'}
                unit="pieces"
                isLow={isBuckleLow}
                threshold={stock?.thresholds?.buckleQty}
                icon={<Package size={24} />}
                onClick={() => setSelectedMaterial('buckle')}
                active={selectedMaterial === 'buckle'}
              />
              <StockCard
                title="Footbed"
                quantity={stock ? totalFootbedQty.toLocaleString() : '-'}
                unit="pieces"
                isLow={isFootbedLow}
                threshold={stock?.thresholds?.footbedQty}
                icon={<Package size={24} />}
                onClick={() => setSelectedMaterial('footbed')}
                active={selectedMaterial === 'footbed'}
              />
            </div>
          </div>

          <div>
            <StockTable
              stock={stock}
              isLoading={isLoading}
              thresholds={stock?.thresholds}
              material={selectedMaterial}
              categories={materialCategories.filter(c => c.type === selectedMaterial)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <h2 className="font-semibold text-on-surface">Stock Log History</h2>
                <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg">
                  {(['all', 'leather', 'buckle', 'footbed'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHistoryMaterial(m)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                        historyMaterial === m
                          ? 'bg-leather-tan text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none" />
                    <input
                      type="date"
                      value={historyDateFilter || ''}
                      onChange={(e) => setHistoryDateFilter(e.target.value || null)}
                      className="input-field pl-9 py-1.5 text-sm h-9 pr-8"
                      style={{ minWidth: '140px' }}
                    />
                    {historyDateFilter && (
                      <button
                        onClick={() => setHistoryDateFilter(null)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors"
                        style={{ lineHeight: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-64">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    placeholder="Search by supplier..."
                    className="input-field pl-9 py-1.5 text-sm h-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
              <div className="card p-8 text-center">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-surface-container rounded" />
                  ))}
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-on-surface-variant">No stock history found</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full">
                    <thead className="bg-surface-container/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Supplier</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-6">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {filteredLogs.map((log) => (
                        <tr
                          key={log._id}
                          onClick={() => { setSelectedLog(log); setShowDetailsModal(true); }}
                          className="hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 text-sm text-on-surface-variant">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.type === 'add'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {log.type === 'add' ? 'Added' : 'Deducted'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-on-surface capitalize">{log.material}</td>
                          <td className="px-4 py-3 text-sm text-on-surface-variant">{log.materialType || '-'}</td>
                          <td className={`px-4 py-3 text-sm font-medium text-right ${
                            log.type === 'add' ? 'text-green-600' : 'text-error'
                          }`}>
                            {log.type === 'add' ? '+' : '-'}{log.quantity} {log.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-on-surface-variant">{log.supplierName || '-'}</td>
                          <td className="px-4 py-3 text-sm text-on-surface-variant font-mono pr-6">{log.invoiceNumber || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); fetchStock(); }}
        userId={user?._id || ''}
        userName={user?.name || ''}
      />

      {/* Stock Entry Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)} />
          <div className="relative w-full max-w-md bg-factory-white rounded-2xl shadow-xl z-10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-on-surface">STOCK ENTRY DETAILS</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            {selectedLog.supplierName && (
              <>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Supplier Details</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Supplier Name</span>
                    <span className="text-sm font-medium text-on-surface">{selectedLog.supplierName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Invoice Number</span>
                    <span className="text-sm font-medium text-on-surface font-mono">{selectedLog.invoiceNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Invoice Date</span>
                    <span className="text-sm font-medium text-on-surface">{selectedLog.invoiceDate ? new Date(selectedLog.invoiceDate).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Contact</span>
                    <span className="text-sm font-medium text-on-surface">{selectedLog.supplierContact || '—'}</span>
                  </div>
                </div>
                <div className="border-t border-outline-variant/30 my-4" />
              </>
            )}

            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Stock Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Material</span>
                <span className="text-sm font-medium text-on-surface capitalize">
                  {selectedLog.material}
                  {selectedLog.materialType && ` — ${selectedLog.materialType}`}
                </span>
              </div>
              {selectedLog.material === 'footbed' && selectedLog.footbedGender && (
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">Size</span>
                  <span className="text-sm font-medium text-on-surface">{selectedLog.footbedGender} EU {selectedLog.footbedEuSize}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Quantity</span>
                <span className="text-sm font-medium text-on-surface">
                  {selectedLog.quantity} {selectedLog.unit}
                </span>
              </div>
              {selectedLog.purchasePrice !== undefined && selectedLog.purchasePrice !== null && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Price per Unit</span>
                    <span className="text-sm font-medium text-on-surface">₹{selectedLog.purchasePrice.toFixed(2)}</span>
                  </div>
                  {selectedLog.totalCost !== undefined && selectedLog.totalCost !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-on-surface-variant">Total Cost</span>
                      <span className="text-sm font-bold text-leather-tan">₹{selectedLog.totalCost.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Type</span>
                <span className={`text-sm font-medium ${selectedLog.type === 'add' ? 'text-green-600' : 'text-error'}`}>
                  {selectedLog.type === 'add' ? 'Added' : 'Deducted'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Reason</span>
                <span className="text-sm font-medium text-on-surface">{selectedLog.reason || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Added By</span>
                <span className="text-sm font-medium text-on-surface">{selectedLog.updatedByName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Date</span>
                <span className="text-sm font-medium text-on-surface">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
