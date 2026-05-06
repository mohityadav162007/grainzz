'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingBag, Zap } from 'lucide-react';
import { getSnackBoxItems } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface NutritionRow {
  nutrient: string;
  per_100g: string;
  rda_percent: string;
}

interface SnackBoxVariant {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  price: number;
  mrp: number;
  description: string;
  ingredients: string;
  nutrition_table: NutritionRow[];
}

interface SnackBoxData {
  section_title: string;
  variants: SnackBoxVariant[];
}

export default function EssentialSnackBox() {
  const [data, setData] = useState<SnackBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVariant, setActiveVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { addItem } = useCartStore();
  const { user, setAuthModalOpen, setGuestPopupMode } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    getSnackBoxItems()
      .then((raw) => {
        if (raw && raw.variants && raw.variants.length > 0) {
          setData(raw);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const variant = data?.variants?.[activeVariant];

  const handleSwitchVariant = useCallback((idx: number) => {
    setActiveVariant(idx);
    setQty(1);
    setOpenAccordion(null);
    setAdded(false);
    setImageLoaded(false);
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  const handleAddToCart = () => {
    if (!variant) return;
    addItem({
      id: `snackbox-${variant.id}`,
      name: variant.title,
      price: variant.price,
      mrp: variant.mrp,
      image: variant.image_url,
      quantity: qty,
      tags: ['Snack Box'],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuickBuy = () => {
    if (!variant) return;
    if (!user) {
      setGuestPopupMode('signin');
      setAuthModalOpen(true);
      return;
    }
    addItem({
      id: `snackbox-${variant.id}`,
      name: variant.title,
      price: variant.price,
      mrp: variant.mrp,
      image: variant.image_url,
      quantity: qty,
      tags: ['Snack Box'],
    });
    router.push('/checkout');
  };

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <section className="py-[40px] md:py-[60px] bg-[#FCF9F2] w-full border-y border-[#EEEEEE]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[60px]">
            <div className="aspect-square bg-[#EDE8DA] rounded-[20px] animate-pulse" />
            <div className="space-y-[20px] py-[20px]">
              <div className="h-[40px] bg-[#EDE8DA] rounded-lg w-3/4 animate-pulse" />
              <div className="h-[20px] bg-[#EDE8DA] rounded-lg w-1/2 animate-pulse" />
              <div className="h-[36px] bg-[#EDE8DA] rounded-lg w-1/3 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-[44px] bg-[#EDE8DA] rounded-full w-[160px] animate-pulse" />
                <div className="h-[44px] bg-[#EDE8DA] rounded-full w-[180px] animate-pulse" />
              </div>
              <div className="h-[1px] bg-[#EDE8DA]" />
              <div className="h-[48px] bg-[#EDE8DA] rounded-lg animate-pulse" />
              <div className="h-[48px] bg-[#EDE8DA] rounded-lg animate-pulse" />
              <div className="h-[48px] bg-[#EDE8DA] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data || !variant) return null;

  const discount = variant.mrp > variant.price
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
    : 0;

  const accordionItems = [
    { key: 'description', label: 'Description', content: variant.description },
    { key: 'nutrition', label: 'Nutrition breakdown', content: null, table: variant.nutrition_table },
    { key: 'ingredients', label: 'Ingredients', content: variant.ingredients },
  ].filter(item => item.content || (item.table && item.table.length > 0));

  return (
    <section className="py-[40px] md:py-[70px] bg-[#FCF9F2] w-full border-y border-[#EEEEEE]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px] lg:gap-[60px] xl:gap-[80px] items-start">

          {/* ═══ LEFT: Product Image ═══ */}
          <div className="w-full">
            <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-white border border-[#EAEAEA] shadow-sm">
              {variant.image_url ? (
                <Image
                  src={variant.image_url}
                  alt={variant.title}
                  fill
                  className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F5F0E8]">
                  <span className="text-[#CCC] text-sm">No Image</span>
                </div>
              )}
              {/* Placeholder while image loads */}
              {variant.image_url && !imageLoaded && (
                <div className="absolute inset-0 bg-[#F5F0E8] animate-pulse" />
              )}
              {/* Veg icon */}
              <div className="absolute top-[20px] right-[20px] w-[24px] h-[24px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10">
                <div className="w-[11px] h-[11px] bg-[#1E8A38] rounded-full" />
              </div>
              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-[20px] left-[20px] bg-brand-red text-white text-[12px] font-bold px-[14px] py-[5px] rounded-full shadow-sm z-10">
                  {discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Product Info ═══ */}
          <div className="flex flex-col items-start">

            {/* Title */}
            <h2 className="text-[28px] md:text-[36px] lg:text-[42px] font-extrabold text-[#1D5E2E] leading-[1.1] tracking-tight font-sans mb-[8px]">
              {data.section_title || 'The Essential Snack Box'}
            </h2>

            {/* Subtitle / Tagline */}
            {variant.subtitle && (
              <p className="text-[14px] md:text-[15px] text-[#666666] font-medium mb-[20px]">
                {variant.subtitle}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-[12px] mb-[24px]">
              <span className="text-[32px] md:text-[38px] font-bold text-brand-black leading-[1] font-sans">
                ₹{variant.price}
              </span>
              {variant.mrp > variant.price && (
                <span className="text-[16px] text-[#999999] font-medium line-through">
                  MRP ₹{variant.mrp}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            <div className="mb-[28px] w-full">
              <p className="text-[14px] font-bold text-brand-black mb-[12px]">Select your box</p>
              <div className="flex flex-wrap gap-[12px]">
                {data.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => handleSwitchVariant(idx)}
                    className={`px-[20px] py-[10px] rounded-full text-[14px] font-semibold transition-all duration-200 border-[1.5px] ${
                      idx === activeVariant
                        ? 'border-[#1D5E2E] bg-white text-[#1D5E2E] shadow-sm'
                        : 'border-[#DDDDDD] bg-transparent text-[#666666] hover:border-[#999999]'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Accordions ─── */}
            <div className="w-full border-t border-[#EAEAEA] mb-[28px]">
              {accordionItems.map((item) => (
                <div key={item.key} className="border-b border-[#EAEAEA]">
                  <button
                    onClick={() => toggleAccordion(item.key)}
                    className="w-full py-[16px] flex items-center justify-between text-[15px] font-semibold text-brand-black hover:text-[#1D5E2E] transition-colors"
                  >
                    <span>{item.label}</span>
                    <span className={`text-[20px] font-light transition-transform duration-200 ${openAccordion === item.key ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      openAccordion === item.key ? 'max-h-[600px] opacity-100 pb-[16px]' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {/* Text content */}
                    {item.content && (
                      <p className="text-[14px] text-[#4A4A4A] leading-[1.7] whitespace-pre-line">
                        {item.content}
                      </p>
                    )}

                    {/* Nutrition table */}
                    {item.table && item.table.length > 0 && (
                      <div className="w-full overflow-x-auto rounded-[12px] border border-[#EAEAEA]">
                        <table className="w-full border-collapse min-w-[320px]">
                          <thead className="bg-[#1D5E2E] text-white">
                            <tr>
                              <th className="py-2.5 px-3 text-left font-bold text-[12px] uppercase tracking-tight">Nutrients</th>
                              <th className="py-2.5 px-3 text-left font-bold text-[12px] uppercase tracking-tight">per 100g</th>
                              <th className="py-2.5 px-3 text-left font-bold text-[12px] uppercase tracking-tight">% RDA</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white text-brand-black text-[12px] font-medium">
                            {item.table.map((row: NutritionRow, i: number) => (
                              <tr key={i} className="border-b border-[#F0F0F0] last:border-0">
                                <td className="py-2.5 px-3 font-bold border-r border-[#F0F0F0]">{row.nutrient}</td>
                                <td className="py-2.5 px-3 border-r border-[#F0F0F0]">{row.per_100g}</td>
                                <td className="py-2.5 px-3">{row.rda_percent}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Purchase Controls ─── */}
            <div className="w-full flex flex-col gap-[14px]">
              <div className="flex items-center gap-[20px]">
                {/* Quantity */}
                <div className="flex items-center gap-[14px]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-[44px] h-[44px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <Minus size={18} strokeWidth={1.5} />
                  </button>
                  <span className="text-[18px] font-bold text-brand-black w-[20px] text-center select-none">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-[44px] h-[44px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <Plus size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-[54px] border-[1.5px] border-[#1D5E2E]/40 bg-[#FCF9F2] text-[#1D5E2E] rounded-full font-bold text-[15px] hover:bg-white hover:border-[#1D5E2E] transition-all flex items-center justify-center gap-[8px]"
                >
                  {added ? (
                    <span>Added ✓</span>
                  ) : (
                    <>
                      <ShoppingBag size={18} strokeWidth={2} />
                      <span>Add To Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Buy */}
              <button
                onClick={handleQuickBuy}
                className="w-full h-[54px] bg-[#1a1a1a] text-white rounded-full font-bold text-[16px] hover:bg-black transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-[8px]"
              >
                <Zap size={18} strokeWidth={2} />
                Quick Buy
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
