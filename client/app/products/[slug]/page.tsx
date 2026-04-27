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
        {/* Desktop Breadcrumb */}
        <nav className="hidden lg:flex items-center gap-[8px] text-[14px] font-semibold text-[#8E8E8E] mb-[32px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-brand-green transition-colors">All Products</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[48px] md:gap-[80px] mb-[80px]">
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
                  <span key={tag} className="bg-[#FFF4E4] text-[#D89F43] text-[12px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            )}
            <h1 className="text-[28px] font-bold text-brand-black mb-[4px] leading-[1.2] font-sans">
              {product.name}
            </h1>
            <p className="text-[#657B67] text-[14px] font-medium mb-[16px]">{product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
          </div>

          {/* Left Column: Images */}
          <div className="w-full lg:w-[600px] flex-shrink-0 order-2 lg:order-1">
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
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-none justify-center lg:justify-start">
                {product.images.map((img: string, i: number) => (
                   <button
                   key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-[60px] h-[60px] md:w-[100px] md:h-[100px] rounded-[16px] overflow-hidden flex-shrink-0 transition-all 
                     ${selectedImage === i ? 'border-[2px] border-brand-green shadow-md scale-[1.02]' : 'border border-[#EAEAEA] opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
                 >
                   <Image src={img} alt="" fill className="object-cover" />
                 </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex-1 flex flex-col items-start pt-[12px] order-3 lg:order-2">
            
            {/* Desktop Tags & Title */}
            <div className="hidden lg:flex flex-col items-start w-full">
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-[8px] mb-[16px]">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="bg-[#FFF4E4] text-[#D89F43] text-[12px] font-bold px-[10px] py-[4px] rounded-[4px] uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              )}
              <h1 className="text-[45px] font-bold text-brand-black mb-[12px] leading-[1.2] tracking-tight font-sans">
                {product.name}
              </h1>
              <p className="text-[#657B67] text-[16px] font-medium mb-[24px]">{product.category === 'Healthy Chips' ? 'Enjoy our healthy snack packed with nutrition.' : 'Delicious and wholesome everyday snacking.'}</p>
            </div>
            
            {/* Pack of Choice (Variants UI mock) */}
            <div className="w-full mb-[32px]">
              <h3 className="text-[18px] font-bold text-brand-black mb-[16px]">Pack of choice!</h3>
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-none w-full">
                {/* Simulated variants */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[110px] lg:w-[140px] flex flex-col items-center bg-transparent border border-[#CCCCCC] rounded-[12px] overflow-hidden group cursor-pointer hover:border-brand-green transition-colors">
                    <div className="w-full aspect-[4/3] bg-white relative">
                      <Image src={product.images?.[0] || '/Rectangle-10@2x.png'} alt="pack" fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-[8px] w-full text-center bg-white border-t border-[#EEEEEE]">
                      <div className="text-[11px] font-bold text-brand-green truncate mb-[2px]">Roasted Chana</div>
                      <div className="text-[10px] text-[#A0A0A0] line-through">₹199</div>
                      <div className="text-[13px] font-bold text-brand-black text-center">₹149</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-[4px] mb-[24px]">
              <div className="flex items-center gap-[12px]">
                <span className="text-[20px] font-bold text-brand-black mr-2">Price</span>
                <span className="text-[20px] text-[#999999] font-medium line-through font-sans">₹{product.mrp}</span>
                <span className="text-[28px] lg:text-[40px] font-bold text-brand-black leading-[1] font-sans">₹{product.price}</span>
              </div>
            </div>

            {/* Purchase Controls */}
            {product.stock > 0 ? (
              <div className="w-full flex flex-col gap-[16px] mb-[40px]">
                <div className="flex items-center gap-[16px] w-full">
                  {/* Quantity */}
                  <div className="flex items-center gap-[16px] w-[130px] justify-between border-[1.5px] border-[#CCCCCC] rounded-[40px] px-4 h-[50px] bg-white">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-brand-black"><Minus size={18} strokeWidth={2} /></button>
                    <span className="text-[18px] font-bold text-brand-black">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-brand-black"><Plus size={18} strokeWidth={2} /></button>
                  </div>

                  {/* Add to Cart */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-[50px] border-[1.5px] border-brand-green bg-transparent text-brand-green rounded-[40px] font-bold text-[16px] hover:bg-[#EEFBDC] transition-all cursor-pointer"
                  >
                    {added ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>

                {/* Quick Buy */}
                <button className="w-full h-[50px] bg-[#1a1a1a] text-white rounded-[40px] font-bold text-[16px] hover:bg-black transition-all cursor-pointer tracking-wide">
                  Buy it now
                </button>
              </div>
            ) : (
              <div className="w-full py-[20px] bg-gray-100 rounded-[12px] text-center text-[#707070] font-bold mb-[40px]">Out of Stock</div>
            )}

            {/* Custom Description Text */}
            <div className="w-full flex flex-col gap-[20px] mb-[40px]">
              <div>
                <h3 className="text-[18px] font-bold text-brand-green mb-[8px]">{product.name}</h3>
                <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">Enjoy our healthy snack packed with nutrition. Roasted to perfection, absolutely no cholesterol or trans fat. It is the perfect binge-watching companion.</p>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-brand-green mb-[8px]">Ingredients</h3>
                <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">{product.ingredients || 'Supergrains (Ragi, Bajra, Sorghum), Premium Spices, Salt, Edible Vegetable Oil (Rice Bran) & Love.'}</p>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-brand-green mb-[8px]">Allergen Advice</h3>
                <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">Made in a facility that process tree nuts, peanuts, and dairy. Contains minor traces of soy.</p>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-brand-green mb-[8px]">Storage</h3>
                <p className="text-[14px] text-[#4A4A4A] leading-[1.6]">Store in a cool and dry place away from direct sunlight. Once opened, consume within 10 days.</p>
              </div>
            </div>

            {/* Nutritional Info Table */}
            <div className="w-full mb-[40px] overflow-x-auto">
              <table className="w-full border-collapse min-w-[300px] border border-[#144722]">
                <thead className="bg-[#1D5E2E] text-white">
                  <tr>
                    <th className="py-2 px-3 text-left font-bold text-[13px] border border-[#144722]">Nutrients</th>
                    <th className="py-2 px-3 text-left font-bold text-[13px] border border-[#144722]">per 100g</th>
                    <th className="py-2 px-3 text-left font-bold text-[13px] border border-[#144722]">% RDA per serve</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent text-brand-black text-[13px] font-medium">
                  {[['Energy (Kcal)', '412.3', '10.5%'],['Protein (g)', '14.5', '14.5%'],['Carbohydrates (g)', '68.5', '12%'],['Total Sugars (g)','2.5','-'],['Added Sugars (g)','0','0%'],['Dietary Fiber (g)','8.5','14.4%'],['Total Fat (g)','9.4','7.3%'],['Trans Fat (g)','0','0%'],['Sodium (mg)','320','8.6%']].map((row, i) => (
                    <tr key={i} className="border-b border-[#EAEAEA]">
                      <td className="py-2 px-3 border border-[#EAEAEA] font-bold">{row[0]}</td>
                      <td className="py-2 px-3 border border-[#EAEAEA]">{row[1]}</td>
                      <td className="py-2 px-3 border border-[#EAEAEA]">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mock Reviews Section */}
            <div className="w-full flex flex-col items-center border-t border-[#EAEAEA] py-[40px]">
              <h2 className="text-[20px] font-bold text-brand-black uppercase tracking-wider mb-[24px]">Customer Reviews</h2>
              <div className="flex flex-col w-full max-w-[400px]">
                <div className="flex items-end gap-[12px]">
                  <span className="text-[48px] font-bold text-brand-green leading-[1]">4.5</span>
                </div>
                <div className="flex gap-[2px] mb-[16px]">
                  {[1,2,3,4,5].map(i => <Star key={i} size={20} className={i !== 5 ? "fill-brand-green text-brand-green" : "text-brand-green"} />)}
                </div>
                
                {/* Bars */}
                <div className="flex flex-col gap-[8px] mb-[32px] text-[14px] text-brand-black font-semibold">
                  <div className="flex items-center gap-[8px]"><span className="w-2">5</span> <Star size={12} className="fill-brand-black text-brand-black"/> <div className="flex-1 h-[10px] bg-[#EAEAEA] rounded-full overflow-hidden"><div className="w-[85%] h-full bg-[#1D5E2E]" /></div></div>
                  <div className="flex items-center gap-[8px]"><span className="w-2">4</span> <Star size={12} className="fill-brand-black text-brand-black"/> <div className="flex-1 h-[10px] bg-[#EAEAEA] rounded-full overflow-hidden"><div className="w-[10%] h-full bg-[#1D5E2E]" /></div></div>
                  <div className="flex items-center gap-[8px]"><span className="w-2">3</span> <Star size={12} className="fill-brand-black text-brand-black"/> <div className="flex-1 h-[10px] bg-[#EAEAEA] rounded-full overflow-hidden"><div className="w-[5%] h-full bg-[#1D5E2E]" /></div></div>
                  <div className="flex items-center gap-[8px]"><span className="w-2">2</span> <Star size={12} className="fill-brand-black text-brand-black"/> <div className="flex-1 h-[10px] bg-[#EAEAEA] rounded-full overflow-hidden"><div className="w-[0%] h-full bg-[#1D5E2E]" /></div></div>
                  <div className="flex items-center gap-[8px]"><span className="w-2">1</span> <Star size={12} className="fill-brand-black text-brand-black"/> <div className="flex-1 h-[10px] bg-[#EAEAEA] rounded-full overflow-hidden"><div className="w-[0%] h-full bg-[#1D5E2E]" /></div></div>
                </div>

                {/* Filter */}
                <div className="flex gap-[8px] mb-[24px]">
                  <span className="px-[12px] py-[6px] bg-brand-green text-white text-[13px] font-bold rounded-full">Photos (12)</span>
                  <span className="px-[12px] py-[6px] border border-brand-green text-brand-green text-[13px] font-bold rounded-full">Videos (4)</span>
                </div>

                {/* Reviews List */}
                <div className="flex flex-col gap-[24px]">
                  <div className="pb-[24px] border-b border-[#EAEAEA]">
                    <div className="flex gap-[2px] mb-[8px]">{[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-brand-green text-brand-green" />)}</div>
                    <h4 className="font-bold text-[15px] text-brand-black mb-[4px]">Best healthy snack itself</h4>
                    <p className="text-[14px] text-[#4A4A4A] leading-[1.5] mb-[12px]">I like the taste, and the ingredients list looks promising. Exactly what I needed for my late night cravings.</p>
                    <div className="flex gap-[8px] mt-[12px]">
                      <Image src={product.images?.[0] || "/Rectangle-10@2x.png"} alt="review img" width={80} height={80} className="rounded-[8px] object-cover" />
                    </div>
                  </div>
                </div>

                {/* Write a review form */}
                <div className="w-full flex flex-col items-center mt-[40px] pt-[40px] border-t border-dashed border-[#CCCCCC]">
                  <h2 className="text-[18px] font-bold text-brand-black uppercase tracking-wider mb-[24px]">Leave us a review!</h2>
                  <div className="w-full flex flex-col gap-[16px]">
                    <div>
                      <span className="text-[13px] font-bold text-brand-black">Rating:</span>
                      <div className="flex gap-[4px] mt-[4px]">
                        {[1,2,3,4,5].map(i => <Star key={i} size={24} className="text-brand-green cursor-pointer transition-colors" />)}
                      </div>
                    </div>
                    <input type="text" placeholder="Your review *" className="w-full h-[48px] border-b border-[#CCCCCC] bg-transparent outline-none focus:border-brand-green text-[14px]" />
                    <input type="text" placeholder="Name *" className="w-full h-[48px] border-b border-[#CCCCCC] bg-transparent outline-none focus:border-brand-green text-[14px]" />
                    <div className="w-full h-[100px] border border-dashed border-[#CCCCCC] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-[#888888] cursor-pointer mt-2 bg-white/50">
                      <span className="text-brand-green text-[20px] mr-2">+</span> Add Photo or Video File
                    </div>
                    <button className="w-full h-[50px] border-[1.5px] border-brand-green text-brand-green font-bold text-[15px] rounded-full hover:bg-[#EEFBDC] transition-colors mt-2">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <section className="mb-[80px]">
            <h2 className="text-[24px] md:text-[36px] font-bold mb-[24px] text-brand-black tracking-tight font-sans text-center">
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
    </div>
  );
}
