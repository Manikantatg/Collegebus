# Firebase Deployment Instructions

## Security Rules

The Firestore security rules have been updated to allow public read/write access for the bus tracking application. This is suitable for development and testing, but you should consider implementing proper authentication for production.

### Current Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access for busStates collection only
    match /busStates/{busId} {
      allow read, write: if true;
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
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

## Domain Authorization

The OAuth domain authorization error indicates that your domain needs to be added to the Firebase Authentication settings:

1. Go to the Firebase Console
2. Navigate to Authentication -> Settings -> Authorized domains
3. Add your domain (e.g., kuclgbus.netlify.app) to the list

## Production Security Considerations

For production deployment, you should implement proper authentication and authorization:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write bus states
    match /busStates/{busId} {
      allow read, write: if request.auth != null;
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

You would also need to implement Firebase Authentication in your application.