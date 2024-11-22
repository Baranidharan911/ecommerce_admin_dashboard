import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBSZWeEcWiXdMcqZMT-HG3BA8uqgiuj7W8",
    authDomain: "printz-fd551.firebaseapp.com",
    projectId: "printz-fd551",
    storageBucket: "printz-fd551.appspot.com",
    messagingSenderId: "339905554940",
    appId: "1:339905554940:web:9c91657ff67c7c8bbc2a79",
    measurementId: "G-LT0JTJR3KX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Initialize and export auth
const db = getFirestore(app);  // Initialize and export Firestore
const storage = getStorage(app);  // Initialize and export storage

const authenticate = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Logged in!');
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};

export { auth, db, storage, authenticate };  // Export auth, db, storage, and authenticate
