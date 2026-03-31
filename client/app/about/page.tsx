import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us – Grainzz',
  description: 'Learn about Grainzz — India\'s premium healthy grain snacks brand built on real supergrains.',
};

const story = [
  {
    icon: '🌾',
    title: 'From Sidekick to Superhero',
    desc: 'Puffed rice has been a staple of Indian pantries. But it has always been hidden away as a "filler" to traditional preparations. Grainzz saw its hidden potential and gave this low-calorie grain deserved the spotlight.',
  },
  {
    icon: '🍲',
    title: 'Solving the Flavor Gap',
    desc: 'We noticed that when people made the leap towards puffed grains, they were bored of the plain. We created a bridge that gap with authentic Indian flavors.',
  },
  {
    icon: '✨',
    title: 'Redefining the "Crunch"',
    desc: 'We believe snacking shouldn\'t be a choice between a greasy bag of chips or a boring diet. By perfecting a roasted process, we created a snack that is fun, functional & 100% guilt-free.',
  },
];

const values = [
  { title: 'We are Bold', desc: 'We refuse to settle for bland flavors or traditional deep-frying methods. We are bold about what goes into our snacks.' },
  { title: 'We are Authentic', desc: 'We celebrate Indian roots. Our recipes are inspired by traditional grains that have powered generations.' },
  { title: 'We are Mindful', desc: 'Every ingredient, every process, every pack is thoughtfully designed for your health and the planet.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-orange-600 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">About Us</span>
            <p className="text-xs font-semibold bg-red-600 px-3 py-1 rounded-full mb-4 inline-block ml-2">Made in India with love ❤️</p>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              We are more than just a Snacking Brand
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-6">
              Get the power packed shakti of ragi, bajra and jowar now in snack form.
            </p>
            <Link href="/contact" className="bg-white text-primary font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 hover:bg-cream transition-colors text-sm">
              Contact Us <ArrowRight size={14} />
            </Link>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="text-9xl">🌾</div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="section-title mb-12">The Grainzz Story</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {story.map(({ icon, title, desc }) => (
              <div key={title} className="bg-cream rounded-2xl p-6">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-4">Meet The Founders</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              GRAINZZ was founded by Vibhor Kataria (Operations Specialist) and Rishee Puri (Branding & Marketing Strategist).
              Together, they are building India's next big healthy snacking brand: a homegrown company turning traditional puffed
              rice into a structured, premium snack category.
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              They believe every Indian deserves access to snacks that are bold, nutritious, and authentically Indian.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-white/10 rounded-3xl flex items-center justify-center text-7xl">
              👥
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="section-title mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ title, desc }, i) => (
              <div key={title} className={`rounded-3xl p-8 text-white flex flex-col justify-end min-h-[240px] relative overflow-hidden ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-orange-600' : 'bg-gray-800'}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative">
                  <h3 className="text-xl font-black mb-2">{title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
