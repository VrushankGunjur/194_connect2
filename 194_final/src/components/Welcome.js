import React from "react";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import wordle from "../img/wordle.png";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Game from "../components/Game.js"
import UserDropdown from "../components/UserDropDown.js";

const Welcome = () => {
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <main className="welcome">
      <h2>Welcome to Wordle with Friends.</h2>
      <img src={wordle} alt="ReactJs logo" width={50} height={50} />
      <p>Sign in with Google to chat with with your fellow Worlde group members.</p>
      <button className="GetRand">
        <img
          onClick={Game}
          alt="Get Random User"
          type="button"
        />
      </button>
      <button className="Dropdown">
        <img
          onClick={UserDropdown}
          alt="Get Random User"
          type="button"
        />
      </button>
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