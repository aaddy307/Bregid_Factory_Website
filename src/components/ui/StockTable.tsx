'use client';

import { Stock, MaterialCategory } from '@/services/stock';
import { formatEURSize } from '@/utils/dateHelpers';

interface StockTableProps {
  stock: Stock | null;
  isLoading?: boolean;
  thresholds?: { leatherSqf: number; buckleQty: number; footbedQty: number };
  material: 'leather' | 'buckle' | 'footbed';
  categories?: MaterialCategory[];
}

export default function StockTable({ stock, isLoading, thresholds, material, categories = [] }: StockTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-surface-container rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="card p-8 text-center">
        <p className="text-on-surface-variant">No stock data available</p>
      </div>
    );
  }

  if (material === 'leather') {
    const getLeatherQty = (type: string) => {
      const entry = stock.leathers?.find(l => l.type === type);
      return entry?.qty ?? 0;
    };

    return (
      <div>
        <h3 className="font-semibold text-on-surface mb-3">Leather Stock Details</h3>
        {categories.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-on-surface-variant">No leather categories defined</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-surface-container/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Leather Type</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-8">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {categories.map((cat, idx) => {
                    const qty = getLeatherQty(cat.name);
                    const isLow = thresholds ? qty <= thresholds.leatherSqf : false;
                    return (
                      <tr key={idx} className={`hover:bg-surface-container-low transition-colors ${isLow ? 'bg-error/5' : ''}`}>
                        <td className="px-6 py-3 text-sm text-on-surface">{cat.name}</td>
                        <td className={`px-6 py-3 text-sm font-medium text-right pr-8 ${isLow ? 'text-error' : 'text-on-surface'}`}>
                          {qty.toLocaleString()} sqf
                          {isLow && <span className="ml-1 text-xs">⚠</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (material === 'buckle') {
    const getBuckleQty = (cat: MaterialCategory) => {
      const prefix = cat.color ? `${cat.name} (${cat.color})` : cat.name;
      const matchingEntries = stock.buckles?.filter(
        b => b.type === prefix || b.type.startsWith(`${prefix} - `)
      ) || [];
      return matchingEntries.reduce((sum, b) => sum + (b.qty ?? 0), 0);
    };

    return (
      <div>
        <h3 className="font-semibold text-on-surface mb-3">Buckle Stock Details</h3>
        {categories.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-on-surface-variant">No buckle categories defined</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-surface-container/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Buckle Type</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-8">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {categories.map((cat, idx) => {
                    const qty = getBuckleQty(cat);
                    const isLow = thresholds ? qty <= thresholds.buckleQty : false;
                    return (
                      <tr key={idx} className={`hover:bg-surface-container-low transition-colors ${isLow ? 'bg-error/5' : ''}`}>
                        <td className="px-6 py-3 text-sm text-on-surface">
                          {cat.name}
                          {cat.color && <span className="text-on-surface-variant text-xs ml-1">({cat.color})</span>}
                        </td>
                        <td className={`px-6 py-3 text-sm font-medium text-right pr-8 ${isLow ? 'text-error' : 'text-on-surface'}`}>
                          {qty.toLocaleString()} pcs
                          {isLow && <span className="ml-1 text-xs">⚠</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // default to 'footbed'
  const getFootbedQty = (gender: string, size: number, type: string) => {
    const entry = stock.footbeds?.find(f => f.gender === gender && f.euSize === size && f.type === type);
    return entry?.qty ?? 0;
  };

  return (
    <div>
      {/* Footbed Stock Table */}
      <h3 className="font-semibold text-on-surface mb-3">Footbed Stock Details</h3>
      {categories.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-on-surface-variant">No footbed categories defined</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead className="bg-surface-container/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-6">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {categories.map((cat, idx) => {
                  const qty = getFootbedQty(cat.gender || 'Men', cat.size || 40, cat.name);
                  const isLow = thresholds ? qty <= thresholds.footbedQty : false;
                  return (
                    <tr key={idx} className={`hover:bg-surface-container-low transition-colors ${isLow ? 'bg-error/5' : ''}`}>
                      <td className="px-4 py-3 text-sm text-on-surface">{cat.gender}</td>
                      <td className="px-4 py-3 text-sm text-on-surface">{formatEURSize(cat.size || 40)}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{cat.name}</td>
                      <td className={`px-4 py-3 text-sm font-medium text-right pr-6 ${isLow ? 'text-error' : 'text-on-surface'}`}>
                        {qty} pcs
                        {isLow && <span className="ml-1 text-xs">⚠</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
