'use client';

import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { addStock } from '@/services/stock';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

type Material = 'leather' | 'buckle' | 'footbed';

const MEN_SIZES = [40, 41, 42, 43, 44];
const WOMEN_SIZES = [36, 37, 38, 39, 40, 41];

export default function AddStockModal({ isOpen, onClose, userId, userName }: AddStockModalProps) {
  const [material, setMaterial] = useState<Material>('leather');
  const [materialType, setMaterialType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [footbedGender, setFootbedGender] = useState<'Men' | 'Women'>('Men');
  const [footbedEuSize, setFootbedEuSize] = useState<number>(40);
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!supplierName.trim() || !invoiceNumber.trim() || !invoiceDate) {
      setError('Supplier name, invoice number, and invoice date are required');
      return;
    }

    setIsSubmitting(true);

    const success = await addStock(
      qty,
      userId,
      userName,
      {
        material,
        materialType: materialType || undefined,
        footbedGender: material === 'footbed' ? footbedGender : undefined,
        footbedEuSize: material === 'footbed' ? footbedEuSize : undefined,
      },
      {
        supplierName: supplierName.trim(),
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate,
        supplierContact: supplierContact.trim() || undefined,
      }
    );

    setIsSubmitting(false);

    if (success) {
      onClose();
      setQuantity('');
      setMaterialType('');
      setSupplierName('');
      setInvoiceNumber('');
      setInvoiceDate('');
      setSupplierContact('');
    } else {
      setError('Failed to add stock. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-factory-white rounded-2xl shadow-xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-leather-tan/10 flex items-center justify-center">
              <Package size={20} className="text-leather-tan" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface">Add Stock Entry</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Material Selector */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Material</label>
            <div className="grid grid-cols-3 gap-2">
              {(['leather', 'buckle', 'footbed'] as Material[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    material === m
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Material Type */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">
              {material === 'leather' ? 'Leather Type' : material === 'buckle' ? 'Buckle Type' : 'Footbed Type'}
            </label>
            <input
              type="text"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              placeholder={material === 'leather' ? 'e.g. Nubuck' : material === 'buckle' ? 'e.g. Brass Buckle' : 'e.g. Cork Footbed'}
              className="input-field"
            />
          </div>

          {/* Footbed Gender + Size */}
          {material === 'footbed' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Men', 'Women'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFootbedGender(g)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        footbedGender === g
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">EU Size</label>
                <div className="grid grid-cols-3 gap-1">
                  {(footbedGender === 'Men' ? MEN_SIZES : WOMEN_SIZES).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFootbedEuSize(s)}
                      className={`px-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        footbedEuSize === s
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      EU {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">
              Quantity ({material === 'leather' ? 'sqm' : 'pieces'})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              step={material === 'leather' ? '0.1' : '1'}
              min="0"
              className="input-field"
              required
            />
          </div>

          {/* Supplier Details */}
          <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <h4 className="text-sm font-semibold text-on-surface">Supplier Details</h4>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Supplier name *"
              className="input-field"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice number *"
                className="input-field"
                required
              />
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <input
              type="text"
              value={supplierContact}
              onChange={(e) => setSupplierContact(e.target.value)}
              placeholder="Supplier contact (optional)"
              className="input-field"
            />
          </div>

          {/* Note */}
          <div className="text-xs text-on-surface-variant bg-surface-variant/50 px-3 py-2 rounded-lg">
            Stock entries are recorded in stock history with full supplier information.
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
