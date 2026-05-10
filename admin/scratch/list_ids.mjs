import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function listAllIds() {
  const { data, error } = await supabase.from('products').select('id, name');
  if (error) console.error(error);
  else {
    console.log('Total product IDs:', data.length);
    data.forEach(p => console.log(p.id, p.name));
  }
}

listAllIds();
