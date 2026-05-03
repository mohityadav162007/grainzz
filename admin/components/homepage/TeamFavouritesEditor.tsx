'use client';
import { useState } from 'react';
import { Save, Loader2, Package, Trash2, Plus, Heart } from 'lucide-react';
import ProductPickerModal from '@/components/ProductPickerModal';

export default function TeamFavouritesEditor({ config, products, onSave, saving }: any) {
  const [c, setC] = useState(config);
  const [pickerOpen, setPickerOpen] = useState(false);

  const getProduct = (id: string) => products.find((p: any) => p.id === id);
  const selectedProducts = (c.product_ids || []).map((id: string) => getProduct(id)).filter(Boolean);

  const removeProduct = (productId: string) => {
    setC({ ...c, product_ids: (c.product_ids || []).filter((id: string) => id !== productId) });
  };

  const handlePickerConfirm = (selectedIds: string[]) => {
    setC({ ...c, product_ids: selectedIds });
    setPickerOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Heart size={18} className="text-red-400" /> Team Favourites
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Select 4 products to display in the Team Favourites section on the About Us page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPickerOpen(true)} className="admin-btn-outline text-sm">
            <Plus size={14} /> Select Products
          </button>
          <button onClick={() => onSave(c)} disabled={saving} className="admin-btn text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-5 px-4 py-2.5 bg-gray-50 rounded-xl flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${selectedProducts.length === 4 ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-gray-600 font-medium">
          {selectedProducts.length}/4 products selected
          {selectedProducts.length < 4 && <span className="text-gray-400 ml-1">— select {4 - selectedProducts.length} more</span>}
        </span>
      </div>

      {selectedProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Heart size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No favourites selected yet</p>
          <p className="text-xs mt-1">Click &quot;Select Products&quot; to pick 4 team favourites</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedProducts.map((p: any, i: number) => (
            <div key={p.id} className="relative group border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {/* Remove button */}
              <button
                onClick={() => removeProduct(p.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              >
                <Trash2 size={12} className="text-white" />
              </button>

              {/* Slot number */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10 shadow-sm">
                <span className="text-white text-[10px] font-bold">{i + 1}</span>
              </div>

              {/* Product Image */}
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">{p.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">₹{p.price}</span>
                  {p.mrp > p.price && (
                    <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">{p.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Picker Modal */}
      {pickerOpen && (
        <ProductPickerModal
          products={products}
          selectedIds={c.product_ids || []}
          maxSelection={4}
          title="Select Team Favourites (About Us Page)"
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
