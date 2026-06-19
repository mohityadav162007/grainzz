import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnptydpfzinhgacdmwmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('Querying products...');
  const { data, error } = await supabase.from('products').select('id, name, slug, images').limit(5);
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Products:', JSON.stringify(data, null, 2));
}

checkProducts();
