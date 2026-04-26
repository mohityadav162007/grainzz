'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getTestimonials } from '@/lib/api';

const fallbackTestimonials = [
  {
    text: 'Loved the flavour and crunch. It doesn\'t feel like regular oily chips at all. The Ragi Chips are my absolute favourite — spicy but not overwhelming. Will definitely reorder!',
    author: 'Aarav Mehta',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    text: 'Finally found a snack that\'s light but hits the flavour spot. Tandoori Masala puffed rice is my absolute favorite. Great for evening cravings without the guilt.',
    author: 'Priya S.',
    role: 'Health Enthusiast',
    rating: 5,
  },
  {
    text: 'A perfect way to try everything Grainzz has to offer. The starter box has become my go-to office snack. Love the variety and the fact that it comes with free puffed rice!',
    author: 'Rohan G.',
    role: 'Fitness Enthusiast',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    getTestimonials()
      .then((data) => { if (data.length > 0) setTestimonials(data); })
      .catch(() => {});
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-[40px] md:py-[80px] bg-white overflow-hidden w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <div className="grid md:grid-cols-2 gap-[40px] md:gap-[60px] lg:gap-[100px] items-stretch">
          
          {/* Featured Product Block */}
          <div className="bg-[#EEFBDC]/50 rounded-[24px] md:rounded-[32px] p-[24px] md:p-[32px] flex flex-col items-center justify-center min-h-[auto] md:min-h-[460px] relative group border border-brand-green/10">
            <div className="w-[140px] h-[200px] md:w-[180px] md:h-[240px] bg-gradient-to-br from-[#1D5E20] to-[#2d7a31] rounded-[24px] flex flex-col items-center justify-center text-white text-center shadow-xl mb-[24px] group-hover:scale-105 transition-transform duration-500 transform -rotate-2">
              <span className="text-[10px] font-bold tracking-[0.2em] opacity-80 mb-1 md:mb-2 text-center px-2">VITALICIOUS</span>
              <span className="font-sans text-[20px] md:text-[28px] font-black tracking-tight leading-none mt-2">GRAIN<span className="text-brand-yellow">ZZ</span></span>
              <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] bg-white/20 rounded-full mt-4 flex items-center justify-center shadow-inner" />
              <span className="text-[10px] md:text-[12px] mt-4 opacity-80 font-bold tracking-wider">OATS CHIPS</span>
            </div>
            
            <div className="flex flex-col items-center bg-white w-full max-w-[300px] md:max-w-none rounded-[16px] p-[16px] md:p-[20px] shadow-sm border border-[#E4E4E4] mx-auto text-center md:text-left">
               <h3 className="font-bold text-brand-black text-[16px] md:text-[18px]">Oats Chips – Peri Peri</h3>
               <p className="text-[12px] md:text-[14px] text-[#6B6B6B] mt-[4px]">High-Fibre | No Palm Oil | Baked</p>
               <div className="flex items-center gap-[8px] md:gap-[12px] mt-[12px]">
                 <span className="font-black text-[20px] md:text-[24px] text-brand-black">₹149</span>
                 <span className="text-[12px] md:text-[14px] text-[#8E8E8E] line-through font-medium">MRP ₹199</span>
               </div>
            </div>

            <div className="absolute top-[16px] left-[16px] md:top-[32px] md:left-[32px] bg-brand-red text-white text-[12px] md:text-[14px] font-bold px-[10px] py-[4px] md:px-[12px] md:py-[6px] rounded-[6px] shadow-sm z-10 transform origin-top-left group-hover:rotate-3 transition-transform">
               -25% Off
            </div>
          </div>

          {/* Testimonial carousel */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <h2 className="text-[16px] md:text-[20px] font-extrabold text-brand-green mb-[16px] md:mb-[24px] uppercase tracking-wider">
              Real Reviews
            </h2>
            <h3 className="text-[28px] md:text-[40px] font-bold text-brand-black leading-tight mb-[32px] md:mb-[40px]">
              What people are saying about Grainzz
            </h3>

            <div className="bg-brand-green rounded-[24px] md:rounded-[32px] p-[24px] md:p-[48px] flex-1 flex flex-col justify-between text-white shadow-[0_20px_40px_rgba(29,94,32,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-white opacity-5 rounded-full blur-[60px] md:blur-[80px]" />
              
              {/* Stars */}
              <div className="relative z-10 flex justify-center md:justify-start">
                <div className="flex gap-[4px] md:gap-[6px] mb-[20px] md:mb-[24px]">
                  {Array(testimonials[current].rating).fill(0).map((_, i) => (
                    <Star key={i} className="fill-brand-yellow text-brand-yellow w-5 h-5 md:w-6 md:h-6" strokeWidth={0} />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="relative z-10">
                <p className="text-[16px] md:text-[22px] font-medium leading-[1.6] mb-[32px] md:mb-[40px] min-h-[140px] md:min-h-[120px] text-center md:text-left" key={current}>
                  &ldquo;{testimonials[current].text}&rdquo;
                </p>
              </div>

              {/* Author & Controls */}
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-[24px] md:gap-[32px] mt-auto">
                <div className="flex items-center gap-[12px] md:gap-[16px]">
                  <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] bg-white/20 rounded-full flex items-center justify-center font-bold text-[16px] md:text-[20px] shadow-sm backdrop-blur-sm border border-white/20">
                    {testimonials[current].author[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-[16px] md:text-[18px] font-bold mb-[2px]">{testimonials[current].author}</p>
                    <p className="text-[12px] md:text-[14px] text-white/80 font-medium">{testimonials[current].role}</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-[12px]">
                   <button onClick={prev} className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all group backdrop-blur-sm">
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                   </button>
                   <button onClick={next} className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] bg-white text-brand-green hover:bg-brand-light hover:shadow-lg rounded-full flex items-center justify-center transition-all group">
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
