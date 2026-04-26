'use client';
import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import Image from 'next/image';
import { getInstagramPosts, getSiteContent } from '@/lib/api';

export default function InstagramSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [heading, setHeading] = useState('See How India is Snacking Better with Grainzz');
  const [handle, setHandle] = useState('@grainzzbyvitalicious');

  useEffect(() => {
    getInstagramPosts().then((data) => { if (data.length > 0) setPosts(data); }).catch(() => {});
    getSiteContent('instagram_section').then((content) => {
      if (content) {
        if (content.heading) setHeading(content.heading);
        if (content.handle) setHandle(content.handle);
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="section-title !text-left">{heading}</h2>
          <a
            href={`https://instagram.com/${handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs"
          >
            <Instagram size={14} /> {handle}
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <a
                key={post.id}
                href={post.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden hover:opacity-80 transition-opacity relative"
              >
                <Image
                  src={post.image_url}
                  alt="Instagram post"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              </a>
            ))
          ) : (
            // Placeholder grid when no posts
            Array(6).fill(null).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-cream rounded-xl overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Instagram size={24} className="text-gray-300" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
