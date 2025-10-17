# How to Fix Firebase Permissions Error

## Problem
You're seeing the error: `Firebase Error: Listener Error: Missing or insufficient permissions.`

This happens because the Firestore security rules haven't been deployed to your Firebase project.

## Solution

### Step 1: Install Firebase CLI
We've already installed it with:
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
1. Run this command:
   ```bash
   firebase login --no-localhost
   ```

2. When prompted "Enable Gemini in Firebase features?", type `n` and press Enter

3. You'll see a URL. Copy it and open it in your browser

4. Sign in with your Google account that owns the Firebase project

5. Copy the authorization code and paste it back in the terminal

### Step 3: Deploy Firestore Rules

1. Navigate to your project directory:
   ```bash
   cd c:\Users\tgman\OneDrive\Desktop\Collegebus
   ```

2. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 4: Verify Deployment

1. Go to the Firebase Console: https://console.firebase.google.com/

2. Select your project: "bus-tracking-7706d"

3. Navigate to Firestore Database → Rules

4. Verify that the rules match this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access for busStates collection only with optimized real-time access
    match /busStates/{busId} {
      allow create, read, update, delete: if true;
      
      // Enable real-time listeners with optimized settings
      allow get, list: if true;
    }
    
    // Allow read access to other collections for public
    // but restrict write access
    match /{document=**} {
      allow get, list, read: if true;
      allow write, create, update, delete: if false;
    }
  }
}
```

## Alternative Solution: Manual Rule Update

If the deployment doesn't work, you can manually update the rules in the Firebase Console:

1. Go to https://console.firebase.google.com/

2. Select your project

3. Click "Firestore Database" in the left sidebar

4. Click the "Rules" tab

5. Replace the existing rules with the code above

6. Click "Publish"

## Test the Fix

After deploying the rules:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. The permission error should be gone

## Still Having Issues?

If you're still seeing permission errors:

1. Check that your Firebase project ID matches: "bus-tracking-7706d"

2. Verify your API key is correct in [firebase.ts](file:///c:/Users/tgman/OneDrive/Desktop/Collegebus/src/firebase.ts)

3. Make sure you're using the correct Google account that owns the Firebase project

4. Check the browser console for detailed error messages

## Need Help?

If you continue to have issues:
1. Share the exact error message from the browser console
2. Verify your Firebase project settings
3. Check that you're using the correct project ID and API key