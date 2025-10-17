#!/usr/bin/env node

// Check if required environment variables are set
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('Checking environment variables...');

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('\n⚠️  Warning: The following environment variables are missing:');
  missingEnvVars.forEach(envVar => console.warn(`  - ${envVar}`));
  console.warn('\nUsing default Firebase configuration. For production, please set these variables.');
} else {
  console.log('\n✅ All required environment variables are set.');
}

// Also check if we're in a Netlify build environment
if (process.env.NETLIFY) {
  console.log('\n🌐 Netlify environment detected.');
} else {
  console.log('\n💻 Local development environment detected.');
}