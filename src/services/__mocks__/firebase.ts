import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'test-project-id',
  storageBucket: 'test-storage-bucket',
  messagingSenderId: 'test-messaging-sender-id',
  appId: 'test-app-id'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 