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

interface EssentialSnackBoxProps {
  initialData?: SnackBoxData | null;
}

export default function EssentialSnackBox({ initialData }: EssentialSnackBoxProps) {
  const [data, setData] = useState<SnackBoxData | null>(initialData !== undefined ? initialData : null);
  const [loading, setLoading] = useState(initialData === undefined);
  const [activeVariant, setActiveVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { addItem, setQuickBuy } = useCartStore();
  const { user, setAuthModalOpen, setGuestPopupMode } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialData !== undefined) return; // use server-provided data
    getSnackBoxItems()
      .then((raw) => {
        if (raw && raw.variants && raw.variants.length > 0) {
          setData(raw);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialData]);

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
    setQuickBuy({
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
        <div className="flex flex-col lg:flex-row items-stretch gap-[32px] lg:gap-[60px] xl:gap-[80px]">

          {/* ═══ LEFT: Product Image ═══ */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-full min-h-[360px] md:min-h-[500px] rounded-[20px] overflow-hidden bg-white border border-[#EAEAEA] shadow-sm">
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
          <div className="w-full lg:w-[48%] flex flex-col items-start pt-[10px] lg:max-w-[560px]">

            {/* Title */}
            <h2 className="text-[32px] md:text-[42px] font-bold text-[#1A5B23] leading-[1.1] mb-[8px] font-sans tracking-tight">
              {data.section_title || 'The Essential Snack Box'}
            </h2>

            {/* Subtitle / Tagline */}
            {variant.subtitle && (
              <p className="text-[14px] md:text-[16px] text-[#666666] font-medium mb-[16px] tracking-tight">
                {variant.subtitle}
              </p>
            )}

            {/* Price Row */}
            <div className="flex items-baseline gap-[12px] mb-[20px]">
              <span className="text-[32px] md:text-[40px] font-semibold text-[#1A1A1A] leading-[1]">
                ₹{variant.price}
              </span>
              {variant.mrp > variant.price && (
                <span className="text-[16px] md:text-[20px] text-[#999999] font-medium line-through">
                  MRP ₹{variant.mrp}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            <div className="mb-[20px] w-full">
              <p className="text-[16px] font-semibold text-[#1A1A1A] mb-[10px]">Select your box</p>
              <div className="flex flex-wrap gap-[10px]">
                {data.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => handleSwitchVariant(idx)}
                    className={`px-[20px] py-[10px] rounded-full text-[14px] font-semibold transition-all duration-300 border-[1.5px] ${
                      idx === activeVariant
                        ? 'border-[#1A5B23] bg-[#1A5B23] text-white shadow-sm'
                        : 'border-[#DDDDDD] bg-transparent text-[#1A1A1A] hover:bg-[#EEFBDC] hover:text-[#1A5B23] hover:border-[#EEFBDC]'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="w-full mb-[24px]">
              <p className="text-[16px] font-semibold text-[#1A1A1A] mb-[8px]">Description</p>
              <p className="text-[14px] text-[#4A4A4A] leading-[1.6] whitespace-pre-line font-medium opacity-80">
                {variant.description}
              </p>
            </div>

            {/* ─── Purchase Controls ─── */}
            <div className="w-full flex flex-col gap-[16px]">
              <div className="flex items-center gap-[24px]">
                {/* Quantity */}
                <div className="flex items-center gap-[20px]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="w-[48px] h-[48px] rounded-full border border-[#666] flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={20} strokeWidth={1} />
                  </button>
                  <span className="text-[24px] font-bold text-[#1A1A1A] w-[24px] text-center select-none font-sans">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-[48px] h-[48px] rounded-full border border-[#666] flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-colors"
                  >
                    <Plus size={20} strokeWidth={1} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-[58px] border-[1.5px] border-[#1A5B23] bg-transparent text-[#1A5B23] rounded-full font-bold text-[16px] transition-all flex items-center justify-center hover:bg-[#1A5B23] hover:text-white"
                >
                  {added ? 'Added ✓' : 'Add To Cart'}
                </button>
              </div>

              {/* Quick Buy */}
              <button
                onClick={handleQuickBuy}
                className="w-full h-[58px] bg-[#1A1A1A] text-white rounded-full font-bold text-[18px] hover:bg-black transition-all active:scale-[0.98] shadow-lg"
              >
                Quick Buy
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
