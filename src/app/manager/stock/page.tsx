'use client';

import { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';
import StockCard from '@/components/ui/StockCard';
import StockTable from '@/components/ui/StockTable';
import AddStockModal from '@/components/modals/AddStockModal';
import { getStock, getStockLogs, Stock as StockType, StockLog } from '@/services/stock';
import { useAuthStore } from '@/store/authStore';

export default function ManagerStockPage() {
  const { user } = useAuthStore();
  const [stock, setStock] = useState<StockType | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [activeTab, setActiveTab] = useState<'management' | 'history'>('management');
  const [selectedMaterial, setSelectedMaterial] = useState<'leather' | 'buckle' | 'footbed'>('leather');
  const [historyMaterial, setHistoryMaterial] = useState<'all' | 'leather' | 'buckle' | 'footbed'>('all');

  const fetchStock = async () => {
    setIsLoading(true);
    const [stockData, logsData] = await Promise.all([
      getStock(),
      getStockLogs(50),
    ]);
    setStock(stockData);
    setStockLogs(logsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredLogs = stockLogs.filter((l) => {
    const matchesMaterial = historyMaterial === 'all' || l.material === historyMaterial;
    const matchesSupplier = !searchSupplier || (l.supplierName || '').toLowerCase().includes(searchSupplier.toLowerCase());
    return matchesMaterial && matchesSupplier;
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
                unit="sqm"
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
            <StockTable stock={stock} isLoading={isLoading} thresholds={stock?.thresholds} material={selectedMaterial} />
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
                        <tr key={log._id} className="hover:bg-surface-container-low transition-colors">
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
    </div>
  );
}
