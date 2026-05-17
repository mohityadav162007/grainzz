import fs from 'fs';

// Filter process environment variables matching our required prefixes
const envKeys = Object.keys(process.env).filter((key) =>
  /^(SUPABASE_|NEXT_PUBLIC_|PHONEPE_)/.test(key)
);

// Map keys to their standard KEY=VALUE string format
const envContent = envKeys
  .map((key) => `${key}=${process.env[key]}`)
  .join('\n');

// Write the filtered environment variables to .env.production
try {
  fs.writeFileSync('.env.production', envContent);
  console.log('Successfully generated .env.production file.');
} catch (error) {
  console.error('Failed to write .env.production:', error);
  process.exit(1);
}
