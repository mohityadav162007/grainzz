import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qnptydpfzinhgacdmwmo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHR5ZHBmemluaGdhY2Rtd21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDI2NzUsImV4cCI6MjA5MjcxODY3NX0.iRYdzFJGAN0K1TBpAUlqR7fxL75E7xJVhnSG8yh-_Qo'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testReset() {
  const email = 'utkarzz1705@gmail.com'
  console.log(`Testing reset password for: ${email}`)
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/account',
  })
  
  if (error) {
    console.error('Error Details:', JSON.stringify(error, null, 2))
  } else {
    console.log('Success:', data)
  }
}

testReset()
