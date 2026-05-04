import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnptydpfzinhgacdmwmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
);

async function run() {
  const tabs = [
    { title: 'Bestsellers', product_ids: ['b0213901-afd9-4fea-8469-d4fa224656cc'] },
    { title: 'Jar Combos', product_ids: [] },
    { title: 'Puffed Rice Combos', product_ids: [] },
    { title: 'Shop All Jars', product_ids: [] },
  ];
  const { data, error } = await supabase.from('store_settings').insert({ key: 'product_tabs_json', value: JSON.stringify(tabs) });
  console.log(error);
}
run();
