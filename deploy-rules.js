#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

// Check if Firebase CLI is installed
exec('firebase --version', (error, stdout, stderr) => {
  if (error) {
    console.log('Firebase CLI not found. Installing...');
    exec('npm install -g firebase-tools', (installError, installStdout, installStderr) => {
      if (installError) {
        console.error('Failed to install Firebase CLI:', installStderr);
        return;
      }
      console.log('Firebase CLI installed successfully');
      loginAndDeploy();
    });
  } else {
    console.log('Firebase CLI version:', stdout);
    loginAndDeploy();
  }
});

function loginAndDeploy() {
  // Check if we're already logged in
  exec('firebase projects:list', (listError, listStdout, listStderr) => {
    if (listError) {
      console.log('Not logged in to Firebase. Logging in...');
      exec('firebase login', (loginError, loginStdout, loginStderr) => {
        if (loginError) {
          console.error('Failed to login to Firebase:', loginStderr);
          return;
        }
        console.log('Logged in to Firebase successfully');
        deployRules();
      });
    } else {
      console.log('Already logged in to Firebase');
      deployRules();
    }
  });
}

function deployRules() {
  console.log('Deploying Firestore rules...');
  
  // Check if firestore.rules file exists
  if (!fs.existsSync('./firestore.rules')) {
    console.error('firestore.rules file not found');
    return;
  }
  
  // Deploy the rules
  exec('firebase deploy --only firestore:rules', (deployError, deployStdout, deployStderr) => {
    if (deployError) {
      console.error('Failed to deploy Firestore rules:', deployStderr);
      return;
    }
    console.log('Firestore rules deployed successfully');
    console.log(deployStdout);
  });
}