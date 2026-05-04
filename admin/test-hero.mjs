import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnptydpfzinhgacdmwmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
);

async function run() {
  console.log("Fetching hero slides...");
  const { data: fetch, error: fetchErr } = await supabase.from('hero_slides').select('*');
  console.log("Fetch:", fetch, "Err:", fetchErr);
}

run();
