import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'client/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSettings() {
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }
  console.log('Current Settings:', JSON.stringify(data, null, 2));
}

checkSettings();
