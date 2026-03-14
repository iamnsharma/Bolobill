import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import {env} from '../config/env';

let cachedApp: admin.app.App | null = null;

const envWithFirebase = env as typeof env & {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_SERVICE_ACCOUNT_PATH?: string;
};

const resolveCredential = () => {
  if (envWithFirebase.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    const parsed = JSON.parse(envWithFirebase.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.credential.cert(parsed);
  }

  if (envWithFirebase.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()) {
    const absolutePath = path.isAbsolute(envWithFirebase.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? envWithFirebase.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.join(process.cwd(), envWithFirebase.FIREBASE_SERVICE_ACCOUNT_PATH);
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return admin.credential.cert(parsed);
  }

  return admin.credential.applicationDefault();
};

export const getFirebaseAdminApp = () => {
  if (cachedApp) {
    return cachedApp;
  }

  cachedApp = admin.initializeApp({
    credential: resolveCredential(),
  });
  return cachedApp;
};

export const verifyFirebaseIdToken = async (token: string) => {
  const app = getFirebaseAdminApp();
  return app.auth().verifyIdToken(token);
};
