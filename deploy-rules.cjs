#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execPromise = promisify(exec);

// Check if Firebase CLI is installed
async function checkAndInstallFirebaseCLI() {
  try {
    const { stdout } = await execPromise('firebase --version');
    console.log('Firebase CLI version:', stdout);
    return true;
  } catch (error) {
    console.log('Firebase CLI not found. Installing...');
    try {
      await execPromise('npm install -g firebase-tools');
      console.log('Firebase CLI installed successfully');
      return true;
    } catch (installError) {
      console.error('Failed to install Firebase CLI:', installError);
      return false;
    }
  }
}

async function loginAndDeploy() {
  const isCLIAvailable = await checkAndInstallFirebaseCLI();
  if (!isCLIAvailable) {
    console.error('Firebase CLI is required for deployment');
    return;
  }

  try {
    // Check if we're already logged in
    await execPromise('firebase projects:list');
    console.log('Already logged in to Firebase');
    await deployRules();
  } catch (error) {
    console.log('Not logged in to Firebase. Logging in...');
    try {
      await execPromise('firebase login');
      console.log('Logged in to Firebase successfully');
      await deployRules();
    } catch (loginError) {
      console.error('Failed to login to Firebase:', loginError);
    }
  }
}

async function deployRules() {
  console.log('Deploying Firestore rules...');
  
  // Check if firestore.rules file exists
  if (!fs.existsSync('./firestore.rules')) {
    console.error('firestore.rules file not found');
    return;
  }
  
  try {
    const { stdout } = await execPromise('firebase deploy --only firestore:rules');
    console.log('Firestore rules deployed successfully');
    console.log(stdout);
  } catch (deployError) {
    console.error('Failed to deploy Firestore rules:', deployError);
  }
}

// Run the deployment process
loginAndDeploy();