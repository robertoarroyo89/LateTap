import { applicationDefault, cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { AppError } from "@/lib/errors";

const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);

export const isFirebaseAdminConfigured = usingEmulators || Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS),
);

function credential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  return cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
}

export function getAdminApp(): App {
  if (!isFirebaseAdminConfigured) {
    throw new AppError("FIREBASE_NOT_CONFIGURED", "Firebase Admin is not configured", 503);
  }
  return getApps().length ? getApp() : initializeApp({
    ...(usingEmulators ? {} : { credential: credential() }),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "demo-latetap",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
export const adminStorage = () => getStorage(getAdminApp());
