'use client';
import { useState, useMemo } from 'react';
import { X, Search, Check, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  images: string[];
  category: string;
  is_active: boolean;
}

interface ProductPickerModalProps {
  products: Product[];
  selectedIds: string[];
  maxSelection: number;
  title?: string;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

export default function ProductPickerModal({
  products,
  selectedIds,
  maxSelection,
  title = 'Select Products',
  onConfirm,
  onClose,
}: ProductPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelection) return prev;
      return [...prev, id];
    });
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selected.length} / {maxSelection} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Selected Preview */}
        {selected.length > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex-shrink-0">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">
              Selected Products
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const p = getProduct(id);
                if (!p) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-white border border-primary/20 rounded-lg px-2.5 py-1.5 group"
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                        <Package size={10} className="text-gray-400" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                      {p.name}
                    </span>
                    <button
                      onClick={() => toggleProduct(id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const isSelected = selected.includes(p.id);
                const isDisabled =
                  !isSelected && selected.length >= maxSelection;
                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && toggleProduct(p.id)}
                    disabled={isDisabled}
                    className={`relative text-left rounded-xl border-2 p-2.5 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : isDisabled
                        ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                        : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Check badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
                        <Check size={12} className="text-white" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square rounded-lg bg-gray-50 overflow-hidden mb-2">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary">
                        ₹{p.price}
                      </span>
                      {p.mrp > p.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{p.mrp}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5 block">
                      {p.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <p className="text-xs text-gray-500">
            {selected.length === maxSelection ? (
              <span className="text-primary font-medium">
                ✓ Maximum {maxSelection} products selected
              </span>
            ) : (
              <>
                Select {maxSelection - selected.length} more product
                {maxSelection - selected.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selected)}
              className="admin-btn text-sm"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
