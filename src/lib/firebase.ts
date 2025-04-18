// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5qQfK0qriHXLBypezI-f41w7nDFci9j0",
  authDomain: "famileezy-db.firebaseapp.com",
  projectId: "famileezy-db",
  storageBucket: "famileezy-db.appspot.com", // Correction du nom du bucket
  messagingSenderId: "584335879196",
  appId: "1:584335879196:web:6cb90b6976799dd14d83d9",
  measurementId: "G-KQFKZ72KM7"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Utilisation des émulateurs en développement
if (process.env.NODE_ENV === 'development') {
  // Décommenter les lignes suivantes si vous utilisez les émulateurs Firebase
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, auth, db, storage, analytics };