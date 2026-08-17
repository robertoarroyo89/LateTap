import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = isFirebaseClientConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const firebaseAuth = app ? getAuth(app) : null;
export const firebaseDb = app ? getFirestore(app) : null;
export const firebaseStorage = app ? getStorage(app) : null;
export const googleAuthProvider = new GoogleAuthProvider();

const emulatorFlag = "__LATETAP_FIREBASE_EMULATORS_CONNECTED__";
type EmulatorGlobal = typeof globalThis & { [emulatorFlag]?: boolean };
const emulatorGlobal = globalThis as EmulatorGlobal;

if (app && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && !emulatorGlobal[emulatorFlag]) {
  if (firebaseAuth) connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  if (firebaseDb) connectFirestoreEmulator(firebaseDb, "127.0.0.1", 8080);
  if (firebaseStorage) connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
  emulatorGlobal[emulatorFlag] = true;
}
