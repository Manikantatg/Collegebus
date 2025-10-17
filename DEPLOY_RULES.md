# Firebase Rules Deployment Instructions

## Problem
You're seeing the error: `Firebase Error: Listener Error: Missing or insufficient permissions.`

This occurs because the Firestore security rules haven't been deployed to your Firebase project, or there's a mismatch between the local rules and the deployed rules.

## Solution

### Option 1: Automated Deployment (Recommended)
Run the deployment script we created:

```bash
node deploy-rules.js
```

This script will:
1. Check if Firebase CLI is installed
2. Install it if needed
3. Log in to Firebase (if not already logged in)
4. Deploy the updated Firestore rules

### Option 2: Manual Deployment

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Verify Deployment

After deploying the rules, you can verify they're working by:

1. Visiting http://localhost:5173/rules-test.html
2. Checking the Firebase Console:
   - Go to your Firebase project
   - Navigate to Firestore Database → Rules
   - Verify the rules match what's in your `firestore.rules` file

## Updated Rules Explanation

The updated rules now explicitly allow:
- `create, read, update, delete` operations on the `busStates` collection
- `get, list` operations for real-time listeners
- `read` access to other collections
- Restrict `write` operations on other collections

## Troubleshooting

If you still see permission errors after deploying:

1. **Check Firebase Project ID**:
   Ensure the `projectId` in your Firebase config matches your actual Firebase project ID.

2. **Verify API Key**:
   Make sure your API key is correct and has the necessary permissions.

3. **Check Firebase Console**:
   Look at the Firebase Console logs for more detailed error information.

4. **Clear Browser Cache**:
   Sometimes cached data can cause issues. Try refreshing or using an incognito window.

## Need Help?

If you continue to have issues:
1. Share the exact error message from the Firebase Console
2. Verify your Firebase project settings
3. Check that you're using the correct project ID and API key