// ============================================
// firebase-admin.config.ts
// ============================================
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = require('../path-to-your-firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://takwira-d30cb.firebaseio.com', // Optional for Realtime DB
});

export const auth = admin.auth;
export const firestore = admin.firestore;
export const database = admin.database; // For realtime chat