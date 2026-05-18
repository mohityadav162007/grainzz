'use client';
import { useState, useEffect, useRef } from 'react';

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(['Start this year with a healthy choice: Shipping PAN India 🇮🇳']);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'announcement_bar')
          .single();
          
        let parsedValue = data?.value;
        if (typeof parsedValue === 'string') {
          try {
            parsedValue = JSON.parse(parsedValue);
          } catch (e) {}
        }
          
        if (parsedValue?.messages && Array.isArray(parsedValue.messages) && parsedValue.messages.filter((m: string) => m.trim() !== '').length > 0) {
          setMessages(parsedValue.messages.filter((m: string) => m.trim() !== ''));
        } else if (parsedValue?.text) {
          setMessages([parsedValue.text]);
        }
      } catch (e) {
        console.error('Error fetching announcement:', e);
      }
    };
    fetchAnnouncement();
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const isMultiple = messages.length > 1;

  // Build a repeated list to ensure it spans wider than the screen
  const repeatedList: string[] = [];
  if (isMultiple) {
    const targetCount = 6;
    const multiplier = Math.ceil(targetCount / messages.length);
    for (let i = 0; i < multiplier; i++) {
      repeatedList.push(...messages);
    }
  }

  // To make a mathematically seamless marquee loop, we double the repeated list
  const displayItems = isMultiple ? [...repeatedList, ...repeatedList] : messages;

  // Smart Mobile Interaction: Pause for 5 seconds on touch/click, then automatically resume
  const handleTouch = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Standard Desktop Hover Pause
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
  };

  return (
    <div className="block bg-brand-green text-white h-[36px] w-full text-[12px] md:text-[14px] font-medium leading-[132%] tracking-normal overflow-hidden relative select-none">
      {isMultiple && (
        <style>{`
          @keyframes marquee {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-50%, 0, 0);
            }
          }
          .marquee-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: marquee 25s linear infinite;
          }
        `}</style>
      )}
      
      <div className="h-full flex items-center justify-center">
        {isMultiple ? (
          <div 
            className="marquee-track cursor-pointer"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouch}
          >
            {displayItems.map((msg, idx) => (
              <div key={idx} className="flex items-center gap-6 px-4 whitespace-nowrap shrink-0">
                <span className="flex items-center gap-2">
                  <span>{msg.replace(/🇮🇳/g, '').replace(/IN$/g, '').trim()}</span>
                  {msg.includes('🇮🇳') && <span className="emoji-font text-[12px] md:text-[14px]">🇮🇳</span>}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          // Premium Centered Static Single Announcement
          <div className="h-full flex items-center justify-center px-4 text-center">
            <span className="flex items-center gap-2">
              <span>{messages[0].replace(/🇮🇳/g, '').replace(/IN$/g, '').trim()}</span>
              {messages[0].includes('🇮🇳') && <span className="emoji-font text-[12px] md:text-[14px]">🇮🇳</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
