'use client';
import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { getSiteContent, getProductBySlug } from '@/lib/api';

export default function EssentialSnackBox() {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [featuredConfig, setFeaturedConfig] = useState<any>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Description']));
  const { addItem } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await getSiteContent('featured_product');
        if (config) {
          setFeaturedConfig(config);
          const slug = config.slug || 'essential-snack-box-mixed';
          try {
            const res = await getProductBySlug(slug);
            if (res.data) setProduct(res.data);
          } catch {}
        }
      } catch {}
    };
    loadData();
  }, []);

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const heading = featuredConfig?.heading || 'The Supergrain Starter Box';
  const supportingLine = featuredConfig?.supporting_line || product?.nutrition_info || 'High Fibre | No Palm Oil | Gluten-Free | Zero Cholesterol';
  const freeGiftMessage = featuredConfig?.free_gift_message || '';
  const description = featuredConfig?.description || product?.description || '';
  const ctaText = featuredConfig?.cta_text || 'Build Your Starter Box';
  const price = product?.price || 549;
  const mrp = product?.mrp || 699;

  const accordionData = [
    { label: 'Description', content: description },
    { label: 'Nutrition breakdown', content: product?.nutrition_info || 'High in Fibre | No Palm Oil | Gluten-Free | Zero Cholesterol' },
    { label: 'Ingredients', content: product?.ingredients || 'Assorted Grainzz Products: Ragi, Bajra, Oats, Quinoa, Natural Seasonings, Salt.' },
  ];

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative bg-white rounded-3xl p-8 flex items-center justify-center min-h-[400px] shadow-sm group">
            <div className="flex flex-col items-center">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={heading}
                  className="max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <>
                  <div className="relative w-52 h-52 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {['🫙', '🌾', '🍘', '🥜'].map((emoji, i) => (
                        <div key={i} className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="w-24 h-32 mx-auto bg-gradient-to-b from-green-400 to-green-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                      <span className="text-[7px] font-bold tracking-widest opacity-70">VITALICIOUS</span>
                      <span className="font-brand text-xs font-black">GRAIN<span className="text-yellow-300">ZZ</span></span>
                      <div className="w-8 h-8 bg-white/20 rounded-full mt-1" />
                      <span className="text-[6px] mt-1 opacity-70">STARTER BOX</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {product && (
              <Link
                href={`/products/${product.slug}`}
                className="absolute bottom-4 left-4 text-xs text-text-muted border border-gray-200 rounded-full px-4 py-2 hover:border-primary hover:text-primary transition-colors"
              >
                Quick View
              </Link>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text-main mb-1">{heading}</h2>
            <p className="text-text-muted text-sm mb-3">{supportingLine}</p>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-primary">₹{price}</span>
              <span className="text-text-muted line-through text-sm">MRP ₹{mrp}</span>
            </div>

            {/* Free Gift Message */}
            {freeGiftMessage && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800 font-medium">
                {freeGiftMessage}
              </div>
            )}

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
              {ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
