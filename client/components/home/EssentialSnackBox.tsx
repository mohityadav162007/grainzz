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
      tags: [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const heading = featuredConfig?.heading || 'The Supergrain Starter Box';
  const supportingLine = featuredConfig?.supporting_line || product?.nutrition_info || 'High Fibre | No Palm Oil | Gluten-Free | Zero Cholesterol';
  const freeGiftMessage = featuredConfig?.free_gift_message || '';
  const description = featuredConfig?.description || product?.description || '';
  const ctaText = featuredConfig?.cta_text || 'Add to Cart';
  const price = product?.price || 549;
  const mrp = product?.mrp || 699;

  const accordionData = [
    { label: 'Description', content: description },
    { label: 'Nutrition breakdown', content: product?.nutrition_info || 'High in Fibre | No Palm Oil | Gluten-Free | Zero Cholesterol' },
    { label: 'Ingredients', content: product?.ingredients || 'Assorted Grainzz Products: Ragi, Bajra, Oats, Quinoa, Natural Seasonings, Salt.' },
  ];

  return (
    <section className="py-[40px] md:py-[80px] bg-white border-y border-[#E4E4E4]/50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <div className="grid md:grid-cols-2 gap-[40px] md:gap-[60px] lg:gap-[100px] items-start">
          
          {/* Image */}
          <div className="relative w-full aspect-square md:aspect-auto md:h-[700px] bg-[#EEFBDC]/50 rounded-[24px] md:rounded-[32px] overflow-hidden flex items-center justify-center p-4 md:p-8 group border border-brand-green/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyOSwgOTQsIDMyLCAwLjI1KSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
            <div className="relative z-10 w-full h-full bg-white rounded-[16px] md:rounded-[24px] shadow-sm flex items-center justify-center overflow-hidden">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={heading}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center justify-center scale-100 md:scale-125">
                  <span className="text-[16px] md:text-[20px] font-black text-brand-green tracking-widest font-sans">GRAINZZ</span>
                  <span className="text-[10px] md:text-[12px] font-bold text-[#6B6B6B] mt-2">ESSENTIAL BOX</span>
                </div>
              )}
            </div>

            {product && (
              <div className="absolute top-[16px] md:top-[32px] left-[16px] md:left-[32px] bg-brand-green text-white text-[12px] md:text-[14px] font-bold px-[12px] md:px-[16px] py-[6px] md:py-[8px] rounded-full shadow-lg z-20">
                 Featured Bundle
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col pt-2 md:pt-4">
            <h2 className="text-[32px] md:text-[48px] font-black text-brand-black mb-[8px] leading-[1.1] tracking-tight">{heading}</h2>
            <p className="text-[16px] md:text-[18px] text-[#6B6B6B] mb-[24px] md:mb-[32px] font-medium">{supportingLine}</p>

            <div className="flex items-baseline gap-[12px] md:gap-[16px] mb-[24px] md:mb-[32px]">
              <span className="text-[36px] md:text-[48px] font-black text-brand-black leading-none">₹{price}</span>
              <span className="text-[16px] md:text-[20px] text-[#8E8E8E] font-medium line-through">MRP ₹{mrp}</span>
            </div>

            {/* Free Gift Message */}
            {freeGiftMessage && (
              <div className="bg-brand-yellow/30 border border-brand-yellow rounded-[12px] md:rounded-[16px] px-[16px] md:px-[24px] py-[12px] md:py-[16px] mb-[32px] md:mb-[40px] flex items-center gap-[12px]">
                <span className="text-[20px] md:text-[24px]">🎁</span>
                <span className="text-[14px] md:text-[16px] font-bold text-brand-black">{freeGiftMessage}</span>
              </div>
            )}

            {/* Accordion */}
            <div className="border-t border-[#E4E4E4] mb-[32px] md:mb-[40px]">
              {accordionData.map(({ label, content }) => (
                <div key={label} className="border-b border-[#E4E4E4]">
                  <button
                    onClick={() => toggleSection(label)}
                    className="w-full flex items-center justify-between py-[16px] md:py-[24px] text-[16px] md:text-[18px] font-bold text-brand-black hover:text-brand-green transition-colors"
                  >
                    {label}
                    <span className="text-brand-green bg-brand-light p-2 rounded-full">
                       {openSections.has(label) ? <Minus size={16} className="md:w-[18px] md:h-[18px]" /> : <Plus size={16} className="md:w-[18px] md:h-[18px]" />}
                    </span>
                  </button>
                  {openSections.has(label) && (
                    <p className="text-[14px] md:text-[16px] text-[#6B6B6B] leading-[1.6] pb-[16px] md:pb-[24px] animate-fade-in pr-4 md:pr-8">{content}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions Context Box */}
            <div className="bg-[#F7F7F7] rounded-[16px] md:rounded-[24px] p-[16px] md:p-[32px] flex flex-col sm:flex-row items-center gap-[16px] md:gap-[24px] border border-[#E4E4E4]">
              {/* Qty Selector */}
              <div className="flex items-center bg-white border border-[#E4E4E4] rounded-full h-[56px] md:h-[64px] shadow-sm w-full sm:w-auto">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[56px] md:w-[64px] h-full flex items-center justify-center hover:text-brand-green text-[#6B6B6B] transition-colors rounded-l-full">
                  <Minus size={20} strokeWidth={2.5} />
                </button>
                <span className="w-[48px] text-center text-[18px] md:text-[20px] font-bold text-brand-black">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-[56px] md:w-[64px] h-full flex items-center justify-center hover:text-brand-green text-[#6B6B6B] transition-colors rounded-r-full">
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 w-full h-[56px] md:h-[64px] rounded-full font-bold text-[16px] md:text-[18px] transition-all duration-300 flex items-center justify-center gap-[8px] md:gap-[12px] shadow-md
                  ${added 
                    ? 'bg-white border-2 border-brand-green text-brand-green'
                    : 'bg-brand-black text-white hover:bg-brand-green'
                  }`}
              >
                <ShoppingCart size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                {added ? 'Added to Cart ✓' : ctaText}
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
