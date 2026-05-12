'use client';
import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import Image from 'next/image';
import { getInstagramPosts, getSiteContent } from '@/lib/api';

export default function InstagramSection() {
  const [posts, setPosts] = useState<any[] | null>(null); // null = loading
  const [heading, setHeading] = useState('Follow us on Instagram');
  const [handle, setHandle] = useState('grainzbyvitalicious');
  const [isActive, setIsActive] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    let cancelled = false;

    // Fetch all data in parallel
    Promise.all([
      getInstagramPosts().catch(() => []),
      getSiteContent('instagram_section').catch(() => null),
      getSiteContent('instagram_config').catch(() => null),
    ]).then(([reels, section, config]) => {
      if (cancelled) return;
      setPosts(reels && reels.length > 0 ? reels : []);
      if (section?.heading) setHeading(section.heading);
      if (section?.handle) setHandle(section.handle);
      setIsActive(config?.is_active !== false);
    });

    return () => { cancelled = true; };
  }, []);

  // Still loading — show nothing (prevents flash of default content)
  if (isActive === null || posts === null) {
    return (
      <section className="py-[40px] md:py-[60px] bg-white w-full overflow-hidden border-t border-[#f0f0f0]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="h-8 w-64 bg-gray-100 rounded-lg mb-[32px] animate-pulse" />
          <div className="flex gap-[16px] md:gap-[24px]">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex-shrink-0 w-[240px] md:w-1/5 aspect-[9/16] rounded-[20px] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Section disabled or no reels
  if (!isActive || posts.length === 0) return null;

  return (
    <section className="py-[40px] md:py-[60px] bg-white w-full overflow-hidden border-t border-[#f0f0f0]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-[24px] mb-[32px] md:mb-[40px]">
          <h2 className="text-[28px] md:text-[36px] font-bold text-brand-black leading-[1.2] tracking-tight font-sans text-center md:text-left">
            {heading}
          </h2>

          <a
            href={`https://instagram.com/${handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center justify-center gap-[12px] px-[24px] py-[12px] bg-[#111111] text-white rounded-full text-[16px] md:text-[17px] font-normal hover:bg-black transition-all group"
          >
            <Instagram size={26} strokeWidth={1.5} className="opacity-90" />
            <span className="leading-none tracking-tight">{handle.toLowerCase()}</span>
          </a>
        </div>

        {/* Reels Container — DB data ONLY */}
        <div className="w-full flex justify-center">
          <div className="flex w-full gap-[16px] md:gap-[24px] overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {posts.map((item, idx) => {
               const imageUrl = item.image_url;
               const postHref = item.post_url || `https://instagram.com/${handle.replace('@', '')}`;
               
               if (!imageUrl) return null;

               return (
                  <a
                    key={item.id || idx}
                    href={postHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[240px] md:w-1/5 aspect-[9/16] rounded-[16px] md:rounded-[20px] overflow-hidden relative block group shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-500 snap-center"
                  >
                    <Image
                      src={imageUrl}
                      alt="Grainzz Instagram Reel"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 70vw, 20vw"
                    />
                  </a>
               );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
}
