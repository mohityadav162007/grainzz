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
      <div className="h-full flex flex-col">

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#F5F3EF] w-full">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-[1.03]'}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F5F3EF]">
              <ShoppingCart size={36} className="text-[#D4D4D4]" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-[10px] left-[10px] bg-[#D32F2F] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[4px] z-10">
              -{discount}%
            </div>
          )}

          {/* Wishlist Icon */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-[8px] right-[36px] w-[28px] h-[28px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 hover:scale-110 hover:bg-white transition-all active:scale-95"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} strokeWidth={isWishlisted ? 0 : 2} className={isWishlisted ? 'fill-brand-red text-brand-red' : 'text-[#555]'} />
          </button>

          {/* Veg Icon */}
          <div className="absolute top-[8px] right-[8px] w-[20px] h-[20px] border-[1.5px] border-[#1E8A38] rounded-[3px] flex items-center justify-center bg-white z-10">
            <div className="w-[8px] h-[8px] bg-[#1E8A38] rounded-full" />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
              <span className="text-[14px] uppercase font-black text-brand-red bg-white/95 px-[16px] py-[8px] rounded-[6px] border border-brand-red/30 shadow-md tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add to Cart Button (Black Circle) */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-[10px] right-[10px] w-[36px] h-[36px] bg-[#1a1a1a] text-white rounded-full flex items-center justify-center
                hover:bg-black transition-all duration-200 shadow-lg active:scale-90 z-10"
              aria-label="Add to cart"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className={`pt-[12px] flex flex-col flex-grow ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
          <h3 className="text-[15px] lg:text-[16px] font-semibold text-brand-black leading-[1.35] group-hover:text-brand-green transition-colors line-clamp-2 tracking-[-0.01em]">
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="flex items-baseline gap-[8px] mt-[6px]">
            <span className="text-[17px] lg:text-[18px] font-bold text-brand-black">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-[13px] text-[#999] font-medium">
                MRP <span className="line-through">₹{product.mrp}</span>
              </span>
            )}
          </div>

          {/* Tag Badges (Premium Gold Style) */}
          <div className="flex items-center gap-[8px] mt-[10px]">
            {tagBadges.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-[#D89F43] bg-[#FDF7E7] px-[8px] py-[3px] rounded-[4px] uppercase tracking-wider shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </Link>
  );
}
