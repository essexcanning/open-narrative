import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { User } from '../types';

// Configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAnZR_H8jdHrCnJgA_Y5l0vHjws9ATUYn8",
  authDomain: "open-narratives.firebaseapp.com",
  projectId: "open-narratives",
  storageBucket: "open-narratives.firebasestorage.app",
  messagingSenderId: "364945601836",
  appId: "1:364945601836:web:7c25757667b11ec79de889",
  measurementId: "G-45P2NNLJR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const mapFirebaseUser = (user: FirebaseUser): User => {
    const name = user.displayName || 'Unknown User';
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return {
        id: user.uid,
        name: name,
        email: user.email || '',
        photoUrl: user.photoURL || undefined,
        initials: initials || '??'
    };
};

export { onAuthStateChanged };