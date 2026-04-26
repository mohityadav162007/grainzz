'use client';
import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
  const [text, setText] = useState('Choose better snacking this season – now shipping PAN India 🇮🇳');

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
    <div className="bg-primary text-white text-center text-sm py-2 px-4 font-medium tracking-wide">
      {text}
    </div>
  );
}
