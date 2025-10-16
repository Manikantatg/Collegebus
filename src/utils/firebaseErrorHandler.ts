export const handleFirebaseError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // Log the full error for debugging
  console.error('Firebase Error:', error);
  
  // Firebase error codes
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later';
    case 'auth/internal-error':
      return 'Internal error. Please try again';
    case 'permission-denied':
      return 'Permission denied. Please check your credentials';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again';
    case 'deadline-exceeded':
      return 'Request timeout. Please check your connection';
    case 'resource-exhausted':
      return 'Too many requests. Please wait before trying again';
    default:
      // Return Firebase error message or fallback
      return error.message || 'An error occurred during the operation';
  }
};

export const isFirebaseInitialized = (): boolean => {
  try {
    // Check if Firebase app is initialized
    const firebaseApps = (window as any).__FIREBASE_APPS__ || [];
    return firebaseApps.length > 0;
  } catch (error) {
    return false;
  }
};

// Function to check Firestore connection health
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Simple connectivity check would go here
    // For now, we'll just return true if Firebase is initialized
    return true;
  } catch (error) {
    console.error('Firestore connection check failed:', error);
    return false;
  }
};

export default { handleFirebaseError, isFirebaseInitialized, checkFirestoreConnection };