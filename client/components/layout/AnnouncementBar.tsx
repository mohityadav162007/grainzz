'use client';
import { useState, useEffect, useRef } from 'react';

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(['Start this year with a healthy choice: Shipping PAN India 🇮🇳']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Reset index whenever messages list changes to prevent out-of-bounds rendering
  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(false);
  }, [messages]);

  useEffect(() => {
    if (messages.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;

    if (currentIndex === messages.length) {
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentIndex, messages.length]);

  const displayMessages = messages.length > 1 ? [...messages, messages[0]] : messages;

  return (
    <div className="block bg-brand-green text-white h-[36px] w-full text-[12px] md:text-[15px] font-medium leading-[132%] tracking-normal overflow-hidden relative">
      <div 
        className="flex h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning && messages.length > 1 ? 'transform 500ms ease-in-out' : 'none',
        }}
      >
        {displayMessages.map((msg, idx) => (
          <div key={idx} className="h-full flex items-center justify-center w-full px-4 text-center shrink-0">
            <span className="flex items-center gap-2">
              <span>{msg.replace(/🇮🇳/g, '').replace(/IN$/g, '').trim()}</span>
              {msg.includes('🇮🇳') && <span className="emoji-font text-[12px] md:text-[15px]">🇮🇳</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
