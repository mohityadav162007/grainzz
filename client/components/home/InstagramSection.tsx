'use client';
import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import Image from 'next/image';
import { getInstagramPosts, getSiteContent } from '@/lib/api';

const defaultReels = [
  { img: '/609216963-17861980689559678-5190492068987603702-n-1@2x.png', link: 'https://www.instagram.com/reel/DTApeL7Errf/' },
  { img: '/image-25@2x.png', link: 'https://www.instagram.com/reel/DS98mOKkZSI/' },
  { img: '/image-27@2x.png', link: 'https://www.instagram.com/reel/DQ1hoOXEkap/' },
  { img: '/image-24@2x.png', link: 'https://www.instagram.com/reel/DSpXmlXgZy-/' },
  { img: '/image-K6ajnEunSyn0dpLf3ZXfW4cvI1dCO3-1@2x.png', link: 'https://www.instagram.com/reel/DSFS4A4Eud5/' }
];

export default function InstagramSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [heading, setHeading] = useState('Follow us on Instagram');
  const [handle, setHandle] = useState('grainzbyvitalicious');

  useEffect(() => {
    getInstagramPosts().then((data) => { if (data && data.length > 0) setPosts(data); }).catch(() => {});
    getSiteContent('instagram_section').then((content) => {
      if (content) {
        if (content.heading) setHeading(content.heading);
        if (content.handle) setHandle(content.handle);
      }
    }).catch(() => {});
  }, []);

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
            className="flex flex-shrink-0 items-center justify-center gap-[10px] px-[28px] py-[14px] bg-[#1A1A1A] text-white rounded-full text-[15px] md:text-[16px] font-bold hover:bg-black transition-all group shadow-md"
          >
            <Instagram size={20} strokeWidth={2} />
            {handle}
          </a>
        </div>

        {/* Reels Container */}
        <div className="w-full flex justify-center">
          <div className="flex w-full gap-[16px] md:gap-[24px] overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {(posts.length > 0 ? posts.slice(0, 5) : defaultReels).map((item, idx) => {
               const imageUrl = item.img || item.image_url;
               const postHref = item.link || item.href || `https://instagram.com/${handle.replace('@', '')}`;
               
               return (
                  <a
                    key={idx}
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
