import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function check() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Env vars missing');
    return;
  }
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Product columns:', Object.keys(data[0] || {}));
  }
}

check();
