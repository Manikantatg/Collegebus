# Deployment Instructions

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:5173` in your browser

## Netlify Deployment

### Prerequisites
1. Firebase security rules must be deployed
2. Netlify domain must be authorized in Firebase

### Deployment Steps

1. **Deploy Firebase Security Rules**:
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

2. **Authorize Netlify Domain in Firebase**:
   - Go to Firebase Console → Authentication → Settings
   - Add your Netlify domain to "Authorized domains"

3. **Set Environment Variables in Netlify**:
   Go to your Netlify site settings → Build & deploy → Environment and add:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCGvaYH_zL-vefP4Bm83MdDn9DXAlCDiGk
   VITE_FIREBASE_AUTH_DOMAIN=bus-tracking-7706d.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=bus-tracking-7706d
   VITE_FIREBASE_STORAGE_BUCKET=bus-tracking-7706d.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=217343122092
   VITE_FIREBASE_APP_ID=1:217343122092:web:15338fb293406602689d09
   ```

4. **Deploy to Netlify**:
   - Push your code to your Git repository
   - Netlify will automatically build and deploy your site

## Firebase Security Rules

The application requires the following Firestore rules to be deployed:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access for busStates collection only
    match /busStates/{busId} {
      allow create, read, update, delete: if true;
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

## Troubleshooting

### Real-time Updates Not Working
1. Verify Firebase rules are deployed
2. Check browser console for errors
3. Ensure both dashboards are using the same bus ID
4. Confirm the driver is actually clicking "Done" at stops

### Data Not Saving to Database
1. Check Firebase Authentication domain authorization
2. Verify environment variables are set correctly
3. Check network tab in browser dev tools for failed requests

### Permission Errors
1. Re-deploy Firebase security rules
2. Verify your Google account has proper permissions on the Firebase project
3. Check that the API key is correct

## Testing Real-time Functionality

1. Open two browser windows
2. In one window, navigate to the driver dashboard: `/driver-login`
3. In the other window, navigate to the student dashboard: `/`
4. Select the same bus in both dashboards
5. As the driver, click "Done" at stops
6. Verify the student dashboard updates immediately

## Need Help?

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Verify your Firebase project settings match the configuration
3. Ensure your Netlify build is successful
4. Confirm that your Firebase rules are deployed

You can also visit `/firebase-debug.html` on your deployed site to test Firebase connectivity.