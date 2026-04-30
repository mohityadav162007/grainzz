'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Plus, Minus, Star, Heart, Check } from 'lucide-react';
import { getProductBySlug, getProductsByCategory, getProductReviews } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/products/ProductCard';
import CustomerTestimonials from '@/components/home/TestimonialsSection';
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

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug as string)
      .then((res) => {
        setProduct(res.data);
        // Fetch related products by same category
        if (res.data?.category) {
          getProductsByCategory(res.data.category, 5).then((related) => {
              setRelatedProducts(related.filter((p: any) => p.id !== res.data.id).slice(0, 4));
            }).catch(() => {});
        }
        // Fetch reviews
        getProductReviews(res.data.id).then(revs => setReviews(revs)).catch(() => {});
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
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

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const accordionItems = [
    { label: 'Description', content: product.description || 'Enjoy our healthy snack packed with nutrition.' },
    { label: 'Nutrition breakdown', content: product.nutritionInfo || 'High in Fiber. Zero Cholesterol. Gluten Free.' },
    { label: 'Ingredients', content: product.ingredients || 'Supergrains (Ragi, Bajra, Sorghum).' },
  ].filter(item => item.content);

  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[60px] md:pb-[100px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Desktop Breadcrumb */}
        <nav className="hidden lg:flex items-center gap-[6px] text-[13px] font-medium text-black mb-[32px] tracking-tight">
          <Link href="/products" className="hover:text-brand-green transition-colors opacity-80">Shop All</Link>
          <ChevronRight size={13} strokeWidth={1.5} className="opacity-60" />
          <span className="opacity-100">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-[24px] lg:gap-[60px] xl:gap-[80px] mb-[80px]">
          {/* Mobile Header elements (above image) */}
          <div className="flex lg:hidden flex-col items-start w-full order-1">
            <nav className="flex items-center gap-[8px] text-[13px] font-semibold text-[#8E8E8E] mb-3 tracking-wide">
              <Link href="/" className="hover:text-brand-green">Home</Link>
              <ChevronRight size={14} />
              <Link href="/products" className="hover:text-brand-green">All Products</Link>
            </nav>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-[8px] mb-[12px]">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="bg-[#FDF7E7] text-[#D89F43] text-[11px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider shadow-sm">{tag}</span>
                ))}
              </div>
            )}
            <h1 className="text-[28px] font-bold text-brand-black mb-[4px] leading-[1.2] font-sans">
              {product.name}
            </h1>
            <p className="text-[#657B67] text-[14px] font-medium mb-[16px]">{product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
          </div>

            {/* Left Column: Images & Descriptions */}
            <div className="w-full lg:w-[46%] xl:w-[46%] flex-shrink-0 order-2 lg:order-1 flex flex-col justify-between gap-[24px]">
              {/* Image Gallery */}
              <div className="flex flex-col gap-[16px]">
                
                {/* Main Image */}
                <div className="relative w-full aspect-square rounded-[24px] overflow-hidden bg-white shadow-sm border border-[#EAEAEA] order-1">
                  {product.images?.length > 0 ? (
                    <Image src={product.images[selectedImage % product.images.length]} alt={product.name} fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  ) : (
                    <Image src="/Rectangle-10@2x.png" alt={product.name} fill className="object-cover" />
                  )}
                {discount > 0 && (
                  <div className="absolute top-[20px] left-[20px] bg-brand-red text-white text-[13px] font-bold px-[14px] py-[6px] rounded-full tracking-wide shadow-sm z-10">
                    -{discount}%
                  </div>
                )}
                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center z-10 backdrop-blur-[0.5px]">
                    <div className="w-[130px] h-[130px] rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-white">
                      <span className="text-[#1a1a1a] font-semibold text-[15px] tracking-tight">Out of Stock</span>
                    </div>
                  </div>
                )}
                {/* Veg Icon */}
                <div className="absolute top-[20px] right-[20px] w-[22px] h-[22px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10">
                  <div className="w-[10px] h-[10px] bg-[#1E8A38] rounded-full" />
                </div>
              </div>

              {/* Thumbnails (horizontal everywhere) */}
              <div className="flex flex-col gap-[16px] order-2 w-full">
                <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-none justify-center lg:justify-start flex-shrink-0">
                  {(product.images?.length > 0 ? [...Array(Math.max(5, product.images.length))].map((_, i) => ({
                    img: product.images[i % product.images.length],
                    index: i
                  })) : [...Array(5)].map((_, i) => ({
                    img: "/Rectangle-10@2x.png",
                    index: i
                  }))).slice(0, 5).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-[12px] overflow-hidden flex-shrink-0 transition-all 
                        ${selectedImage === i ? 'border-[2px] border-brand-green shadow-sm' : 'border border-[#EAEAEA] opacity-80 hover:opacity-100'}`}
                    >
                      <Image src={item.img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
                
                {/* Mobile Image Navigation (Arrows & Dots) */}
                <div className="flex lg:hidden items-center justify-center gap-[24px] mt-[4px]">
                  <button className="text-[#999] hover:text-black transition-colors"><ChevronLeft size={24} strokeWidth={1.5} /></button>
                  <div className="flex gap-[10px]">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`w-[10px] h-[10px] rounded-full ${i === selectedImage % 6 ? 'bg-brand-green' : 'bg-[#EAEAEA]'}`} />
                    ))}
                  </div>
                  <button className="text-[#999] hover:text-black transition-colors"><ChevronRight size={24} strokeWidth={1.5} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Purchase */}
          <div className="flex-1 flex flex-col justify-between items-start lg:pt-0 order-3 lg:order-2 w-full lg:min-h-full">
            
            {/* Desktop Tags & Title */}
            <div className="hidden lg:flex flex-col items-start w-full">
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-[8px] mb-[16px]">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="bg-[#FDF7E7] text-[#D89F43] text-[11px] font-bold px-[12px] py-[4px] rounded-[4px] uppercase tracking-wider shadow-sm">{tag}</span>
                    ))}
                  </div>
                )}
              <h1 className="text-[36px] lg:text-[45px] font-extrabold text-[#1D5E2E] mb-[8px] leading-[1.1] tracking-tight font-sans">
                {product.name}
              </h1>
              <p className="text-[#657B67] text-[16px] font-medium mb-[24px]">{product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
            </div>
            
            {/* Pick your product (Variant Picker) */}
            <div className="w-full flex flex-col items-start mb-[32px] order-1">
              <h3 className="text-[16px] font-bold text-brand-black mb-[16px]">Pick your product</h3>
              <div className="flex gap-[16px] overflow-x-auto w-full pb-2 scrollbar-none">
                {[1,2,3,4].map((v) => (
                  <div key={v} className="flex flex-col gap-[8px] flex-shrink-0 w-[110px]">
                    <div className={`relative w-full aspect-square rounded-[12px] overflow-hidden border-[2px] transition-all ${v === 1 ? 'border-brand-green shadow-sm' : 'border-transparent bg-white shadow-sm'}`}>
                      <Image src={product.images?.[0] || "/Rectangle-10@2x.png"} alt="" fill className="object-cover" />
                    </div>
                    <span className={`text-[12px] font-bold text-center ${v === 1 ? 'text-brand-green' : 'text-[#8E8E8E]'}`}>Beetroot Chips</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Form if Out of Stock */}
            {product.stock === 0 && (
              <div className="w-full border border-[#EAEAEA] bg-white rounded-[20px] p-[32px] md:p-[48px] mb-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-black/5 order-2 lg:order-4">
                <h3 className="text-[20px] md:text-[24px] text-brand-black leading-[1.3] mb-[32px] font-bold tracking-tight">
                  Register to receive a notification when this item comes back in stock.
                </h3>
                <div className="mb-[28px]">
                  <label className="text-[14px] font-bold text-brand-black mb-[10px] block">Email<span className="text-brand-red ml-0.5">*</span></label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full h-[54px] border border-[#EAEAEA] rounded-[8px] px-[16px] outline-none focus:border-brand-green transition-colors text-[14px] font-medium placeholder:text-[#999]" 
                  />
                </div>
                <button className="w-full h-[56px] bg-[#1a1a1a] text-white rounded-full font-bold text-[16px] hover:bg-black transition-all shadow-lg active:scale-[0.98]">
                  Notify Me
                </button>
              </div>
            )}

            {/* Price (Repositioned for Mobile) */}
            <div className="flex lg:hidden flex-col gap-[4px] mb-[28px] order-3">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <span className="text-[28px] lg:text-[34px] font-bold text-brand-black leading-[1] font-sans">₹{product.price}</span>
                <span className="text-[16px] text-[#999999] font-medium line-through font-sans">MRP ₹{product.mrp}</span>
              </div>
            </div>

            {/* Desktop Price */}
            <div className="hidden lg:flex flex-col gap-[4px] mb-[28px] order-2">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <span className="text-[28px] lg:text-[34px] font-bold text-brand-black leading-[1] font-sans">₹{product.price}</span>
                <span className="text-[16px] text-[#999999] font-medium line-through font-sans">MRP ₹{product.mrp}</span>
              </div>
            </div>

            {/* Accordions (Desktop Only) */}
            {product.stock > 0 && (
              <div className="hidden lg:flex flex-col mb-[32px] border-t border-[#EAEAEA] w-full">
                {accordionItems.map((item) => (
                  <div key={item.label} className="border-b border-[#EAEAEA]">
                    <button 
                      onClick={() => toggleSection(item.label)}
                      className="w-full py-[18px] flex items-center justify-between font-bold text-[14px] text-brand-black hover:text-brand-green transition-colors uppercase tracking-wide"
                    >
                      {item.label}
                      {openSections.has(item.label) ? <Minus size={20} strokeWidth={1} className="text-black"/> : <Plus size={20} strokeWidth={1} className="text-black"/>}
                    </button>
                    {openSections.has(item.label) && (
                      <div className="pb-[16px] text-[#4A4A4A] text-[13px] leading-[1.6]">
                        {item.label === 'Nutrition breakdown' ? (
                          <div className="w-full mt-2 overflow-x-auto">
                            {product.nutrition_table && product.nutrition_table.length > 0 ? (
                              <table className="w-full border-collapse min-w-[300px] border border-[#EAEAEA]">
                                <thead className="bg-[#1D5E2E] text-white">
                                  <tr>
                                    <th className="py-2 px-3 text-left font-bold text-[12px] border border-[#EAEAEA]">Nutrients</th>
                                    <th className="py-2 px-3 text-left font-bold text-[12px] border border-[#EAEAEA]">per 100g</th>
                                    <th className="py-2 px-3 text-left font-bold text-[12px] border border-[#EAEAEA]">% RDA per serve</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-transparent text-brand-black text-[12px] font-medium border-x border-[#EAEAEA]">
                                  {product.nutrition_table.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-[#EAEAEA]">
                                      <td className="py-2 px-3 border border-[#EAEAEA] font-bold">{row.nutrient}</td>
                                      <td className="py-2 px-3 border border-[#EAEAEA]">{row.per_100g}</td>
                                      <td className="py-2 px-3 border border-[#EAEAEA]">{row.rda_percent}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs italic text-gray-400">Nutrition information not available for this product.</p>
                            )}
                          </div>
                        ) : (
                          item.content
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Flat Sections for Mobile (In-Stock Only) */}
            {product.stock > 0 && (
              <div className="flex lg:hidden flex-col gap-[32px] mb-[48px] w-full order-5">
                <div className="flex flex-col gap-[12px]">
                  <h2 className="text-[24px] font-bold text-brand-black leading-[1.2]">{product.name}</h2>
                  <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">
                    {product.description || 'Enjoy our healthy snack packed with nutrition. Perfect for any time of the day.'}
                  </p>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <h3 className="text-[18px] font-bold text-brand-green">Ingredients</h3>
                  <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">{product.ingredients || 'Supergrains (Ragi, Bajra, Sorghum), Vegetable Oil, Salt.'}</p>
                </div>

                <div className="flex flex-col gap-[12px]">
                  <h3 className="text-[18px] font-bold text-brand-black mt-2">Allergen Advice</h3>
                  <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">Contains gluten. Processed in a facility that also handles nuts and dairy.</p>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <h3 className="text-[18px] font-bold text-brand-green">Storage</h3>
                  <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">Store in a cool, dry place. Once opened, consume within 10 days for best quality.</p>
                </div>

                {/* Detailed Nutrition Table */}
                <div className="w-full overflow-x-auto mt-4 rounded-[12px] border border-[#EAEAEA]">
                  {product.nutrition_table && product.nutrition_table.length > 0 ? (
                    <table className="w-full border-collapse min-w-[340px]">
                      <thead className="bg-[#1D5E2E] text-white">
                        <tr>
                          <th className="py-3 px-3 text-left font-bold text-[12px] border-r border-white/20 uppercase tracking-tight">Nutrients</th>
                          <th className="py-3 px-3 text-left font-bold text-[12px] border-r border-white/20 uppercase tracking-tight">per 100g</th>
                          <th className="py-3 px-3 text-left font-bold text-[12px] uppercase tracking-tight">% RDA*</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white text-brand-black text-[11px] font-medium uppercase tracking-tight">
                        {product.nutrition_table.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#F9FAF9] transition-colors">
                            <td className="py-3 px-3 font-bold border-r border-[#F0F0F0] whitespace-nowrap">{row.nutrient}</td>
                            <td className="py-3 px-3 border-r border-[#F0F0F0] text-center">{row.per_100g}</td>
                            <td className="py-3 px-3 text-center">{row.rda_percent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-xs italic text-center text-gray-400">Nutrition information not available.</p>
                  )}
                </div>
              </div>
            )}



            {/* Purchase Controls */}
            <div className="w-full flex flex-col gap-[16px] mb-0 order-4">
              <div className="flex items-center gap-[24px] w-full">
                {/* Quantity */}
                <div className={`flex items-center gap-[16px] h-[50px] ${product.stock === 0 ? 'opacity-30 pointer-events-none' : ''}`}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[44px] h-[44px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2F2F2] transition-colors"><Minus size={18} strokeWidth={1.5} /></button>
                  <span className="text-[18px] font-bold text-brand-black w-[16px] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-[44px] h-[44px] rounded-full border border-[#4A4A4A] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F2F2F2] transition-colors"><Plus size={18} strokeWidth={1.5} /></button>
                </div>

                {/* Add to Cart */}
                <button 
                  onClick={product.stock > 0 ? handleAddToCart : undefined}
                  disabled={product.stock === 0}
                  className={`flex-1 h-[54px] border-[1.5px] rounded-full font-bold text-[15px] transition-all ${
                    product.stock === 0 
                      ? 'border-[#B6C9B0] text-[#B6C9B0] bg-transparent cursor-not-allowed'
                      : 'border-[#1D5E2E]/40 bg-[#FCF9F2] text-[#1D5E2E] hover:bg-white hover:border-[#1D5E2E] cursor-pointer'
                  }`}
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>

              {/* Quick Buy */}
              <button 
                disabled={product.stock === 0}
                className={`w-full h-[54px] rounded-full font-bold text-[16px] transition-all tracking-wide ${
                  product.stock === 0 
                    ? 'bg-[#908F8B] text-white cursor-not-allowed'
                    : 'bg-[#1D5E2E] text-white hover:bg-[#154617] cursor-pointer shadow-md'
                }`}
              >
                Quick Buy
              </button>
            </div>

            
          </div>
        </div>

        <div className="w-full flex justify-center border-t border-[#EAEAEA] py-[60px] lg:pt-[100px] lg:pb-[80px]">
          <div className="w-full max-w-[1240px] flex flex-col items-center">
            <h2 className="text-[28px] lg:text-[40px] font-bold text-brand-black tracking-tight mb-[60px] text-center font-sans uppercase">Customer Reviews</h2>
            
            <div className="flex flex-col lg:flex-row gap-[60px] lg:gap-[120px] w-full px-4 lg:px-0">
              {/* Left Column: Review List & Stats */}
              <div className="flex-1 flex flex-col w-full max-w-[540px] mx-auto lg:mx-0">
                <div className="flex items-center gap-[24px] mb-[32px]">
                  <span className="text-[60px] lg:text-[72px] font-bold text-brand-green leading-[1]">
                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                  </span>
                  <div className="flex flex-col gap-[2px]">
                    <div className="flex gap-[4px]">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={24} className={i <= (reviews.length > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5) ? "fill-brand-green text-brand-green" : "text-[#CCCCCC]"} />
                      ))}
                    </div>
                    <span className="text-[14px] text-[#707070] font-medium">{reviews.length} Reviews</span>
                  </div>
                </div>
                
                {/* Bars */}
                <div className="flex flex-col gap-[14px] mb-[48px] w-full">
                  {[
                    { stars: 5, width: '85%' },
                    { stars: 4, width: '35%' },
                    { stars: 3, width: '8%' },
                    { stars: 2, width: '0%' },
                    { stars: 1, width: '0%' }
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-[16px] text-[15px] font-bold text-brand-black">
                      <div className="flex items-center gap-[4px] w-[50px]">
                        <span>{row.stars}</span>
                        <Star size={14} className="fill-brand-black text-brand-black -mt-0.5"/>
                      </div>
                      <div className="flex-1 h-[10px] bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className={`h-full bg-brand-green rounded-full`} style={{ width: row.width }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Toggle Buttons */}
                <div className="flex gap-[16px] mb-[48px]">
                  <button className="px-[24px] py-[10px] bg-[#1D5E2E] text-white text-[15px] font-bold rounded-full shadow-md">Reviews ({reviews.length})</button>
                  <button className="px-[24px] py-[10px] border border-[#EEEEEE] bg-white text-[#707070] text-[15px] font-bold rounded-full hover:bg-[#F9FAF9] transition-colors">Enquiries (0)</button>
                </div>

                {/* Reviews List */}
                <div className="flex flex-col gap-[40px] pt-[24px] border-t border-[#EAEAEA]">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="pb-[40px] border-b border-[#F0F0F0] last:border-0 text-left">
                      <div className="flex gap-[4px] mb-[12px]">
                        {[1,2,3,4,5].map(i => <Star key={i} size={18} className={i <= (review.rating || 5) ? "fill-brand-green text-brand-green" : "text-[#CCCCCC]"} />)}
                      </div>
                      <div className="flex items-center gap-[8px] mb-[12px]">
                        <h4 className="font-bold text-[18px] text-brand-black">{review.name || 'Customer'}'s review</h4>
                        <div className="flex items-center gap-1 bg-[#EEFBDC] text-brand-green px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <Check size={12} strokeWidth={3}/> Verified Buyer
                        </div>
                      </div>
                      <p className="text-[15px] text-[#4A4A4A] leading-[1.6] mb-[20px]">{review.review_text}</p>
                      
                      <div className="flex justify-between items-center text-[13px] text-[#888888] font-bold">
                        <div className="flex items-center gap-4">
                          <span>{review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="py-10 text-center text-gray-400 italic">No reviews yet. Be the first to review!</p>
                  )}

                  {/* Pagination Footer */}
                  {reviews.length > 8 && (
                    <div className="flex justify-between items-center pt-[20px]">
                      <span className="text-[14px] text-[#888888] font-bold tracking-tight">1–8 of {reviews.length} Reviews</span>
                      <div className="flex gap-[12px]">
                        <button className="w-[44px] h-[44px] rounded-full border border-[#EAEAEA] flex items-center justify-center hover:bg-white transition-all shadow-sm">
                          <ChevronLeft size={20} className="text-black" />
                        </button>
                        <button className="w-[44px] h-[44px] rounded-full bg-brand-green text-white flex items-center justify-center hover:bg-[#154617] transition-all shadow-md">
                          <ChevronRight size={20} className="text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Write a review form */}
              <div className="flex-1 flex w-full justify-center lg:justify-start pt-8 lg:pt-0">
                <div className="w-full max-w-[500px] h-fit flex flex-col">
                  <h2 className="text-[28px] font-bold text-brand-black mb-[44px] tracking-tight uppercase">Leave us an enquiry!</h2>
                  <div className="flex flex-col gap-[24px]">
                    <div>
                      <span className="text-[14px] font-bold text-brand-black">Overall Rating<span className="text-brand-red ml-1">*</span></span>
                      <div className="flex gap-[10px] mt-[12px]">
                        {[1,2,3,4,5].map(i => <Star key={i} size={28} strokeWidth={1} className="text-[#CCCCCC] cursor-pointer hover:text-brand-green transition-all" />)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-brand-black">Enquiry<span className="text-brand-red ml-1">*</span></span>
                      <textarea placeholder="You" className="w-full h-[100px] border border-[#EAEAEA] rounded-[8px] bg-white outline-none focus:border-brand-green text-[14px] mt-[10px] p-[16px] resize-none placeholder:text-[#999]" />
                      <textarea placeholder="Your question" className="w-full h-[80px] border border-[#EAEAEA] rounded-[8px] bg-transparent outline-none border-t-0 -mt-1 rounded-t-none text-[14px] p-[16px] resize-none text-[#707070] opacity-60" disabled />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-brand-black">Name<span className="text-brand-red ml-1">*</span></span>
                      <input type="text" className="w-full h-[52px] border border-[#EAEAEA] rounded-[8px] bg-white outline-none focus:border-brand-green text-[14px] mt-[10px] px-[16px]" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-brand-black">Email<span className="text-brand-red ml-1">*</span></span>
                      <input type="email" className="w-full h-[52px] border border-[#EAEAEA] rounded-[8px] bg-white outline-none focus:border-brand-green text-[14px] mt-[10px] px-[16px]" />
                    </div>
                    
                    {/* Placeholder for reCAPTCHA */}
                    <div className="w-full h-[76px] bg-[#F9F9F9] border border-[#EAEAEA] rounded-[4px] flex items-center px-4 gap-4 mt-2">
                       <div className="w-6 h-6 border-2 border-[#C1C1C1] rounded-[2px]" />
                       <span className="text-[14px] font-medium text-[#4D4D4D]">I'm not a robot</span>
                       <div className="ml-auto flex flex-col items-center">
                          <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="recaptcha" width={24} height={24} />
                          <span className="text-[8px] text-[#555] font-bold -mt-1">reCAPTCHA</span>
                       </div>
                    </div>

                    <button className="flex items-center gap-[12px] bg-[#1a1a1a] text-white font-bold text-[16px] rounded-full pl-[36px] pr-[12px] py-[12px] self-start hover:bg-black transition-all shadow-lg mt-[12px]">
                      Submit 
                      <div className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-black">
                        <ChevronRight size={18} strokeWidth={3}/>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <section className="mb-[60px] lg:mb-[80px]">
            <h2 className="text-[24px] md:text-[32px] font-bold mb-[32px] text-brand-black tracking-tight font-sans">
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
      
      {/* Testimonials */}
      <CustomerTestimonials />
    </div>
  );
}
