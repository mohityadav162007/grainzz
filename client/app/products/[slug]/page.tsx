'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Plus, Minus, Star, Heart } from 'lucide-react';
import { getProductBySlug, getProductsByCategory } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Description']));
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[32px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-brand-green transition-colors">All Products</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-[48px] md:gap-[80px] mb-[80px]">
          {/* Left Column: Images */}
          <div className="w-full lg:w-[600px] flex-shrink-0">
            <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-white shadow-sm border border-[#EAEAEA] mb-[16px]">
              {product.images?.length > 0 ? (
                <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
              ) : (
                <Image src="/Rectangle-10@2x.png" alt={product.name} fill className="object-cover" />
              )}
              {discount > 0 && (
                <div className="absolute top-[20px] left-[20px] bg-brand-red text-white text-[14px] font-bold px-[12px] py-[6px] rounded-[6px] tracking-wide shadow-md">
                  -{discount}%
                </div>
              )}
              {/* Veg Icon */}
              <div className="absolute top-[20px] right-[20px] w-[32px] h-[32px] border-2 border-[#1E8A38] rounded-[6px] flex items-center justify-center bg-white shadow-sm">
                <div className="w-[12px] h-[12px] bg-[#1E8A38] rounded-full" />
              </div>
            </div>
            
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[16px] overflow-hidden flex-shrink-0 transition-all 
                      ${selectedImage === i ? 'border-[2px] border-brand-green shadow-md scale-[1.02]' : 'border border-[#EAEAEA] opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex-1 flex flex-col items-start pt-[12px]">
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-[8px] mb-[16px]">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="bg-brand-red text-white text-[12px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-[32px] md:text-[45px] font-bold text-brand-black mb-[12px] leading-[1.2] tracking-tight font-sans">
              {product.name}
            </h1>
            
            {/* Reviews summary block (Figma shows stars near title usually) */}
            <div className="flex items-center gap-[8px] mb-[24px]">
              <div className="flex gap-[2px]">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-[#FFD026] text-[#FFD026] stroke-0" />)}
              </div>
              <span className="text-[14px] font-semibold text-[#8E8E8E] underline cursor-pointer hover:text-brand-black">12 Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-[16px] mb-[32px]">
              <span className="text-[32px] md:text-[40px] font-bold text-brand-black leading-[1] tracking-tight font-sans">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[20px] text-[#999999] font-medium line-through font-sans">MRP ₹{product.mrp}</span>
              )}
            </div>

            {/* Accordions */}
            <div className="w-full flex flex-col gap-[0px] mb-[40px] pt-[20px] border-t border-[#EAEAEA]">
              {accordionItems.map(({ label, content }) => (
                <div key={label} className="w-full border-b border-[#EAEAEA]">
                  <button
                    onClick={() => toggleSection(label)}
                    className="w-full flex items-center justify-between py-[16px] text-[16px] md:text-[18px] font-bold text-brand-black border-none bg-transparent cursor-pointer hover:text-brand-green transition-colors"
                  >
                    {label}
                    <span className="text-brand-green text-[20px] font-medium">{openSections.has(label) ? '−' : '+'}</span>
                  </button>
                  {openSections.has(label) && (
                    <div className="text-[15px] md:text-[16px] text-[#666666] leading-[1.6] pb-[20px] animate-fade-in font-sans pr-[20px]">
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Purchase Controls */}
            {product.stock > 0 ? (
              <div className="w-full flex flex-col gap-[20px]">
                <div className="flex flex-col sm:flex-row items-center gap-[20px] w-full">
                  {/* Quantity */}
                  <div className="flex items-center gap-[20px] w-full sm:w-auto min-w-[160px] justify-between border-[1.5px] border-[#CCCCCC] rounded-[40px] px-2 py-1 bg-white">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-[44px] h-[44px] rounded-full flex items-center justify-center hover:bg-[#F2F2F2] transition-colors cursor-pointer text-brand-black"
                    >
                      <Minus size={20} strokeWidth={2} />
                    </button>
                    <span className="text-[20px] md:text-[24px] font-bold text-brand-black font-sans">{qty}</span>
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="w-[44px] h-[44px] rounded-full flex items-center justify-center hover:bg-[#F2F2F2] transition-colors cursor-pointer text-brand-black"
                    >
                      <Plus size={20} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 w-full h-[56px] md:h-[60px] border-[1.5px] border-brand-green bg-transparent text-brand-green rounded-[40px] font-bold text-[18px] hover:bg-[#EEFBDC] transition-all cursor-pointer tracking-wide"
                  >
                    {added ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>

                {/* Quick Buy */}
                <button 
                  className="w-full h-[56px] md:h-[60px] bg-brand-green text-white rounded-[40px] font-bold text-[18px] hover:bg-[#154617] transition-all cursor-pointer tracking-wide border-none shadow-[0_4px_16px_rgba(29,94,32,0.2)]"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <div className="w-full py-[20px] bg-gray-100 rounded-[12px] text-center text-[#707070] font-bold uppercase tracking-wider">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <section className="mb-[80px]">
            <h2 className="text-[28px] md:text-[36px] font-bold mb-[32px] text-brand-black tracking-tight font-sans border-b border-[#EAEAEA] pb-4">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[32px]">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAEAEA] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex items-center gap-[12px]">
        <div className="flex-1">
          <div className="text-[14px] text-brand-black">{product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}</div>
          <div className="text-[16px] font-bold text-brand-black">₹{product.price}</div>
        </div>
        <button 
          onClick={handleAddToCart}
          className="flex-1 h-[48px] bg-brand-green text-white rounded-full font-bold text-[16px] transition-colors"
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
