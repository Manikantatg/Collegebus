# Firebase Deployment Instructions

## Security Rules

The Firestore security rules have been updated to allow public read/write access for the bus tracking application. This is suitable for development and testing, but you should consider implementing proper authentication for production.

### Current Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access for busStates collection
    match /busStates/{document} {
      allow read, write: if true;
    }
    
    // Allow public read/write access for any other collections used
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Deploying Security Rules

To deploy these security rules to your Firebase project, follow these steps:

1. Install the Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to your Firebase account:
   ```bash
   firebase login
   ```

3. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Production Security Considerations

For production deployment, you should implement proper authentication and authorization:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write bus states
    match /busStates/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Only authenticated users can read/write any document
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

You would also need to implement Firebase Authentication in your application.