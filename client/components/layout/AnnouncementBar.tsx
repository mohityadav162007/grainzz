'use client';
import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
  const [text, setText] = useState('Start this year with a healthy choice: Shipping PAN India 🇮🇳');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('site_content')
          .select('value')
          .eq('key', 'announcement_bar')
          .single();
        if (data?.value?.text) setText(data.value.text);
      } catch {}
    };
    fetchAnnouncement();
  }, []);

  return (
    <div className="hidden md:flex bg-brand-green text-white items-center justify-center h-[44px] px-4 md:px-[80px] w-full text-[18px] font-medium leading-[132%] tracking-normal">
      {text}
    </div>
  );
}
