'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/AppImage';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Plus, Minus, Star, Check, X, Loader2 } from 'lucide-react';
import { submitProductReview, uploadReviewImage, getRelatedProductsSection, submitStockNotification, getProductReviews, getSeedReviewsByProductId } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import ProductTestimonialsSection from '@/components/about/CustomerTestimonials';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface ProductDetailPageClientProps {
  initialProduct: any;
  initialReviews: any[];
  initialSeedReviews: any[];
  relatedBlogs: any[];
}

export default function ProductDetailPageClient({
  initialProduct,
  initialReviews,
  initialSeedReviews,
  relatedBlogs,
}: ProductDetailPageClientProps) {
  const [product, setProduct] = useState<any>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>('Description');
  const [openComboSub, setOpenComboSub] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [mobileRelatedIndex, setMobileRelatedIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [seedReviews, setSeedReviews] = useState<any[]>(initialSeedReviews);
  const { addItem, setQuickBuy } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

  // Notification State
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', text: '' });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review Filter State
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!product?.id) return;

    // Set up realtime subscription for reviews
    const channelName = `public:reviews:${product.id}:${Date.now()}`;
    const channel: any = supabase.channel(channelName);
    const subscription = channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `product_id=eq.${product.id}` }, () => {
        getProductReviews(product.id).then(revs => setReviews(revs)).catch(() => { });
      })
      .subscribe();

    // Fetch related products separately for skeleton support
    getRelatedProductsSection().then(relatedRes => {
      setRelatedProducts(relatedRes);
    }).catch(err => {
      console.error('getRelatedProductsSection failed:', err);
    }).finally(() => setRelatedLoading(false));

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [product?.id]);

  // Handle #write-review hash navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      if (window.location.hash === '#write-review') {
        setTimeout(() => {
          const el = document.getElementById('write-review');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstInput = el.querySelector('input[type="text"], textarea');
            if (firstInput) (firstInput as HTMLElement).focus();
          }
        }, 500);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const toggleSection = (label: string) => {
    setOpenSection(prev => prev === label ? null : label);
    if (label !== 'Nutrition breakdown') setOpenComboSub(null);
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
      tags: product.tags,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuickBuy = () => {
    if (!product) return;
    setQuickBuy({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: qty,
      tags: product.tags,
    });
    router.push('/checkout');
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationEmail || !product) return;
    setNotificationSubmitting(true);
    try {
      await submitStockNotification(product.id, notificationEmail);
      setNotificationSuccess(true);
      setNotificationEmail('');
    } catch (err) {
      alert('Failed to subscribe. Please try again.');
    } finally {
      setNotificationSubmitting(false);
    }
  };

  const handleRelatedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85;
    const newIndex = Math.round(scrollPosition / cardWidth);
    if (newIndex !== mobileRelatedIndex) {
      setMobileRelatedIndex(Math.min(newIndex, relatedProducts.length - 1));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return alert('Please select a rating');
    if (!reviewForm.title || !reviewForm.text) return alert('Please fill in all required fields');

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setSubmittingReview(true);
    try {
      let imageUrl = '';
      if (reviewImage) {
        imageUrl = await uploadReviewImage(reviewImage);
      }

      const reviewerEmail = user.email || '';
      const reviewerName = user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Anonymous';

      await submitProductReview({
        product_id: product.id,
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail,
        review_title: reviewForm.title,
        review_text: reviewForm.text,
        rating: reviewForm.rating,
        review_image_url: imageUrl || undefined
      });

      setReviewSuccess(true);
      setReviewForm({ rating: 0, title: '', text: '' });
      setReviewImage(null);
      setReviewImagePreview('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('Please upload an image file');
      if (file.size > 5 * 1024 * 1024) return alert('Image size must be less than 5MB');
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  };

  const mergedReviews = [
    ...seedReviews.map(r => ({ ...r, is_seed: true })),
    ...reviews.map(r => ({ ...r, is_seed: false }))
  ];

  const filteredReviews = reviewFilter ? mergedReviews.filter(r => r.rating === reviewFilter) : mergedReviews;

  // Review Stats Calculation (Weighted)
  const realReviewCount = reviews.length;
  const seedReviewCount = product?.seed_review_count || 0;
  const totalReviewCount = realReviewCount + seedReviewCount;

  const sumRealRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
  const sumSeedRatings = Number(product?.seed_rating || 5) * seedReviewCount;

  const avgRating = totalReviewCount > 0
    ? ((sumRealRatings + sumSeedRatings) / totalReviewCount).toFixed(1)
    : (product?.seed_rating || '5.0');

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  mergedReviews.forEach(r => { if (ratingCounts[r.rating as keyof typeof ratingCounts] !== undefined) ratingCounts[r.rating as keyof typeof ratingCounts]++; });

  const totalReviewsForBar = mergedReviews.length;

  const discount = product?.mrp > product?.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const isComboProduct = ['2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack'].includes(product?.category);
  const hasComboNutrition = isComboProduct && product?.combo_nutrition?.length > 0;
  const hasNormalNutrition = product?.nutrition_table?.length > 0;

  const accordionItems = product ? [
    { label: 'Description', content: product.description },
    ...(hasComboNutrition
      ? [{ label: 'Nutrition breakdown', isComboNutrition: true, content: product.combo_nutrition }]
      : hasNormalNutrition
        ? [{ label: 'Nutrition breakdown', isTable: true, content: product.nutrition_table }]
        : []),
    ...(product.ingredients ? [{ label: 'Ingredients', content: product.ingredients }] : []),
  ] : [];

  if (!product) return <div className="py-[100px] text-center text-[#707070] font-sans">Product not found.</div>;

  return (
    <div className="bg-[#FCF9F2] min-h-[100dvh] pb-[60px] md:pb-[100px] font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Desktop Breadcrumb */}
        <nav className="hidden lg:flex items-center gap-[6px] text-[13px] font-medium text-black mb-[32px] tracking-tight">
          <Link href="/products" className="hover:text-brand-green transition-colors opacity-80">Shop All</Link>
          <ChevronRight size={13} strokeWidth={1.5} className="opacity-60" />
          <span className="opacity-100">{product?.name}</span>
        </nav>

        {/* ============================== */}
        {/* PRODUCT DETAILS SECTION        */}
        {/* ============================== */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-[32px] lg:gap-[60px] xl:gap-[80px] mb-[80px]">

          {/* Mobile Header (Shows above image on small screens) */}
          <div className="flex lg:hidden flex-col items-start w-full order-1">
            <nav className="flex items-center gap-[8px] text-[13px] font-medium text-[#8E8E8E] mb-3 tracking-wide">
              <Link href="/" className="hover:text-brand-green">Home</Link>
              <ChevronRight size={14} />
              <Link href="/products" className="hover:text-brand-green">Shop All</Link>
            </nav>
            {product?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-[8px] mb-[12px]">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="bg-[#FDF7E7] text-[#D89F43] text-[11px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider shadow-sm">{tag}</span>
                ))}
              </div>
            )}

            {/* Visual title for mobile - converted to h2 to avoid duplicate h1 */}
            <h2 className="text-[28px] font-bold text-brand-black mb-[4px] leading-[1.2]">
              {product?.name}
            </h2>

            <p className="text-[#657B67] text-[14px] font-medium mb-[16px]">{product?.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
          </div>

          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-[46%] xl:w-[46%] flex-shrink-0 order-2 lg:order-1 flex flex-col gap-[16px]">
            {/* Main Image */}
            <div
              className="relative w-full rounded-[24px] overflow-hidden bg-[#F5F0E8] shadow-sm border border-[#EAEAEA] transform-gpu"
              style={{ aspectRatio: '1 / 1' }}
            >
              {product?.images?.length > 0 ? (
                <Image src={product.images[selectedImage % product.images.length]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" priority />
              ) : (
                <Image src="/Rectangle-10@2x.png" alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              )}
              {discount > 0 && (
                <div className="absolute top-[20px] left-[20px] bg-[#9A0000] text-white text-[13px] font-medium px-[14px] py-[6px] rounded-full tracking-wide shadow-sm z-10">
                  -{discount}%
                </div>
              )}
              {/* Veg Icon */}
              <div className="absolute top-[20px] right-[20px] w-[22px] h-[22px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10">
                <div className="w-[10px] h-[10px] bg-[#1E8A38] rounded-full" />
              </div>
              {/* Out of Stock Overlay */}
              {product?.stock === 0 && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <div className="w-[130px] h-[130px] rounded-full bg-white/95 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                    <span className="text-[15px] font-medium text-[#4A4A4A] tracking-wide text-center">Out of Stock</span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Thumbnails (Hidden on mobile) */}
            <div className="hidden lg:flex gap-[12px] overflow-x-auto pb-2 scrollbar-none">
              {product?.images?.slice(0, 10).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-[12px] overflow-hidden flex-shrink-0 transition-all 
                    ${selectedImage === i ? 'border-[2px] border-brand-green shadow-md' : 'border border-[#EAEAEA] opacity-70 hover:opacity-100'}`}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Mobile Image Gallery Controls (Dots & Arrows) */}
            {product?.images?.length > 1 && (
              <div className="flex lg:hidden items-center justify-center gap-6 mt-[8px]">
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                  className="p-2 text-[#888888] hover:text-[#222222] transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-[8px]">
                  {product.images.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-[8px] rounded-full transition-all duration-300 ${idx === selectedImage ? 'w-[24px] bg-[#1E5E28]' : 'w-[8px] bg-[#E0E0E0] hover:bg-[#C0C0C0]'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setSelectedImage(prev => (prev + 1) % product.images.length)}
                  className="p-2 text-[#888888] hover:text-[#222222] transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col items-start order-3 lg:order-2 w-full">
            {/* Desktop Tags & Title */}
            <div className="hidden lg:flex flex-col items-start w-full order-0">
              {product?.tags?.length > 0 && (
                <div className="flex gap-[8px] mb-[12px]">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="bg-[#FDF0CC] text-[#4A4A4A] text-[13px] font-medium px-[14px] py-[4px] rounded-[6px] tracking-wide shadow-sm">{tag}</span>
                  ))}
                </div>
              )}
              {/* The single standard H1 tag for the entire page */}
              <h1 className="text-[36px] lg:text-[40px] font-bold text-[#1D5E2E] mb-[6px] leading-[1.1] tracking-tight">
                {product?.name}
              </h1>
              <p className="text-[#7A7A7A] text-[16px] font-medium mb-[24px]">
                {product?.subtitle || 'High-Fibre | No Palm Oil | Baked Crunch'}
              </p>
            </div>

            {/* Notification Box (Out of Stock) */}
            {product?.stock === 0 && (
              <div className="w-full mb-[32px] lg:mb-[32px] border border-[#EAEAEA] rounded-[16px] p-[24px] bg-white shadow-sm order-1 lg:order-2">
                <p className="text-[15px] text-[#4A4A4A] mb-[20px] leading-[1.5]">
                  Register to receive a notification when this item comes back in stock.
                </p>
                {notificationSuccess ? (
                  <div className="bg-[#F2F9ED] text-[#1D5E2E] p-4 rounded-[8px] text-[14px] font-medium text-center border border-[#A6C98F]">
                    You're on the list! We'll notify you when it's back.
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-[13px] text-[#4A4A4A] mb-1.5 block">Email<span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green text-[14px] transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={notificationSubmitting}
                      className="w-full h-[48px] bg-[#1a1a1a] text-white rounded-[24px] font-bold text-[15px] hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {notificationSubmitting ? 'Submitting...' : 'Notify Me'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Delivery Count */}
            {product?.delivery_count > 0 && (
              <div className="flex items-center gap-[6px] mb-[12px] order-1 lg:order-0">
                <div className="flex items-center justify-center w-[20px] h-[20px] bg-[#E8F1E9] rounded-full">
                  <Check size={12} className="text-[#1D5E2E]" />
                </div>
                <span className="text-[14px] font-bold text-[#1D5E2E] tracking-tight">
                  {product.delivery_count.toLocaleString()}+ {product.delivery_label?.trim() || 'Smiles Delivered'}
                </span>
              </div>
            )}

            {/* Price */}
            <div className={`flex items-center gap-[12px] w-full order-2 lg:order-1 ${product?.stock === 0 ? 'pt-[32px] border-t border-[#EAEAEA] lg:border-0 lg:pt-0' : ''} mb-[32px]`}>
              <span className="text-[32px] lg:text-[38px] font-bold text-[#1A1A1A] leading-[1]">₹{product?.price}</span>
              {product?.mrp > product?.price && (
                <span className="text-[18px] text-[#999999] font-medium line-through">MRP ₹{product?.mrp}</span>
              )}
            </div>

            {/* Rating Summary */}
            {totalReviewCount > 0 && (
              <div className="flex items-center gap-[8px] mt-[-16px] mb-[32px] order-2 lg:order-2">
                <div className="flex gap-[1px]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(Number(avgRating)) ? '#D89F43' : 'transparent'}
                      className={s <= Math.round(Number(avgRating)) ? 'text-[#D89F43]' : 'text-[#D1D1D1]'}
                    />
                  ))}
                </div>
                <span className="text-[14px] font-bold text-[#4A4A4A] tracking-tight">
                  {avgRating} ({totalReviewCount} Reviews)
                </span>
              </div>
            )}

            {/* Purchase Controls */}
            <div className="w-full flex flex-col lg:flex-row gap-[16px] lg:gap-[20px] order-3 lg:order-4 mb-[32px] lg:mb-0">
              <div className={`flex items-center gap-[16px] h-[64px] lg:h-[64px] w-fit ${product?.stock === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[60px] h-[60px] lg:w-[60px] lg:h-[60px] rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"><Minus size={22} strokeWidth={1.5} /></button>
                <span className="text-[22px] lg:text-[24px] font-bold text-brand-black w-[24px] text-center select-none">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-[60px] h-[60px] lg:w-[60px] lg:h-[60px] rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"><Plus size={22} strokeWidth={1.5} /></button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product?.stock === 0}
                className={`w-full lg:flex-1 h-[64px] lg:h-[64px] rounded-full border-[1.5px] font-bold text-[18px] lg:text-[18px] transition-all
                  ${product?.stock === 0
                    ? 'border-[#b5d4a6] text-[#b5d4a6] cursor-not-allowed bg-transparent'
                    : 'border-[#8cb369] text-[#4d7a2f] hover:bg-[#F2F9ED]'}`}
              >
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
              <button
                onClick={handleQuickBuy}
                disabled={product?.stock === 0}
                className={`w-full lg:flex-1 h-[64px] lg:h-[64px] rounded-full font-bold text-[18px] lg:text-[18px] transition-all shadow-sm
                  ${product?.stock === 0
                    ? 'bg-[#999999] text-white cursor-not-allowed'
                    : 'bg-[#1D5E2E] text-white hover:bg-[#154617]'}`}
              >
                Quick Buy
              </button>
            </div>

            {/* Accordions */}
            <div className="w-full flex flex-col mb-[32px] border-t border-[#EAEAEA] order-4 lg:order-3">
              {accordionItems.map((item: any) => {
                const isOpen = openSection === item.label;
                return (
                  <div key={item.label} className="border-b border-[#EAEAEA]">
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="w-full py-[20px] flex items-center justify-between font-bold text-[15px] text-brand-black hover:text-brand-green transition-colors"
                    >
                      {item.label}
                      <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        {isOpen ? <Minus size={20} strokeWidth={1.5} className="text-black" /> : <Plus size={20} strokeWidth={1.5} className="text-black" />}
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: isOpen ? '2000px' : '0px', opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="pb-[20px] text-[#4A4A4A] text-[14px] leading-[1.7]">
                        {item.isComboNutrition ? (
                          <div className="space-y-[2px]">
                            {item.content.map((group: any, gi: number) => {
                              const subOpen = openComboSub === gi;
                              return (
                                <div key={gi} className="border border-[#EAEAEA] rounded-[10px] overflow-hidden bg-white">
                                  <button
                                    onClick={() => setOpenComboSub(subOpen ? null : gi)}
                                    className="w-full py-[14px] px-[16px] flex items-center justify-between text-[14px] font-semibold text-brand-black hover:text-brand-green transition-colors bg-[#FAFAF8]"
                                  >
                                    <span className="flex items-center gap-[10px]">
                                      <span className="w-[6px] h-[6px] rounded-full bg-brand-green flex-shrink-0" />
                                      {group.name}
                                    </span>
                                    <ChevronRight size={16} strokeWidth={1.5} className={`transition-transform duration-250 ${subOpen ? 'rotate-90' : ''}`} />
                                  </button>
                                  <div
                                    className="overflow-hidden transition-all duration-250 ease-in-out"
                                    style={{ maxHeight: subOpen ? '1000px' : '0px', opacity: subOpen ? 1 : 0 }}
                                  >
                                    {group.rows?.length > 0 && (
                                      <div className="px-[16px] pb-[14px]">
                                        <div className="w-full overflow-x-auto rounded-[8px] border border-[#EAEAEA]">
                                          <table className="w-full border-collapse min-w-[300px]">
                                            <thead className="bg-gray-50 text-gray-700">
                                              <tr>
                                                <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">Nutrients</th>
                                                <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">per 100g</th>
                                                <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">% RDA per serve</th>
                                              </tr>
                                            </thead>
                                            <tbody className="bg-white text-brand-black text-[13px] font-medium">
                                              {group.rows.map((row: any, ri: number) => (
                                                <tr key={ri} className="border-t border-[#EAEAEA]">
                                                  <td className="py-2.5 px-4 font-bold">{row.nutrient}</td>
                                                  <td className="py-2.5 px-4">{row.per_100g}</td>
                                                  <td className="py-2.5 px-4">{row.rda_percent}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : item.isTable ? (
                          <div className="w-full overflow-x-auto rounded-[8px] border border-[#EAEAEA]">
                            <table className="w-full border-collapse min-w-[300px]">
                              <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                  <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">Nutrients</th>
                                  <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">per 100g</th>
                                  <th className="py-2.5 px-4 text-left font-bold text-[12px] uppercase">% RDA per serve</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white text-brand-black text-[13px] font-medium">
                                {item.content.map((row: any, i: number) => (
                                  <tr key={i} className="border-t border-[#EAEAEA]">
                                    <td className="py-2.5 px-4 font-bold">{row.nutrient}</td>
                                    <td className="py-2.5 px-4">{row.per_100g}</td>
                                    <td className="py-2.5 px-4">{row.rda_percent}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          item.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* ============================== */}
        {/* CUSTOMER REVIEWS SECTION       */}
        {/* ============================== */}
        <div className="w-full border-t border-[#EAEAEA] pt-[60px] pb-[80px]">
          <h2 className="text-[32px] md:text-[40px] font-bold text-brand-black text-center mb-[60px]">Customer Reviews</h2>

          <div className="flex flex-col lg:flex-row gap-[60px] lg:gap-[100px]">

            {/* LEFT: Stats & Review List */}
            <div className="flex-1 w-full max-w-[600px] mx-auto lg:mx-0">
              <div className="flex gap-[40px] mb-[40px]">
                <div className="flex flex-col">
                  <span className="text-[64px] font-bold text-[#1D5E2E] leading-[1] mb-2">{avgRating}</span>
                  <div className="flex gap-[4px] mb-2">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className={i <= Math.round(Number(avgRating)) ? "fill-[#1D5E2E] text-[#1D5E2E]" : "text-[#D9D9D9]"} />)}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-[8px] justify-center">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingCounts[stars as keyof typeof ratingCounts];
                    const percent = totalReviewsForBar > 0 ? (count / totalReviewsForBar) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-[12px] text-[13px] font-bold text-[#1D5E2E] cursor-pointer group" onClick={() => setReviewFilter(stars)}>
                        <div className="flex items-center gap-1 w-[32px]"><span>{stars}</span><Star size={12} className="fill-[#1D5E2E]" /></div>
                        <div className="flex-1 h-[8px] bg-[#EEEEEE] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1D5E2E] transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviewFilter !== null && (
                <div className="flex flex-col gap-3 mb-[40px]">
                  <span className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">Active Filters</span>
                  <div className="flex gap-[12px]">
                    <div className="flex items-center gap-2 px-[16px] py-[6px] bg-[#1D5E2E] text-white rounded-full text-[13px] font-bold">
                      {reviewFilter} stars <X size={14} className="cursor-pointer" onClick={() => setReviewFilter(null)} />
                    </div>
                    <div className="flex items-center gap-2 px-[16px] py-[6px] bg-[#EEFBDC] text-[#1D5E2E] rounded-full text-[13px] font-bold cursor-pointer" onClick={() => setReviewFilter(null)}>
                      Clear all <X size={14} />
                    </div>
                  </div>
                </div>
              )}

              {/* Review List */}
              <div className="flex flex-col gap-[32px]">
                {filteredReviews.length > 0 ? filteredReviews.map((review, ridx) => {
                  const isSeed = review.is_seed;
                  const name = isSeed ? review.customer_name : review.reviewer_name;
                  const title = isSeed ? review.review_title : review.review_title;
                  const text = isSeed ? review.review_message : review.review_text;
                  const date = isSeed ? review.review_date : new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                  return (
                    <div key={isSeed ? `seed-${ridx}` : review.id} className="pb-[32px] border-b border-[#EAEAEA] last:border-0">
                      <div className="mb-[12px]">
                        <div className="flex gap-[4px]">
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className={i <= review.rating ? "fill-[#1D5E2E] text-[#1D5E2E]" : "text-[#D9D9D9]"} />)}
                        </div>
                      </div>
                      <h4 className="font-bold text-[18px] text-brand-black mb-[4px]">{title}</h4>
                      <p className="text-[14px] text-[#666666] leading-[1.6] mb-[16px]">{text}</p>

                      {!isSeed && review.review_image_url && (
                        <div className="relative w-[120px] h-[120px] rounded-[12px] overflow-hidden mb-[16px] border border-[#EAEAEA]">
                          <Image src={review.review_image_url} alt="Review attachment" fill sizes="100px" className="object-cover" />
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[12px] text-[#888888]">
                        <span className="font-medium">-{name}</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="py-[40px] text-center text-[#888] italic">No reviews found.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Review Form */}
            <div id="write-review" className="flex-1 w-full max-w-[500px] mx-auto lg:mx-0">
              <div className="bg-white rounded-[24px] p-[32px] md:p-[48px] border border-[#EAEAEA] shadow-sm">
                <h3 className="text-[24px] font-bold text-brand-black mb-[32px] text-center">Leave us a review!</h3>

                {reviewSuccess ? (
                  <div className="text-center py-[60px] flex flex-col items-center">
                    <div className="w-[60px] h-[60px] bg-[#EEFBDC] rounded-full flex items-center justify-center text-[#1D5E2E] mb-4">
                      <Check size={30} strokeWidth={3} />
                    </div>
                    <h4 className="text-[20px] font-bold text-brand-black mb-2">Review Submitted!</h4>
                    <p className="text-[#666] text-[14px]">Thank you for your feedback. Your review will be visible once approved.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-[20px]">
                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Overall Rating<span className="text-red-500">*</span></label>
                      <div className="flex gap-[8px]">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            size={24}
                            onClick={() => setReviewForm(p => ({ ...p, rating: i }))}
                            className={`cursor-pointer transition-colors ${i <= reviewForm.rating ? "fill-[#1D5E2E] text-[#1D5E2E]" : "text-[#D9D9D9] hover:text-[#1D5E2E]"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Review Title<span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={reviewForm.title} onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-[#1D5E2E] text-[14px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Review<span className="text-red-500">*</span></label>
                      <textarea
                        value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                        className="w-full h-[120px] border border-[#EAEAEA] rounded-[8px] p-[16px] outline-none focus:border-[#1D5E2E] text-[14px] resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Do you have photos to share?</label>
                      {reviewImagePreview ? (
                        <div className="relative w-full h-[120px] rounded-[8px] overflow-hidden border border-[#EAEAEA]">
                          <Image src={reviewImagePreview} alt="Preview" fill sizes="100px" className="object-cover" />
                          <button type="button" onClick={() => { setReviewImage(null); setReviewImagePreview(''); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-[80px] border-[2px] border-dashed border-[#EAEAEA] rounded-[8px] flex items-center justify-center bg-[#F9F9F9] cursor-pointer hover:border-[#1D5E2E] transition-colors"
                        >
                          <span className="text-[13px] text-[#666]">Drag & Drop your photos or <span className="underline font-bold">Browse</span></span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>

                    {!user ? (
                      <button
                        type="button"
                        onClick={() => setAuthModalOpen(true)}
                        className="mt-[12px] h-[54px] bg-white border border-brand-green text-brand-green rounded-full font-bold text-[16px] hover:bg-[#F2F9ED] transition-all flex justify-center items-center gap-[12px] shadow-sm"
                      >
                        Sign in to write a review
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="mt-[12px] h-[54px] bg-[#1D5E2E] text-white rounded-full font-bold text-[16px] hover:bg-[#154617] transition-all flex justify-center items-center gap-[12px] shadow-md disabled:opacity-50"
                      >
                        {submittingReview ? <Loader2 size={20} className="animate-spin" /> : 'Submit'}
                        {!submittingReview && <div className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-[#1D5E2E]"><ChevronRight size={18} strokeWidth={3} /></div>}
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* YOU MAY ALSO LIKE SECTION      */}
        {/* ============================== */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <section className="mb-[60px] border-t border-[#EAEAEA] pt-[60px]">
            <h2 className="text-[28px] md:text-[36px] font-bold mb-[40px] text-brand-black tracking-tight font-sans lg:text-left text-center">
              You may also like
            </h2>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[32px]">
              {relatedLoading ? (
                [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
              ) : (
                relatedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))
              )}
            </div>

            {/* Mobile Carousel */}
            <div className="flex md:hidden flex-col w-full">
              <div
                id="related-mobile-carousel"
                onScroll={handleRelatedScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-[16px] pb-[24px]"
              >
                {relatedLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="snap-center shrink-0 w-[85%] max-w-[300px]">
                      <ProductCardSkeleton />
                    </div>
                  ))
                ) : (
                  relatedProducts.map((p: any) => (
                    <div key={p.id} className="snap-center shrink-0 w-[85%] max-w-[300px]">
                      <ProductCard product={p} />
                    </div>
                  ))
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-[24px] mt-[8px]">
                <button
                  onClick={() => {
                    const c = document.getElementById('related-mobile-carousel');
                    if (c) c.scrollBy({ left: -window.innerWidth * 0.85, behavior: 'smooth' });
                  }}
                  className="p-1 text-[#888888] hover:text-[#222222] transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-[8px]">
                  {relatedProducts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-[8px] rounded-full transition-all duration-300 ${idx === mobileRelatedIndex ? 'w-[24px] bg-[#1E5E28]' : 'w-[8px] bg-[#E0E0E0]'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    const c = document.getElementById('related-mobile-carousel');
                    if (c) c.scrollBy({ left: window.innerWidth * 0.85, behavior: 'smooth' });
                  }}
                  className="p-1 text-[#888888] hover:text-[#222222] transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================== */}
        {/* RELATED BLOGS SECTION (AEO)    */}
        {/* ============================== */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <section className="mb-[100px] border-t border-[#EAEAEA] pt-[60px]">
            <h2 className="text-[28px] md:text-[36px] font-bold mb-[40px] text-brand-black tracking-tight font-sans lg:text-left text-center">
              Snacking Wisdom & Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug.startsWith('/') ? blog.slug.substring(1) : blog.slug}`}
                  className="group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
                    {blog.featured_image_url ? (
                      <Image
                        src={blog.featured_image_url}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xs font-bold text-gray-400">Grainzz Blog</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {blog.excerpt || 'Read this article to find out more about healthy grain snacks.'}
                    </p>
                    <span className="text-brand-green font-bold text-sm mt-auto inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Article <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ============================== */}
      {/* PRODUCT TESTIMONIAL SLIDER     */}
      {/* ============================== */}
      <ProductTestimonialsSection />
    </div>
  );
}
