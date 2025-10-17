#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const { existsSync, readFileSync } = require('fs');

const execPromise = promisify(exec);

async function verifyFirebaseSetup() {
  console.log('Verifying Firebase setup...');
  
  try {
    // Check if Firebase CLI is available
    const version = await execPromise('firebase --version');
    console.log('Firebase CLI version:', version.stdout.trim());
  } catch (error) {
    console.error('Firebase CLI not found. Please install it with: npm install -g firebase-tools');
    return;
  }
  
  try {
    // Check if logged in
    const projects = await execPromise('firebase projects:list');
    console.log('Firebase login status: OK');
  } catch (error) {
    console.error('Not logged in to Firebase. Please run: firebase login');
    return;
  }
  
  // Check if firestore.rules file exists
  if (!existsSync('./firestore.rules')) {
    console.error('firestore.rules file not found');
    return;
  }
  
  console.log('Firestore rules file found. Content:');
  const rulesContent = readFileSync('./firestore.rules', 'utf8');
  console.log(rulesContent);
  
  console.log('\nTo deploy these rules, run:');
  console.log('firebase deploy --only firestore:rules');
}

verifyFirebaseSetup();