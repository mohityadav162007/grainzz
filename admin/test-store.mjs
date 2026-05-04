import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnptydpfzinhgacdmwmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
);

async function run() {
  const { data, error } = await supabase.from('store_settings').select('*');
  console.log("Store Settings:", data, "Err:", error);
}

run();
