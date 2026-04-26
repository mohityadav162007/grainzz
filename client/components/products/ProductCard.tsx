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
      <div className="bg-[#FFFFFF] rounded-[24px] overflow-hidden border border-[#E4E4E4] h-full flex flex-col hover:border-brand-green/30 hover:shadow-[0_12px_24px_rgba(29,94,32,0.06)] transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[#F7F7F7] w-full p-6">
          {product.images?.[0] ? (
            <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-white shadow-sm border border-black/5">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-[16px]">
              <ShoppingCart size={40} className="text-[#E4E4E4]" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-[32px] left-[32px] bg-brand-red text-white text-[12px] font-bold px-[8px] py-[4px] rounded-[6px] shadow-sm z-10 transition-transform hover:scale-105">
              -{discount}%
            </div>
          )}

          {/* Veg Icon Wrapper */}
          <div className="absolute top-[32px] right-[32px] bg-white rounded-md p-1 shadow-sm z-10">
            <div className="w-4 h-4 border-[1.5px] border-green-600 rounded-[2px] flex items-center justify-center bg-white">
              <div className="w-[6px] h-[6px] bg-green-600 rounded-full" />
            </div>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 backdrop-blur-[2px]">
              <span className="text-[14px] font-bold text-[#6B6B6B] bg-white px-4 py-2 rounded-full border border-[#E4E4E4] shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add Button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-[32px] right-[32px] w-[50px] h-[50px] bg-white text-brand-green border border-[#E4E4E4] rounded-full flex items-center justify-center
                hover:bg-brand-green hover:text-white hover:border-brand-green transition-colors duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-95 z-10"
              aria-label="Add to cart"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-[20px] flex flex-col gap-2 flex-grow justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-brand-black leading-[1.3] group-hover:text-brand-green transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-[6px] mt-[10px]">
                {product.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-brand-light text-brand-green text-[10px] uppercase tracking-wider font-bold px-[8px] py-[4px] rounded-[4px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col mt-3">
            <div className="flex items-center gap-[8px]">
              <span className="text-[22px] font-black text-brand-black">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[14px] text-[#8E8E8E] font-medium line-through decoration-1">₹{product.mrp}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
