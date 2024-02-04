// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBbcBolcuIniuFskl-03dAoU3P3Miz2uzg",
      authDomain: "cs194-e95a9.firebaseapp.com",
      projectId: "cs194-e95a9",
      storageBucket: "cs194-e95a9.appspot.com",
      messagingSenderId: "863782725453",
      appId: "1:863782725453:web:560874d14a6b68c82f7904",
      measurementId: "G-8XXFYX3L4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);