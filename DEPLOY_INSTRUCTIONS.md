# Firebase Rules Deployment Instructions

Since Firebase CLI is not installed or not in your PATH, here's how to deploy the Firestore rules manually:

## Method 1: Using Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "bus-tracking-7706d"
3. Navigate to Firestore Database → Rules
4. Replace the existing rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access for busStates collection only
    match /busStates/{busId} {
      allow read, write: if true;
    }
    
    // Allow read access to other collections for public
    // but restrict write access
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

5. Click "Publish"

## Method 2: Install Firebase CLI and Deploy

1. Install Node.js if not already installed
2. Install Firebase CLI globally:
   ```
   npm install -g firebase-tools
   ```

3. Login to Firebase:
   ```
   firebase login
   ```

4. Navigate to your project directory:
   ```
   cd c:\Users\tgman\OneDrive\Desktop\Collegebus
   ```

5. Deploy the rules:
   ```
   firebase deploy --only firestore:rules
   ```

## After Deployment

After deploying the rules:
1. Refresh your application
2. The Firebase errors should be resolved
3. The student dashboard should now update in real-time

## For Production Use

For production, you should implement proper authentication and update the rules to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write bus states
    match /busStates/{busId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read access to other collections for authenticated users
    // but restrict write access
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```