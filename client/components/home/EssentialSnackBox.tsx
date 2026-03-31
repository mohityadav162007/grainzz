'use client';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const variantOptions = {
  box: ['Box of 6 Grainzz', 'Box of 12 Grainzz'],
  flavour: ['Mixed', 'All Oats', 'All Ragi'],
};

export default function EssentialSnackBox() {
  const [qty, setQty] = useState(1);
  const [selectedBox, setSelectedBox] = useState(variantOptions.box[0]);
  const [selectedFlavour, setSelectedFlavour] = useState(variantOptions.flavour[0]);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      _id: 'essential-snack-box',
      name: `The Essential Snack Box – ${selectedBox} – ${selectedFlavour}`,
      price: 149,
      mrp: 199,
      image: '',
      quantity: qty,
    });
  };

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative bg-white rounded-3xl p-8 flex items-center justify-center min-h-[320px] shadow-sm">
            <div className="text-center">
              <div className="text-8xl mb-4">📦</div>
              <p className="text-primary font-bold">Essential Snack Box</p>
            </div>
            <button className="absolute bottom-4 left-4 text-xs text-text-muted border border-gray-200 rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors">
              Quick View
            </button>
          </div>

          {/* Product Details */}
          <div>
            <h2 className="text-2xl font-black text-text-main mb-1">The Essential Snack Box</h2>
            <p className="text-text-muted text-sm mb-3">High-Fibre | No Palm Oil | Baked Crunch</p>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-primary">₹149</span>
              <span className="text-text-muted line-through text-sm">MRP ₹199</span>
            </div>

            {/* Variants */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-semibold mb-2">Select your box</p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.box.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedBox(opt)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                        selectedBox === opt
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-gray-200 text-text-muted hover:border-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Select Flavour</p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.flavour.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedFlavour(opt)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                        selectedFlavour === opt
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-gray-200 text-text-muted hover:border-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold mb-2">Description</p>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              The perfect variety snack box for the health-conscious snacker. Experience all our signature grain-based flavors in one convenient pack. High in fiber, roasted to perfection, and 100% guilt-free.
            </p>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:text-primary transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:text-primary transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 btn-secondary justify-center py-3">
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
            <button onClick={handleAddToCart} className="w-full btn-primary justify-center mt-3 rounded-xl">
              Quick Buy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
