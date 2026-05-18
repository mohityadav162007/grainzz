'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { animateFlyToCart } from '@/lib/animationUtils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  images: string[];
  category: string;
  stock: number;
  is_sale: boolean;
  discount_percent: number;
  tags: string[];
  subtitle?: string;
}

interface ProductCardProps {
  product: Product;
  centered?: boolean;
}

export default function ProductCard({ product, centered = false }: ProductCardProps) {
  const { addItem: addCartItem } = useCartStore();
  const { hasItem, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const isOutOfStock = product.stock === 0;
  const isWishlisted = hasItem(product.id);
  const discount = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Derive weight/type info from tags or category
  const tagBadges: string[] = [];
  if (product.category === 'Combos' || product.category === 'Gift Packs') {
    tagBadges.push('Combo');
  } else {
    tagBadges.push('Jar');
  }
  // Try to extract weight from tags
  const weightTag = product.tags?.find((t: string) => /\d+\s*g/i.test(t));
  if (weightTag) {
    tagBadges.push(weightTag);
  } else {
    tagBadges.push('150g');
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addCartItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: 1,
      tags: product.tags,
    });
    animateFlyToCart(e.currentTarget as HTMLElement, product.images?.[0]);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeWishlistItem(product.id);
    } else {
      addWishlistItem(product.id);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className={`h-full flex flex-col relative ${centered ? 'md:items-center' : ''}`}>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white w-full mb-4">
          <div className="absolute inset-0">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ShoppingCart size={36} className="text-gray-300" />
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-[#D31B22] text-white text-[11px] font-bold px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}

          {/* Veg Icon */}
          <div className="absolute top-3 right-3 w-[18px] h-[18px] border-[1.5px] border-[#1E8A38] rounded-[2px] flex items-center justify-center bg-white z-10">
            <div className="w-[7px] h-[7px] bg-[#1E8A38] rounded-full" />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
              <span className="text-[12px] uppercase font-bold text-gray-900 bg-white px-3 py-1.5 rounded-full shadow-sm tracking-wider">
                Sold Out
              </span>
            </div>
          )}

          {/* Bottom Right Scoop Button */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 right-0 z-20">
              {/* Inverted border radius scoop */}
              <div className="relative w-[48px] h-[48px] md:w-[60px] md:h-[60px] bg-white rounded-tl-[24px] md:rounded-tl-[30px] flex items-center justify-center">
                {/* Concave Blend Elements */}
                <div className="absolute -top-[20px] right-0 w-[20px] h-[20px] rounded-br-[20px] shadow-[10px_10px_0_10px_white] pointer-events-none" />
                <div className="absolute bottom-0 -left-[20px] w-[20px] h-[20px] rounded-br-[20px] shadow-[10px_10px_0_10px_white] pointer-events-none" />
                
                <button
                  onClick={handleAddToCart}
                  className="relative z-10 w-[36px] h-[36px] md:w-[44px] md:h-[44px] bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-black transition-all duration-200 active:scale-95"
                  aria-label="Add to cart"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`flex flex-col ${centered ? 'md:items-center md:text-center' : ''} ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
          {/* Tags */}
          <div className={`flex items-center gap-2 mb-3 ${centered ? 'md:justify-center' : ''}`}>
            {tagBadges.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] md:text-[14px] font-medium text-[#4A4A4A] bg-[#FEF3D0] px-3 py-1 rounded-[4px]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-[16px] md:text-[22px] font-bold text-[#1A1A1A] leading-tight mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="text-[12px] md:text-[14px] text-[#666666] font-medium mb-3 line-clamp-1">
              {product.subtitle}
            </p>
          )}

          {/* Price Row */}
          <div className={`flex items-baseline gap-2 ${centered ? 'md:justify-center' : ''}`}>
            <span className="text-[18px] md:text-[22px] font-bold text-[#1A1A1A]">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-[13px] md:text-[16px] text-[#999] font-medium">
                MRP <span className="line-through">₹{product.mrp}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
