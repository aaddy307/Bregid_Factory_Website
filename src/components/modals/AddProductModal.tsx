'use client';

import { useState, useEffect } from 'react';
import { X, Shirt } from 'lucide-react';
import { createProduct, updateProduct, Product } from '@/services/products';
import { getStock } from '@/services/stock';

const MEN_SIZES = [40, 41, 42, 43, 44, 45];
const WOMEN_SIZES = [36, 37, 38, 39, 40, 41];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: Product | null;
}

export default function AddProductModal({ isOpen, onClose, editProduct }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [gender, setGender] = useState<'Men' | 'Women'>('Men');
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [leatherSqfPerPair, setLeatherSqfPerPair] = useState('');
  const [leatherType, setLeatherType] = useState('');
  const [bucklePerPair, setBucklePerPair] = useState('');
  const [buckleType, setBuckleType] = useState('');
  const [footbedPerPair, setFootbedPerPair] = useState('');
  const [footbedType, setFootbedType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stock, setStock] = useState<unknown>(null);

  useEffect(() => {
    if (isOpen) {
      const loadStock = async () => {
        const data = await getStock();
        setStock(data);
      };
      loadStock();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setSku(editProduct.sku);
      setGender(editProduct.gender);
      setSelectedSizes(editProduct.sizes || []);
      setLeatherSqfPerPair(editProduct.leatherSqfPerPair?.toString() || '');
      setLeatherType(editProduct.leatherType || '');
      setBucklePerPair(editProduct.bucklePerPair?.toString() || '');
      setBuckleType(editProduct.buckleType || '');
      setFootbedPerPair(editProduct.footbedPerPair?.toString() || '');
      setFootbedType(editProduct.footbedType || '');
    } else {
      setName('');
      setSku('');
      setGender('Men');
      setSelectedSizes([]);
      setLeatherSqfPerPair('');
      setLeatherType('');
      setBucklePerPair('');
      setBuckleType('');
      setFootbedPerPair('');
      setFootbedType('');
    }
  }, [editProduct, isOpen]);

  useEffect(() => {
    if (stock && !editProduct) {
      const stockData = stock as { leathers?: Array<{type: string}>; buckles?: Array<{type: string}>; footbeds?: Array<{type: string}> };
      if (!leatherType && stockData.leathers && stockData.leathers.length > 0) setLeatherType(stockData.leathers[0].type);
      if (!buckleType && stockData.buckles && stockData.buckles.length > 0) setBuckleType(stockData.buckles[0].type);
      const fbTypes = Array.from(new Set(stockData.footbeds?.map((f) => f.type) || []));
      if (!footbedType && fbTypes[0]) setFootbedType(fbTypes[0] as string);
    }
  }, [stock, editProduct, leatherType, buckleType, footbedType]);

  if (!isOpen) return null;

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !sku.trim()) {
      setError('Product name and SKU are required');
      return;
    }

    if (selectedSizes.length === 0) {
      setError('Select at least one size');
      return;
    }

    setIsSubmitting(true);

    const data = {
      name: name.trim(),
      sku: sku.trim(),
      gender,
      sizes: selectedSizes.sort((a, b) => a - b),
      leatherSqfPerPair: parseFloat(leatherSqfPerPair) || 0,
      leatherType: leatherType.trim(),
      bucklePerPair: parseInt(bucklePerPair) || 0,
      buckleType: buckleType.trim(),
      footbedPerPair: parseInt(footbedPerPair) || 0,
      footbedType: footbedType.trim(),
      isActive: true,
      footbedSpecs: [],
    };

    let success: boolean;
    if (editProduct) {
      success = await updateProduct(editProduct._id, data);
    } else {
      const result = await createProduct(data);
      success = !!result;
    }

    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError(editProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const sizeOptions = gender === 'Men' ? MEN_SIZES : WOMEN_SIZES;

  const stockData = stock as { leathers?: Array<{type: string}>; buckles?: Array<{type: string}>; footbeds?: Array<{type: string}> } | null;
  const leatherOptions: string[] = stockData?.leathers?.map((l) => l.type) || ['Nubuck'];
  const buckleOptions: string[] = stockData?.buckles?.map((b) => b.type) || ['Brass Buckle'];
  const footbedOptions: string[] = stockData?.footbeds ? Array.from(new Set(stockData.footbeds.map((f) => f.type))) as string[] : ['Standard Footbed'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-factory-white rounded-2xl shadow-xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 sticky top-0 bg-factory-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-leather-tan/10 flex items-center justify-center">
              <Shirt size={20} className="text-leather-tan" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-caps text-on-surface-variant block mb-2">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Classic Black Nubuk"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-caps text-on-surface-variant block mb-2">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. BRMCLNUBLK001"
                className="input-field font-mono"
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Men', 'Women'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { setGender(g); setSelectedSizes([]); }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    gender === g
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="label-caps text-on-surface-variant block mb-2">EU Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedSizes.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  EU {s}
                </button>
              ))}
            </div>
          </div>

          {/* Material Specs */}
          <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <h4 className="text-sm font-semibold text-on-surface">Material Specifications</h4>

            {/* Leather */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">LEATHER (SQM/PAIR)</label>
                <input
                  type="number"
                  value={leatherSqfPerPair}
                  onChange={(e) => setLeatherSqfPerPair(e.target.value)}
                  placeholder="0.45"
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">LEATHER TYPE</label>
                <select
                  value={leatherType}
                  onChange={(e) => setLeatherType(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">Select leather...</option>
                  {leatherOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buckle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">BUCKLES (PER PAIR)</label>
                <input
                  type="number"
                  value={bucklePerPair}
                  onChange={(e) => setBucklePerPair(e.target.value)}
                  placeholder="2"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">BUCKLE TYPE</label>
                <select
                  value={buckleType}
                  onChange={(e) => setBuckleType(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">Select buckle...</option>
                  {buckleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footbed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">FOOTBEDS (PER PAIR)</label>
                <input
                  type="number"
                  value={footbedPerPair}
                  onChange={(e) => setFootbedPerPair(e.target.value)}
                  placeholder="1"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-caps text-on-surface-variant block mb-2">FOOTBED TYPE</label>
                <select
                  value={footbedType}
                  onChange={(e) => setFootbedType(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">Select footbed...</option>
                  {footbedOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
