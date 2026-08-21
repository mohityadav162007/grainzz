import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('blogs').select('id, title, content');
  const urls = [];
  data.forEach(b => {
    if (!b.content) return;
    const matches = b.content.match(/https?:\/\/[^\s)"]+/g);
    if (matches) {
      urls.push({ title: b.title, matches });
    }
  });
  console.log(JSON.stringify(urls, null, 2));
}

check();
