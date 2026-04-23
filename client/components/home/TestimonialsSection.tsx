'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    text: '"Finally, a snack that doesn\'t make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it\'s roasted and made from millets!"',
    author: 'Sophia Maren',
    role: 'Director of Product',
    rating: 5,
  },
  {
    text: '"I\'ve tried so many healthy snack brands but Grainzz is on a different level. The peri peri oats chips are absolutely addictive — in the best way possible!"',
    author: 'Rahul Sharma',
    role: 'Fitness Enthusiast',
    rating: 5,
  },
  {
    text: '"My kids love them which is a huge win! No more hiding spinach in their food. These grain puffs are our family\'s new favourite snack."',
    author: 'Priya Mehra',
    role: 'Mom of Two',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Product card */}
          <div className="bg-cream rounded-3xl p-6 flex flex-col items-center justify-center min-h-[360px] relative group">
            {/* Product visual */}
            <div className="w-36 h-48 bg-gradient-to-b from-green-400 to-green-600 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500">
              <span className="text-[8px] font-bold tracking-widest opacity-70">VITALICIOUS</span>
              <span className="font-brand text-lg font-black">GRAIN<span className="text-yellow-300">ZZ</span></span>
              <div className="w-12 h-12 bg-white/20 rounded-full mt-2" />
              <span className="text-[7px] mt-1 opacity-70">OATS CHIPS</span>
              <span className="text-[6px] opacity-50">Peri Peri</span>
            </div>
            <p className="font-bold text-text-main text-sm">Oats Chips – Peri Peri</p>
            <p className="text-xs text-text-muted">High-Fibre | No Palm Oil | Baked Crunch</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-black text-primary">₹149</span>
              <span className="text-text-muted line-through text-xs">MRP ₹199</span>
            </div>
            {/* Discount badge */}
            <div className="absolute top-4 left-4 badge-discount">-25%</div>
          </div>

          {/* Testimonial carousel */}
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-text-muted mb-4">What people are saying about Grainzz</h2>
            <div className="bg-primary rounded-2xl p-6 md:p-8 flex-1 flex flex-col justify-between text-white">
              {/* Stars */}
              <div>
                <div className="flex mb-4">
                  {Array(testimonials[current].rating).fill(0).map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm md:text-base leading-relaxed mb-6 opacity-95 min-h-[80px]" key={current}>
                  {testimonials[current].text}
                </p>
              </div>

              {/* Author */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                    {testimonials[current].author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{testimonials[current].author}</p>
                    <p className="text-xs text-white/60">{testimonials[current].role}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                          i === current ? 'bg-white text-primary border-white' : 'border-white/30 text-white/60 hover:border-white/60'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={prev} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={next} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
