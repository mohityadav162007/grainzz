'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Plus, Minus, Star, Check, X, Upload, Loader2 } from 'lucide-react';
import { getProductBySlug, getProductReviews, submitProductReview, uploadReviewImage, getRelatedProductsSection } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/products/ProductCard';
import ProductTestimonialsSection from '@/components/products/ProductTestimonialsSection';
import { supabase } from '@/lib/supabase';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Description']));
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const { addItem } = useCartStore();

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', text: '', name: '', email: '' });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review Filter State
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let subscription: any;

    Promise.all([
      getProductBySlug(slug as string).catch(err => { console.error('getProductBySlug failed:', err); return { data: null }; }),
      getRelatedProductsSection().catch(err => { console.error('getRelatedProductsSection failed:', err); return []; })
    ]).then(([productRes, relatedRes]) => {
      setProduct(productRes.data);
      if (productRes.data) {
        // Fetch initial reviews
        getProductReviews(productRes.data.id).then(revs => {
          console.log(`[FRONTEND] Fetched reviews count: ${revs.length}`);
          console.log(`[FRONTEND] is_visible values:`, revs.map((r: any) => r.is_visible));
          setReviews(revs);
        }).catch(() => {});

        // Set up realtime subscription for instant moderation syncing
        const channelName = `public:reviews:${productRes.data.id}:${Math.random().toString(36).substring(7)}`;
        const channel: any = supabase.channel(channelName);
        subscription = channel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `product_id=eq.${productRes.data.id}` }, (payload: any) => {
            console.log('[FRONTEND] Realtime update received:', payload);
            // Refetch all reviews to ensure accurate state and RLS
            getProductReviews(productRes.data.id).then(revs => {
              console.log(`[FRONTEND-REALTIME] Refetched reviews count: ${revs.length}`);
              setReviews(revs);
            }).catch(() => {});
          })
          .subscribe();
      }
      setRelatedProducts(relatedRes);
    }).finally(() => setLoading(false));

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [slug]);

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
      tags: product.tags,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return alert('Please select a rating');
    if (!reviewForm.title || !reviewForm.text || !reviewForm.name || !reviewForm.email) return alert('Please fill in all required fields');
    
    setSubmittingReview(true);
    try {
      let imageUrl = '';
      if (reviewImage) {
        imageUrl = await uploadReviewImage(reviewImage);
      }
      
      await submitProductReview({
        product_id: product.id,
        reviewer_name: reviewForm.name,
        reviewer_email: reviewForm.email,
        review_title: reviewForm.title,
        review_text: reviewForm.text,
        rating: reviewForm.rating,
        review_image_url: imageUrl || undefined
      });
      
      setReviewSuccess(true);
      setReviewForm({ rating: 0, title: '', text: '', name: '', email: '' });
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

  const filteredReviews = reviewFilter ? reviews.filter(r => r.rating === reviewFilter) : reviews;

  // Review Stats Calculation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (ratingCounts[r.rating as keyof typeof ratingCounts] !== undefined) ratingCounts[r.rating as keyof typeof ratingCounts]++; });

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] py-[60px]">
        <div className="grid md:grid-cols-2 gap-[48px]">
          <div className="aspect-square bg-[#EEEEEE] rounded-[20px] animate-pulse" />
          <div className="space-y-[24px]">
            <div className="h-[40px] bg-[#EEEEEE] rounded-[8px] animate-pulse w-3/4" />
            <div className="h-[24px] bg-[#EEEEEE] rounded-[8px] animate-pulse w-1/2" />
            <div className="h-[64px] bg-[#EEEEEE] rounded-[8px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-[100px] text-center text-[#707070] font-sans">Product not found.</div>;

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const accordionItems = [
    { label: 'Description', content: product.description },
    { label: 'Nutrition breakdown', isTable: true, content: product.nutrition_table },
    { label: 'Ingredients', content: product.ingredients },
  ].filter(item => item.content || (item.isTable && item.content?.length > 0));

  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[60px] md:pb-[100px] font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Desktop Breadcrumb */}
        <nav className="hidden lg:flex items-center gap-[6px] text-[13px] font-medium text-black mb-[32px] tracking-tight">
          <Link href="/products" className="hover:text-brand-green transition-colors opacity-80">Shop All</Link>
          <ChevronRight size={13} strokeWidth={1.5} className="opacity-60" />
          <span className="opacity-100">{product.name}</span>
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
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-[8px] mb-[12px]">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="bg-[#FDF7E7] text-[#D89F43] text-[11px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider shadow-sm">{tag}</span>
                ))}
              </div>
            )}
            <h1 className="text-[28px] font-bold text-brand-black mb-[4px] leading-[1.2]">
              {product.name}
            </h1>
            <p className="text-[#657B67] text-[14px] font-medium mb-[16px]">{product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
          </div>

          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-[46%] xl:w-[46%] flex-shrink-0 order-2 lg:order-1 flex flex-col gap-[16px]">
            {/* Main Image */}
            <div className="relative w-full aspect-[4/3] md:aspect-square rounded-[24px] overflow-hidden bg-[#F5F0E8] shadow-sm border border-[#EAEAEA]">
              {product.images?.length > 0 ? (
                <Image src={product.images[selectedImage % product.images.length]} alt={product.name} fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" priority />
              ) : (
                <Image src="/Rectangle-10@2x.png" alt={product.name} fill className="object-cover" />
              )}
              {discount > 0 && (
                <div className="absolute top-[20px] left-[20px] bg-brand-red text-white text-[13px] font-bold px-[14px] py-[6px] rounded-full tracking-wide shadow-sm z-10">
                  -{discount}%
                </div>
              )}
              {/* Veg Icon */}
              <div className="absolute top-[20px] right-[20px] w-[22px] h-[22px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10">
                <div className="w-[10px] h-[10px] bg-[#1E8A38] rounded-full" />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-none">
              {product.images?.slice(0, 10).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-[12px] overflow-hidden flex-shrink-0 transition-all 
                    ${selectedImage === i ? 'border-[2px] border-brand-green shadow-md' : 'border border-[#EAEAEA] opacity-70 hover:opacity-100'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col items-start order-3 lg:order-2 w-full">
            {/* Desktop Tags & Title */}
            <div className="hidden lg:flex flex-col items-start w-full">
              {product.tags?.length > 0 && (
                <div className="flex gap-[8px] mb-[16px]">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="bg-[#FDF7E7] text-[#D89F43] text-[12px] font-bold px-[12px] py-[5px] rounded-[6px] tracking-wide shadow-sm">{tag}</span>
                  ))}
                </div>
              )}
              <h1 className="text-[36px] lg:text-[42px] font-bold text-[#1D5E2E] mb-[8px] leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              <p className="text-[#657B67] text-[15px] font-medium mb-[24px]">
                {product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-[12px] mb-[32px]">
              <span className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1]">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[18px] text-[#999999] font-medium line-through">MRP ₹{product.mrp}</span>
              )}
            </div>

            {/* Accordions */}
            <div className="w-full flex flex-col mb-[32px] border-t border-[#EAEAEA]">
              {accordionItems.map((item) => (
                <div key={item.label} className="border-b border-[#EAEAEA]">
                  <button 
                    onClick={() => toggleSection(item.label)}
                    className="w-full py-[20px] flex items-center justify-between font-bold text-[15px] text-brand-black hover:text-brand-green transition-colors"
                  >
                    {item.label}
                    {openSections.has(item.label) ? <Minus size={20} strokeWidth={1.5} className="text-black"/> : <Plus size={20} strokeWidth={1.5} className="text-black"/>}
                  </button>
                  {openSections.has(item.label) && (
                    <div className="pb-[20px] text-[#4A4A4A] text-[14px] leading-[1.7]">
                      {item.isTable ? (
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
                  )}
                </div>
              ))}
            </div>

            {/* Purchase Controls */}
            <div className="w-full flex flex-col lg:flex-row gap-[16px]">
              <div className="flex items-center gap-[16px] h-[54px]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[54px] h-[54px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"><Minus size={20} strokeWidth={1.5} /></button>
                <span className="text-[20px] font-bold text-brand-black w-[24px] text-center select-none">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-[54px] h-[54px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"><Plus size={20} strokeWidth={1.5} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-[54px] rounded-full border-[1.5px] border-[#1D5E2E] text-[#1D5E2E] font-bold text-[16px] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
              <button 
                disabled={product.stock === 0}
                className="flex-1 h-[54px] rounded-full bg-[#1D5E2E] text-white font-bold text-[16px] hover:bg-[#154617] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quick Buy
              </button>
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
              {/* Overall Stats */}
              <div className="flex gap-[40px] mb-[40px]">
                <div className="flex flex-col">
                  <span className="text-[64px] font-bold text-[#1D5E2E] leading-[1] mb-2">{avgRating}</span>
                  <div className="flex gap-[4px] mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={20} className={i <= Math.round(Number(avgRating)) ? "fill-[#1D5E2E] text-[#1D5E2E]" : "text-[#D9D9D9]"} />)}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-[8px] justify-center">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingCounts[stars as keyof typeof ratingCounts];
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-[12px] text-[13px] font-bold text-[#1D5E2E] cursor-pointer group" onClick={() => setReviewFilter(stars)}>
                        <div className="flex items-center gap-1 w-[32px]"><span>{stars}</span><Star size={12} className="fill-[#1D5E2E]"/></div>
                        <div className="flex-1 h-[8px] bg-[#EEEEEE] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1D5E2E] transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filters */}
              {(reviewFilter !== null || totalReviews > 0) && (
                <div className="flex flex-col gap-3 mb-[40px]">
                  <span className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">Active Filters</span>
                  <div className="flex gap-[12px]">
                    {reviewFilter && (
                      <div className="flex items-center gap-2 px-[16px] py-[6px] bg-[#1D5E2E] text-white rounded-full text-[13px] font-bold">
                        {reviewFilter} stars <X size={14} className="cursor-pointer" onClick={() => setReviewFilter(null)} />
                      </div>
                    )}
                    {reviewFilter && (
                      <div className="flex items-center gap-2 px-[16px] py-[6px] bg-[#EEFBDC] text-[#1D5E2E] rounded-full text-[13px] font-bold cursor-pointer" onClick={() => setReviewFilter(null)}>
                        Clear all <X size={14} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Review List */}
              <div className="flex flex-col gap-[32px]">
                {filteredReviews.length > 0 ? filteredReviews.map(review => (
                  <div key={review.id} className="pb-[32px] border-b border-[#EAEAEA] last:border-0">
                    <div className="flex gap-[4px] mb-[12px]">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= review.rating ? "fill-[#1D5E2E] text-[#1D5E2E]" : "text-[#D9D9D9]"} />)}
                    </div>
                    <h4 className="font-bold text-[18px] text-brand-black mb-[8px]">{review.review_title}</h4>
                    <p className="text-[14px] text-[#666666] leading-[1.6] mb-[16px]">{review.review_text}</p>
                    
                    {review.review_image_url && (
                      <div className="relative w-[120px] h-[120px] rounded-[12px] overflow-hidden mb-[16px] border border-[#EAEAEA]">
                        <Image src={review.review_image_url} alt="Review attachment" fill className="object-cover" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-[12px] text-[#888888]">
                      <span className="font-medium">-{review.reviewer_name}</span>
                      <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                )) : (
                  <p className="py-[40px] text-center text-[#888] italic">No reviews found.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Review Form */}
            <div className="flex-1 w-full max-w-[500px] mx-auto lg:mx-0">
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
                        {[1,2,3,4,5].map(i => (
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
                        value={reviewForm.title} onChange={e => setReviewForm(p => ({...p, title: e.target.value}))}
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-[#1D5E2E] text-[14px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Review<span className="text-red-500">*</span></label>
                      <textarea 
                        value={reviewForm.text} onChange={e => setReviewForm(p => ({...p, text: e.target.value}))}
                        className="w-full h-[120px] border border-[#EAEAEA] rounded-[8px] p-[16px] outline-none focus:border-[#1D5E2E] text-[14px] resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Name<span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={reviewForm.name} onChange={e => setReviewForm(p => ({...p, name: e.target.value}))}
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-[#1D5E2E] text-[14px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Email<span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        value={reviewForm.email} onChange={e => setReviewForm(p => ({...p, email: e.target.value}))}
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-[#1D5E2E] text-[14px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-brand-black mb-[8px] block">Do you have photos to share?</label>
                      {reviewImagePreview ? (
                        <div className="relative w-full h-[120px] rounded-[8px] overflow-hidden border border-[#EAEAEA]">
                          <Image src={reviewImagePreview} alt="Preview" fill className="object-cover" />
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

                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="mt-[12px] h-[54px] bg-[#1D5E2E] text-white rounded-full font-bold text-[16px] hover:bg-[#154617] transition-all flex justify-center items-center gap-[12px] shadow-md disabled:opacity-50"
                    >
                      {submittingReview ? <Loader2 size={20} className="animate-spin" /> : 'Submit'}
                      {!submittingReview && <div className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-[#1D5E2E]"><ChevronRight size={18} strokeWidth={3}/></div>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* YOU MAY ALSO LIKE SECTION      */}
        {/* ============================== */}
        {relatedProducts.length > 0 && (
          <section className="mb-[100px] border-t border-[#EAEAEA] pt-[60px]">
            <h2 className="text-[28px] md:text-[36px] font-bold mb-[40px] text-brand-black tracking-tight font-sans">
              You may also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[32px]">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
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
