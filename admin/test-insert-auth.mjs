import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnptydpfzinhgacdmwmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@grainzz.com',
    password: 'Grainzz@2026'
  });
  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  console.log('Logged in!');

  const { data, error } = await supabase
    .from('homepage_sections')
    .insert({ title: 'New Tab', section_type: 'custom', product_ids: [] })
    .select()
    .single();
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
