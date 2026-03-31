'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Plus, Minus, ShoppingCart, Star, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { getProductBySlug } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug as string)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      _id: product._id,
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
            {[
              { label: 'Description', content: product.description },
              { label: 'Nutrition breakdown', content: product.nutritionInfo },
              { label: 'Ingredients', content: product.ingredients },
            ].map(({ label, content }) => content && (
              <div key={label} className="border-b border-gray-100">
                <button
                  onClick={() => setDescOpen(descOpen ? false : true)}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold hover:text-primary transition-colors"
                >
                  {label}
                  <span>{descOpen ? <Minus size={16} /> : <Plus size={16} />}</span>
                </button>
                {descOpen && (
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

      {/* Customer Reviews placeholder */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-6">Customer Reviews</h2>
        <div className="bg-cream rounded-2xl p-6 text-center text-text-muted">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </section>
    </div>
  );
}
