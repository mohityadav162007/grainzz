import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnptydpfzinhgacdmwmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
);

async function run() {
  const { data } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', 'announcement_bar');
  console.log('Current data:', data);

  if (data && data.length > 0) {
    const text = data[0].value.text;
    const newText = text.replace('IN', '🇮🇳');
    console.log('New text:', newText);
    
    // Actually we need service_role key to update, anon key might not have RLS permission to update site_content.
    // Let me check if anon has update permissions.
  }
}

run();
