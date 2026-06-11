'use client';

import { Stock } from '@/services/stock';
import { formatEURSize } from '@/utils/dateHelpers';

interface StockTableProps {
  stock: Stock | null;
  isLoading?: boolean;
  thresholds?: { leatherSqf: number; buckleQty: number; footbedQty: number };
  material: 'leather' | 'buckle' | 'footbed';
}

export default function StockTable({ stock, isLoading, thresholds, material }: StockTableProps) {
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
    const leathersList = stock.leathers || (stock.leatherSqf ? [{ type: stock.leatherType || 'Nubuck', qty: stock.leatherSqf }] : []);

    return (
      <div>
        <h3 className="font-semibold text-on-surface mb-3">Leather Stock Details</h3>
        {leathersList.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-on-surface-variant">No leather stock entries</p>
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
                  {leathersList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-3 text-sm text-on-surface">{item.type}</td>
                      <td className="px-6 py-3 text-sm font-medium text-right text-on-surface pr-8">
                        {item.qty.toLocaleString()} sqm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (material === 'buckle') {
    const bucklesList = stock.buckles || (stock.buckleQty ? [{ type: stock.buckleType || 'Brass Buckle', qty: stock.buckleQty }] : []);

    return (
      <div>
        <h3 className="font-semibold text-on-surface mb-3">Buckle Stock Details</h3>
        {bucklesList.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-on-surface-variant">No buckle stock entries</p>
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
                  {bucklesList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-3 text-sm text-on-surface">{item.type}</td>
                      <td className="px-6 py-3 text-sm font-medium text-right text-on-surface pr-8">
                        {item.qty.toLocaleString()} pcs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // default to 'footbed'
  return (
    <div>
      {/* Footbed Stock Table */}
      <h3 className="font-semibold text-on-surface mb-3">Footbed Stock Details</h3>
      {stock.footbeds.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-on-surface-variant">No footbed stock entries</p>
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
                {stock.footbeds.map((fb, idx) => {
                  const isLow = thresholds ? fb.qty <= thresholds.footbedQty : false;
                  return (
                    <tr key={idx} className={`hover:bg-surface-container-low transition-colors ${isLow ? 'bg-error/5' : ''}`}>
                      <td className="px-4 py-3 text-sm text-on-surface">{fb.gender}</td>
                      <td className="px-4 py-3 text-sm text-on-surface">{formatEURSize(fb.euSize)}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{fb.type}</td>
                      <td className={`px-4 py-3 text-sm font-medium text-right pr-6 ${isLow ? 'text-error' : 'text-on-surface'}`}>
                        {fb.qty} pcs
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
