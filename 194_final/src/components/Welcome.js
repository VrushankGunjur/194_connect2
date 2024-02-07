import React from "react";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import wordle from "../img/wordle.png";
import { auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Game } from "../components/Game.js"
import UserDropdown from "../components/UserDropDown.js";

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


  return (
    <main className="welcome">
      <h2>Welcome to Wordle with Friends.</h2>
      <img src={wordle} alt="ReactJs logo" width={50} height={50} />
      <p>Sign in with Google to chat with with your fellow Wordle group members.</p>
      {/* <button className="Dropdown">
        <img
          onClick={UserDropdown}
          alt="User Dropdown"
          type="button"
        />
      </button> */}
      <button className="sign-in">
        <img
          onClick={googleSignIn}
          src={GoogleSignin}
          alt="sign in with google"
          type="button"
        />
      </button>
    </main>
  );
};

export default Welcome;