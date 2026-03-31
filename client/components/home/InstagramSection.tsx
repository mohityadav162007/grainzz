import { Instagram } from 'lucide-react';
import Link from 'next/link';

const posts = Array(6).fill(null);

export default function InstagramSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title !text-left">Follow us on Instagram</h2>
          <a
            href="https://instagram.com/grainzzvitalicious"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs"
          >
            <Instagram size={14} /> @grainzzvitalicious
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {posts.map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-cream rounded-xl overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Instagram size={24} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
