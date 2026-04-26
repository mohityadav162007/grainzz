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
      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col hover:shadow-[0_12px_24px_rgba(29,94,32,0.12)] transition-shadow duration-300">
        
        {/* Image Container */}
        <div className="relative border-b border-gray-100 aspect-square overflow-hidden bg-[#F7F7F7] w-full p-2 lg:p-4">
          {product.images?.[0] ? (
            <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-[#F7F7F7] mix-blend-multiply border border-black/5">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-[1.05] transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F7F7F7] rounded-[12px]">
              <ShoppingCart size={40} className="text-[#E4E4E4]" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-[16px] left-[16px] bg-brand-red text-white text-[12px] font-bold px-[8px] py-[4px] rounded-[4px] shadow-sm z-10 tracking-wide">
              -{discount}%
            </div>
          )}

          {/* Veg Icon */}
          <div className="absolute top-[16px] right-[16px] w-[20px] h-[20px] bg-white rounded-full flex items-center justify-center shadow-sm z-10">
            <div className="w-[12px] h-[12px] border-[1.5px] border-green-600 rounded-[2px] flex items-center justify-center">
              <div className="w-[6px] h-[6px] bg-green-600 rounded-full" />
            </div>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 backdrop-blur-[2px]">
              <span className="text-[14px] font-bold text-[#6B6B6B] bg-white px-4 py-2 rounded-full border border-[#E4E4E4] shadow-sm uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add Button overlapping the bottom right of the image block */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-[16px] right-[16px] w-[44px] h-[44px] bg-white text-brand-green rounded-full flex items-center justify-center
                hover:bg-brand-green hover:text-white transition-colors duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 z-30"
              aria-label="Add to cart"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-[16px] flex flex-col justify-between flex-grow bg-white">
          <div className="flex flex-col gap-1 mt-1">
            <h3 className="text-[16px] lg:text-[18px] font-bold text-brand-black leading-[1.3] group-hover:text-brand-green transition-colors line-clamp-2 font-sans tracking-tight">
              {product.name}
            </h3>
            <p className="text-[13px] text-[#666666] font-medium font-sans">
              Jar | 150g
            </p>
          </div>

          <div className="flex flex-col mt-4 mb-1">
            <div className="flex items-center gap-[8px]">
              <span className="text-[18px] lg:text-[20px] font-bold text-brand-black font-sans">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[13px] lg:text-[14px] text-[#8E8E8E] font-medium line-through font-sans">MRP ₹{product.mrp}</span>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
}
