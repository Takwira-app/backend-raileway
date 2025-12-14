import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin SDK
// Make sure your service account JSON is in the root directory
const serviceAccountPath = path.join(
  process.cwd(),
  'firebase-service-account.json',
);

// Check if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://takwira-d30cb.firebaseio.com',
  });
}

export const auth = admin.auth;
export const database = admin.database;
export const firestore = admin.firestore;

export default admin;