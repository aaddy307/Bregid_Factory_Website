'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Shirt, Edit3, Trash2 } from 'lucide-react';
import { getProducts, deleteProduct, Product } from '@/services/products';
import { formatEURSize } from '@/utils/dateHelpers';
import AddProductModal from '@/components/modals/AddProductModal';

export default function ManagerCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Men' | 'Women'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProducts();
    setProducts(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchesSearch && matchesGender && p.isActive;
  });

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This will deactivate the product.`)) return;
    const success = await deleteProduct(product._id);
    if (success) {
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Product Catalog</h1>
          <p className="text-sm text-on-surface-variant">Manage product catalog and material specifications</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowAddModal(true); }} className="btn-primary text-sm">
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg">
          {(['all', 'Men', 'Women'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                genderFilter === g
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-surface-container rounded w-1/3 mb-2" />
              <div className="h-4 bg-surface-container rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card p-8 text-center">
          <Shirt size={32} className="mx-auto text-on-surface-variant/40 mb-2" />
          <p className="text-on-surface-variant">
            {searchQuery || genderFilter !== 'all' ? 'No products match your search' : 'No products yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card-hover p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-on-surface truncate">{product.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                      product.gender === 'Men' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {product.gender === 'Men' ? 'MEN' : 'WOMEN'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono mb-2">{product.sku}</p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {(product.sizes || []).map((size) => (
                      <span key={size} className="inline-block px-2 py-0.5 bg-surface-variant rounded text-xs text-on-surface">
                        {formatEURSize(size)}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                    {product.leatherSqfPerPair > 0 && (
                      <span>Leather: {product.leatherSqfPerPair} sqf/pair</span>
                    )}
                    {product.bucklePerPair > 0 && (
                      <span>Buckles: {product.bucklePerPair}/pair</span>
                    )}
                    {product.footbedPerPair > 0 && (
                      <span>Footbed: {product.footbedPerPair}/pair</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => { setEditProduct(product); setShowAddModal(true); }}
                    className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                    title="Edit product"
                  >
                    <Edit3 size={16} className="text-on-surface-variant" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg hover:bg-error/5 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 size={16} className="text-error" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditProduct(null); fetchProducts(); }}
        editProduct={editProduct}
      />
    </div>
  );
}
