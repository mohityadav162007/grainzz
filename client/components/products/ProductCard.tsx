'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

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
  const { addItem } = useCartStore();
  const isOutOfStock = product.stock === 0;
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
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: 1,
      tags: product.tags,
    });
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
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
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

          {/* Veg Icon */}
          <div className="absolute top-[10px] right-[10px] w-[18px] h-[18px] bg-white rounded-[3px] flex items-center justify-center z-10 border border-[#E0E0E0]">
            <div className="w-[10px] h-[10px] border-[1.5px] border-green-600 rounded-[2px] flex items-center justify-center">
              <div className="w-[5px] h-[5px] bg-green-600 rounded-full" />
            </div>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
              <span className="text-[13px] font-semibold text-[#555] bg-white/90 px-[16px] py-[8px] rounded-full border border-[#E0E0E0] shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-[10px] right-[10px] w-[40px] h-[40px] bg-white text-brand-black rounded-full flex items-center justify-center
                hover:bg-brand-green hover:text-white transition-colors duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-90 z-10 border border-[#E8E8E8]"
              aria-label="Add to cart"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="pt-[12px] flex flex-col flex-grow">
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

          {/* Tag Badges */}
          <div className="flex items-center gap-[6px] mt-[8px]">
            {tagBadges.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-[#666] bg-[#F5F3EF] px-[8px] py-[3px] rounded-[4px]"
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
