import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnptydpfzinhgacdmwmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpSettings() {
  console.log('Querying store_settings keys...');
  const { data, error } = await supabase.from('store_settings').select('key');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Keys:', data.map(d => d.key));
}

dumpSettings();
