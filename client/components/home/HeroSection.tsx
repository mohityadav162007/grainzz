'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #c8561a 0%, #d97706 30%, #b45309 60%, #7c2d12 100%)' }}
    >
      {/* Background overlay pattern */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 w-full grid md:grid-cols-2 gap-8 items-center py-16">
        {/* Text content */}
        <div className="text-white z-10">
          <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            Upto 40% OFF
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
            Power of Real Grainz<br />
            <span className="text-yellow-200">for better gainzz.</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-md">
            Get the power packed shakti of ragi, bajra and jowar now in snack form.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-cream transition-colors flex items-center gap-2 text-sm"
            >
              Buy Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="border border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-80 h-80">
            <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute inset-8 bg-white/5 rounded-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-2">🥜</div>
                <p className="text-lg font-bold">Grain Snacks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
