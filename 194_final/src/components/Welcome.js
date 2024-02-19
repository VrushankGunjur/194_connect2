import React from "react";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import wordle from "../img/wordle.png";
import connect2 from "../img/connect2.png";
import { auth } from "../firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase.js';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Game } from "./Game.js"
import UserDropdown from "./UserDropDown.js";
import "../styles/Welcome.css";

const Welcome = ({ onSignInComplete }) => {
  // Assume `onSignInComplete` accepts two arguments: a flag indicating completion and a isNewUser flag.
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const userRef = doc(db, "users", result.user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            FirstName: '',
            LastName: '',
            Age: '',
            Ethnicity: '',
            FavoriteColor: '',
            FavoriteSport: '',
            Gender: '',
            Height: '',
            HomeTown: '',
            Major: '',
            NewUser: true
            // newUser: true
            // createdAt: new Date() // Store the creation date of the user document
            // Add any other user fields you need
          }).then(() => {
            console.log("New user document created.");
            onSignInComplete(true); // Call callback function indicating the user is new and sign-in is complete
          }).catch((error) => {
            console.error("Error creating user document:", error);
            // Handle the error, e.g., by logging or showing an error message
          });
        } else {
          // User exists in the database, not new.
          onSignInComplete(false); // User is not new.
        }
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        // Handle error, such as by displaying a message to the user.
      });
  };


  const googleSignInButtonStyle = {
    background: `url(${GoogleSignin}) center/cover no-repeat`,
    width: '200px',
    height: '35px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  };

  return (
    <main className="welcome">
      <img src={connect2} alt="Connect2 logo" width="100" height="100" />
      <h2>Welcome to Connect2</h2>
      <p>Sign in with Google to guess and chat with your fellow group members.</p>
      <button
        style={googleSignInButtonStyle}
        onClick={googleSignIn}
        size="lg"
        aria-label="Sign in with Google"
      >
        {/* For accessibility reasons, it's good practice to have textual content or an aria-label for interactive elements */}
      </button>
      {/* If you have additional content, add here */}
    </main>
  );
};

export default Welcome;