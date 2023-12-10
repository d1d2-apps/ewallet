import { initializeApp } from 'firebase/app';

export function initializeFirebaseApp() {
  const serviceAccount = JSON.parse(process.env.FIREBASE);

  initializeApp(serviceAccount);
}
