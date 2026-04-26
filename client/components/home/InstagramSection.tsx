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
    <section className="py-[80px] bg-white border-y border-[#E4E4E4]/50 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-[48px] gap-[24px]">
          <h2 className="text-[32px] md:text-[40px] font-bold text-brand-black leading-tight max-w-[600px]">
            {heading}
          </h2>
          <a
            href={`https://instagram.com/${handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[10px] px-[28px] py-[14px] bg-white border-2 border-[#E4E4E4] rounded-full text-[16px] font-bold text-brand-black hover:border-brand-green hover:text-brand-green shadow-sm hover:shadow-md transition-all group"
          >
            <Instagram size={20} className="text-brand-green group-hover:scale-110 transition-transform" /> 
            {handle}
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px] md:gap-[24px]">
          {posts.length > 0 ? (
            posts.slice(0, 6).map((post) => (
              <a
                key={post.id}
                href={post.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-[20px] overflow-hidden hover:opacity-90 hover:shadow-xl transition-all relative block group"
              >
                <Image
                  src={post.image_url}
                  alt="Instagram post"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Instagram size={32} className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
                </div>
              </a>
            ))
          ) : (
            // Placeholder grid when no posts
            Array(6).fill(null).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-[#F7F7F7] rounded-[20px] overflow-hidden flex items-center justify-center hover:bg-brand-light transition-colors cursor-pointer border border-[#E4E4E4]"
              >
                <Instagram size={32} className="text-[#C4C4C4]" />
              </div>
            ))
          )}
        </div>
        
      </div>
    </section>
  );
}
