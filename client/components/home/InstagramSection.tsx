import { Instagram } from 'lucide-react';
import Image from '@/components/ui/OptimizedImage';
import { getInstagramPosts, getSiteContent } from '@/lib/api';

interface InstagramSectionProps {
  initialPosts?: any[];
  initialSection?: any;
  initialConfig?: any;
}

export default function InstagramSection({ initialPosts, initialSection, initialConfig }: InstagramSectionProps) {
  const posts = initialPosts || [];
  const heading = initialSection?.heading || 'Follow us on Instagram';
  const handle = initialSection?.handle || 'grainzbyvitalicious';
  const isActive = initialConfig?.is_active !== false;

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

        {/* Reels Marquee — DB data ONLY */}
        <div className="w-full marquee-container group">
          <div 
            className="marquee-content flex gap-[16px] md:gap-[24px] py-4"
            style={{ animationDuration: '60s' }}
          >
            {[...posts, ...posts].map((item, idx) => {
               const imageUrl = item.image_url;
               const postHref = item.post_url || `https://instagram.com/${handle.replace('@', '')}`;
               
               if (!imageUrl) return null;

               return (
                  <a
                    key={`${item.id || idx}-${idx}`}
                    href={postHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[240px] md:w-[280px] aspect-[9/16] rounded-[16px] md:rounded-[20px] overflow-hidden relative block group/card shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-500"
                  >
                    <Image
                      src={imageUrl}
                      alt="Grainzz Instagram Reel"
                      fill
                      className="object-cover group-hover/card:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 240px, 280px"
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

