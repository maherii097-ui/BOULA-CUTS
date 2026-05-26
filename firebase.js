import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
  getAuth, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8sPXP8EhmhVGzjZYzzzdqsFsLnvelP2U",
  authDomain: "boula-cuts.firebaseapp.com",
  databaseURL: "https://boula-cuts-default-rtdb.firebaseio.com",
  projectId: "boula-cuts",
  storageBucket: "boula-cuts.firebasestorage.app",
  messagingSenderId: "785791905615",
  appId: "1:785791905615:web:90b05ed9ea941909851f3a",
  measurementId: "G-YGW1Q7XPLK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// 💈 Add booking
export function addBooking(bookingData) {
  const defaultData = {
    status: "pending",
    timestamp: new Date(),
  };
  
  return addDoc(collection(db, "bookings"), {
    ...defaultData,
    ...bookingData,
  });
}

// 🔐 Login
export function login(email, password){
  return signInWithEmailAndPassword(auth, email, password);
}