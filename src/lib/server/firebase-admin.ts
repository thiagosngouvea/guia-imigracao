import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getCredential() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey,
    });
  }

  // Works automatically on Google-managed runtimes. Vercel deployments should
  // provide FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.
  return applicationDefault();
}

const adminApp = getApps().find((app) => app.name === 'server') ||
  initializeApp(
    {
      credential: getCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    'server'
  );

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

