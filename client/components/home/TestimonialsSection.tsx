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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Product image placeholder */}
          <div className="bg-cream rounded-3xl p-8 flex items-center justify-center min-h-[280px]">
            <div className="text-center">
              <div className="text-7xl mb-3">🌾</div>
              <p className="font-bold text-primary">Oats Chips – Peri Peri</p>
              <p className="text-text-muted text-sm">₹149 MRP ₹199</p>
            </div>
          </div>

          {/* Testimonial carousel */}
          <div>
            <h2 className="text-xl font-bold text-text-muted mb-6">What people are saying about Grainzz</h2>
            <div className="bg-cream rounded-2xl p-6 relative">
              <div className="flex mb-3">
                {Array(testimonials[current].rating).fill(0).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-text-main leading-relaxed mb-6 italic">
                {testimonials[current].text}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {testimonials[current].author[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{testimonials[current].author}</p>
                  <p className="text-xs text-text-muted">{testimonials[current].role}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 mt-4">
                <button onClick={prev} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={next} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <ChevronRight size={14} />
                </button>
                <div className="flex gap-1 ml-2">
                  {testimonials.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-4' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
