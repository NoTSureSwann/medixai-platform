import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    });
  } catch (error) {
    console.warn('[Firebase Admin] Initialization warning: ensure FIREBASE_SERVICE_ACCOUNT is set if running outside GCP.', error);
  }
}

export const adminAuth = getAuth();
