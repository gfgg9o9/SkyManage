import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test
async function testConnection() {
  try {
    // Attempting to reach the server once to verify configuration
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore: Server connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.info("Firestore: Client is offline. This is normal if there's no internet connection. The SDK will retry automatically.");
    } else {
      // For other errors like permission denied, we still want to know
      console.warn("Firestore: Verification check result:", error);
    }
  }
}

testConnection();
