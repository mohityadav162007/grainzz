'use client';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

const variantOptions = {
  box: ['Box of 6 Grainzz', 'Box of 12 Grainzz'],
};

const accordionData = [
  {
    label: 'Description',
    content: 'The perfect variety snack box for the health-conscious snacker. Experience all our signature grain-based flavors in one convenient pack. High in fiber, roasted to perfection, and 100% guilt-free.',
  },
  {
    label: 'Nutrition breakdown',
    content: 'Calories: 120 per serving | Protein: 4g | Fibre: 6g | Fat: 3g | No Trans Fat | No Palm Oil',
  },
  {
    label: 'Ingredients',
    content: 'Assorted Grainzz Products: Oats, Ragi, Bajra, Quinoa, Rice Flour, Natural Seasonings, Salt.',
  },
];

export default function EssentialSnackBox() {
  const [qty, setQty] = useState(1);
  const [selectedBox, setSelectedBox] = useState(variantOptions.box[0]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Description']));
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleAddToCart = () => {
    addItem({
      _id: 'essential-snack-box',
      name: `The Essential Snack Box – ${selectedBox}`,
      price: 149,
      mrp: 199,
      image: '',
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative bg-white rounded-3xl p-8 flex items-center justify-center min-h-[400px] shadow-sm group">
            <div className="flex flex-col items-center">
              {/* Snack box visual */}
              <div className="relative w-52 h-52 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {['🫙', '🌾', '🍘', '🥜'].map((emoji, i) => (
                    <div key={i} className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product card below */}
              <div className="mt-4 text-center">
                <div className="w-24 h-32 mx-auto bg-gradient-to-b from-green-400 to-green-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-[7px] font-bold tracking-widest opacity-70">VITALICIOUS</span>
                  <span className="font-brand text-xs font-black">GRAIN<span className="text-yellow-300">ZZ</span></span>
                  <div className="w-8 h-8 bg-white/20 rounded-full mt-1" />
                  <span className="text-[6px] mt-1 opacity-70">OATS CHIPS</span>
                </div>
                <p className="text-sm font-bold text-text-main mt-2">Oats Chips – Peri Peri</p>
                <p className="text-xs text-text-muted">₹149 <span className="line-through">MRP ₹199</span></p>
              </div>
            </div>

            <Link
              href="/products/essential-snack-box-mixed"
              className="absolute bottom-4 left-4 text-xs text-text-muted border border-gray-200 rounded-full px-4 py-2 hover:border-primary hover:text-primary transition-colors"
            >
              Quick View
            </Link>
          </div>

          {/* Product Details */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text-main mb-1">The Essential Snack Box</h2>
            <p className="text-text-muted text-sm mb-3">High-Fibre | No Palm Oil | Baked Crunch</p>

            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-black text-primary">₹149</span>
              <span className="text-text-muted line-through text-sm">MRP ₹199</span>
            </div>

            {/* Variants */}
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Select your box</p>
              <div className="flex flex-wrap gap-2">
                {variantOptions.box.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedBox(opt)}
                    className={`text-xs px-4 py-2.5 rounded-lg border transition-all duration-200 ${
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

            {/* Accordion */}
            <div className="border-t border-gray-200 mb-6">
              {accordionData.map(({ label, content }) => (
                <div key={label} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection(label)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold hover:text-primary transition-colors"
                  >
                    {label}
                    <span>{openSections.has(label) ? <Minus size={14} /> : <Plus size={14} />}</span>
                  </button>
                  {openSections.has(label) && (
                    <p className="text-sm text-text-muted pb-4 leading-relaxed animate-fade-in">{content}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 hover:text-primary transition-colors">
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 text-sm font-semibold min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2.5 hover:text-primary transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-full border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  added ? 'bg-green-50 border-green-500 text-green-600' : 'border-text-main hover:bg-primary hover:text-white hover:border-primary'
                }`}
              >
                <ShoppingCart size={16} />
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
            <button onClick={handleAddToCart} className="w-full btn-primary justify-center rounded-xl py-4 text-base">
              Quick Buy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
