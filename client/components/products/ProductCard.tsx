'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

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
}

export default function ProductCard({ product }: ProductCardProps) {
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
      <div className="h-full flex flex-col relative">

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-visible rounded-2xl bg-[#FFE8DF] w-full mb-4">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#FFE8DF]">
                <ShoppingCart size={36} className="text-[#D4D4D4]" />
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-[12px] left-[12px] bg-[#9A0000] text-white text-[12px] font-medium px-[10px] py-[3px] rounded-full z-10 tracking-wide">
              -{discount}%
            </div>
          )}

          {/* Veg Icon (Optional, can be hidden if not needed, kept for consistency) */}
          <div className="absolute top-[12px] right-[12px] w-[20px] h-[20px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10 shadow-sm">
            <div className="w-[8px] h-[8px] bg-[#1E8A38] rounded-full" />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20 rounded-2xl backdrop-blur-[1px]">
              <span className="text-[13px] uppercase font-black text-gray-800 bg-white/95 px-4 py-2 rounded-full shadow-sm tracking-wider">
                Sold Out
              </span>
            </div>
          )}

          {/* Floating Add to Cart Button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute -bottom-[12px] -right-[4px] md:-bottom-[16px] md:-right-[4px] w-[42px] h-[42px] md:w-[52px] md:h-[52px] bg-[#1a1a1a] text-white rounded-full flex items-center justify-center
                hover:bg-black transition-all duration-200 shadow-md active:scale-95 z-30 border-[4px] md:border-[6px] border-white"
              aria-label="Add to cart"
            >
              <Plus className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className={`flex flex-col flex-grow ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
          
          {/* Tags */}
          <div className="flex items-center gap-[6px] md:gap-[8px] mb-[6px] md:mb-[10px]">
            {tagBadges.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] md:text-[13px] font-medium text-[#4A4A4A] bg-[#FDF0CC] px-[8px] py-[3px] md:px-[12px] md:py-[4px] rounded-[4px] md:rounded-[6px]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-[15px] md:text-[20px] font-bold text-[#1A1A1A] leading-[1.25] md:leading-[1.3] group-hover:text-[#1a5b23] transition-colors mb-[2px] md:mb-[4px] pr-[16px] md:pr-[40px] tracking-tight min-h-[38px] md:min-h-0 line-clamp-2 md:line-clamp-none">
            {product.name}
          </h3>

          {/* Subtitle / Tagline */}
          {(product.subtitle || product.tags?.length > 0) && (
            <p className="text-[12px] md:text-[14px] text-[#7A7A7A] font-medium mb-[6px] md:mb-[8px] line-clamp-1">
              {product.subtitle || 'High-Fibre | No Palm Oil | Baked Crunch'}
            </p>
          )}

          {/* Price Row */}
          <div className="flex items-baseline gap-[6px] md:gap-[8px] mt-auto pt-[4px]">
            <span className="text-[16px] md:text-[20px] font-bold text-[#1A1A1A]">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-[12px] md:text-[14px] text-[#999] font-medium">
                MRP <span className="line-through">₹{product.mrp}</span>
              </span>
            )}
          </div>
          
        </div>

      </div>
    </Link>
  );
}
