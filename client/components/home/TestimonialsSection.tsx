'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { getTestimonials } from '@/lib/api';

const fallbackTestimonials = [
  {
    text: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    author: 'Sophia Maren',
    role: 'Director of Product',
    rating: 5,
  },
  {
    text: "Loved the flavour and crunch. It doesn't feel like regular oily chips at all. The Ragi Chips are my absolute favourite — spicy but not overwhelming.",
    author: 'Aarav Mehta',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    text: "A perfect way to try everything Grainzz has to offer. The starter box has become my go-to office snack. Love the variety!",
    author: 'Rohan G.',
    role: 'Verified Buyer',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getTestimonials()
      .then((data) => { if (data && data.length > 0) setTestimonials(data); })
      .catch(() => {});
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex] || fallbackTestimonials[0];

  return (
    <section className="w-full flex flex-col md:flex-row min-h-[600px] bg-white">
      {/* Left Column (Kitchen BG + Floating Card) */}
      <div className="w-full md:w-[45%] relative bg-[#f4f2eb] flex items-center justify-center py-20 px-4 md:px-10 overflow-hidden">
        {/* Placeholder blurred background pattern for kitchen since we lack actual image asset */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-[#E6E0D4] blur-[4px]"
          style={{ backgroundImage: 'linear-gradient(120deg, rgba(230,224,212,0.8) 0%, rgba(200,185,165,0.8) 100%)' }}
        />
        
        {/* Floating Product Card */}
        <div className="relative z-10 w-[302px] bg-white rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.12)] flex flex-col items-center p-[16px] text-left font-sans transform hover:-translate-y-2 transition-transform duration-500">
          <div className="w-[270px] h-[280px] bg-[#FDEAE3] rounded-[16px] relative flex items-center justify-center p-4 mb-2">
            
            <div className="absolute top-4 left-4 rounded-full bg-[#E51624] flex items-center justify-center py-1 px-3 z-20 text-white text-[11px] font-bold shadow-sm">
              -25%
            </div>
            
            <Image
              className="h-[90%] w-auto object-contain z-10 drop-shadow-2xl"
              width={200}
              height={260}
              alt="Oats Chips"
              src="/Rectangle-10@2x.png" 
            />

            {/* Black + Button overlapping the boundary */}
            <div className="absolute -bottom-[18px] right-[10px] z-20 w-[42px] h-[42px] rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white text-[28px] font-light mb-[2px] ml-[1px] leading-none">+</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start w-full px-2 pb-2 mt-5">
            <div className="flex items-center gap-[10px] text-[12px] font-semibold text-[#444] mb-3">
              <span className="bg-[#FFEFC2] px-[12px] py-[4px] rounded-[6px]">Jar</span>
              <span className="bg-[#FFEFC2] px-[12px] py-[4px] rounded-[6px]">150g</span>
            </div>
            <h2 className="text-[19px] leading-[1.3] font-bold text-[#1A1A1A] mb-[4px] tracking-tight">
              Oats Chips – Peri Peri
            </h2>
            <p className="text-[13px] text-[#888888] font-medium mb-4">
              High-Fibre | No Palm Oil | Baked Crunch
            </p>
            <div className="flex items-center gap-[10px]">
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">₹149</h2>
              <span className="text-[13px] line-through text-[#999999] font-medium pt-1">MRP ₹199</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Testimonial Carousel) */}
      <div className="w-full md:w-[55%] flex flex-col justify-center bg-[#EEFCD3] p-10 md:p-[80px] lg:p-[100px] relative">
        <div className="max-w-[640px]">
          <h4 className="text-[15px] font-semibold text-[#444444] mb-[60px]">
            What people are saying about Grainz
          </h4>
          
          <div className="flex flex-col">
            <div className="min-h-[200px] md:min-h-[240px] lg:min-h-[280px]">
              <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] leading-[1.4] tracking-tight mb-8">
                "{current.text}"
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-[56px] h-[56px] rounded-full bg-white overflow-hidden flex items-center justify-center text-brand-green font-bold text-2xl shadow-sm border border-[#D5EFA5]">
                {/* Fallback to Initials */}
                <span className="opacity-80">{current.author[0]}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-bold text-[#1A1A1A]">{current.author}</span>
                <span className="text-[14px] text-[#666666] font-medium">{current.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-[60px]">
            <button onClick={prevSlide} className="w-[32px] h-[32px] flex items-center justify-center text-[#888888] hover:text-[#222222] transition-colors">
              <ChevronLeft size={24} strokeWidth={2}/>
            </button>
            
            <div className="flex items-center gap-[6px]">
              {testimonials.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-[6px] rounded-full cursor-pointer transition-all duration-300 ${idx === currentIndex ? 'w-[28px] bg-[#1E5E28]' : 'w-[6px] bg-[#D4E8B7] hover:bg-[#B3D493]'}`}
                />
              ))}
            </div>

            <button onClick={nextSlide} className="w-[32px] h-[32px] flex items-center justify-center text-[#888888] hover:text-[#222222] transition-colors">
              <ChevronRight size={24} strokeWidth={2}/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
