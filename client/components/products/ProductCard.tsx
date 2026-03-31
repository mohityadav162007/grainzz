'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  images: string[];
  category: string;
  stock: number;
  isSale: boolean;
  discountPercent: number;
  tags: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const isOutOfStock = product.stock === 0;
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0] || '/placeholder.jpg',
      quantity: 1,
      tags: product.tags,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden card-shadow border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <div className="absolute top-3 left-3 badge-discount">-{discount}%</div>
          )}

          {/* Veg Icon */}
          <div className="absolute top-3 right-3 w-6 h-6 border-2 border-green-600 rounded flex items-center justify-center bg-white">
            <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-text-muted bg-white px-3 py-1 rounded-full border">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add Button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 w-10 h-10 bg-text-main text-white rounded-full flex items-center justify-center
                hover:bg-primary transition-colors duration-200 shadow-md active:scale-90"
              aria-label="Add to cart"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-1 flex-1">
          <h3 className="text-sm font-semibold text-text-main leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-primary">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-text-muted line-through">MRP ₹{product.mrp}</span>
            )}
          </div>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
