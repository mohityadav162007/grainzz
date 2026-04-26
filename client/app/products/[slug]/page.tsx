'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
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
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center text-text-muted">Product not found.</div>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const accordionItems = [
    { label: 'Description', content: product.description },
    { label: 'Nutrition breakdown', content: product.nutritionInfo },
    { label: 'Ingredients', content: product.ingredients },
  ].filter(item => item.content);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/products" className="hover:text-primary transition-colors">Shop All</Link>
        <ChevronRight size={14} />
        <span className="text-text-main">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream mb-4">
            {product.images?.length > 0 ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🫙</div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 badge-discount">-{discount}%</div>
            )}
            {/* Veg Icon */}
            <div className="absolute top-4 right-4 w-7 h-7 border-2 border-green-600 rounded flex items-center justify-center bg-white">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags.map((tag: string) => (
                <span key={tag} className="badge-tag">{tag}</span>
              ))}
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-1">{product.name}</h1>
          {product.nutritionInfo && (
            <p className="text-sm text-text-muted mb-3">{product.nutritionInfo}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-primary">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-lg text-text-muted line-through">MRP ₹{product.mrp}</span>
            )}
            {discount > 0 && (
              <span className="badge-discount">{discount}% off</span>
            )}
          </div>

          {/* Accordion */}
          <div className="border-t border-gray-100">
            {accordionItems.map(({ label, content }) => (
              <div key={label} className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection(label)}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold hover:text-primary transition-colors"
                >
                  {label}
                  <span>{openSections.has(label) ? <Minus size={16} /> : <Plus size={16} />}</span>
                </button>
                {openSections.has(label) && (
                  <p className="text-sm text-text-muted pb-4 leading-relaxed">{content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Quantity + CTA */}
          {product.stock > 0 ? (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:text-primary transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold w-12 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:text-primary transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-full border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${added ? 'bg-green-50 border-green-500 text-green-600' : 'border-text-main hover:bg-primary hover:text-white hover:border-primary'}`}
                >
                  <ShoppingCart size={16} />
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
              <Link
                href="/checkout"
                onClick={handleAddToCart}
                className="btn-primary justify-center rounded-xl py-4 text-base"
              >
                Quick Buy
              </Link>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-text-muted text-sm font-medium">
              Out of Stock
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-6">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Rating Summary */}
          <div className="bg-cream rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-black">3.8</span>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                  <Star size={16} className="text-gray-300" />
                </div>
                <p className="text-xs text-text-muted">Based on reviews</p>
              </div>
            </div>
            {[5,4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs w-4">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: star === 5 ? '60%' : star === 4 ? '25%' : star === 3 ? '10%' : '3%' }} />
                </div>
              </div>
            ))}
          </div>
          {/* Review Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Leave us a review!</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Overall Rating*</label>
                <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-gray-300 cursor-pointer hover:text-yellow-400 transition-colors" />)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Review Title*</label>
                <input className="input-field" placeholder="Give your review a title" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Review*</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Write your review here" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Name*</label>
                  <input className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Email*</label>
                  <input className="input-field" type="email" />
                </div>
              </div>
              <button className="btn-primary">Submit <span className="ml-1">→</span></button>
            </div>
          </div>
        </div>
      </section>

      {/* You may also like */}
      {relatedProducts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-black mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Hear it from our customers (mini testimonials) */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-6">Hear it from our customers</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { text: '"Finally, a snack that doesn\'t make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger."', name: 'Sophia Maren', role: 'Director of Product' },
            { text: '"I\'ve tried so many healthy snack brands but Grainzz is on a different level. The peri peri oats chips are absolutely addictive!"', name: 'Rahul Sharma', role: 'Fitness Enthusiast' },
            { text: '"My kids love them which is a huge win! No more hiding spinach in their food. These grain puffs are our family\'s new favourite."', name: 'Priya Mehra', role: 'Mom of Two' },
          ].map((t, i) => (
            <div key={i} className="bg-cream rounded-2xl p-6">
              <p className="text-sm text-text-main italic leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">{t.name[0]}</div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
