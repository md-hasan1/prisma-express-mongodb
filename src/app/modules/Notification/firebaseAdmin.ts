import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });

  console.log('Firebase Admin SDK initialized successfully!');
} catch (error: any) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
}

// Keeps the existing `admin.messaging()` call sites working with the modular API.
const admin = {
  messaging: () => getMessaging(),
};

export default admin;
