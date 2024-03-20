import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React from "react";
import { auth, db } from "../firebase.js";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import connect2 from "../img/connect2.png";
import "../styles/Welcome.css";
import { useNavigate } from 'react-router-dom';


const Welcome = ({ onSignInComplete }) => {
  const navigate = useNavigate();

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const userRef = doc(db, "users", result.user.uid);
        const docSnap = await getDoc(userRef);
        console.log(docSnap);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            FirstName: "",
            LastName: "",
            Age: "",
            Ethnicity: "",
            FavoriteColor: "",
            FavoriteSport: "",
            Gender: "",
            Height: "",
            HotTake: "",
            HomeTown: "",
            Major: "",
            NewUser: true,
          })
            .then(() => {
              console.log("New user document created.");
              onSignInComplete(true); 
              navigate(`/user-form`)
            })
            .catch((error) => {
              console.error("Error creating user document:", error);
            });
        } else {
          onSignInComplete(false); 
          if (docSnap.data().NewUser) {
            navigate('/user-form')
          } else {
            navigate(`/game`)
          }
        }
      })
      .catch((error) => {
        console.error("Authentication error:", error);
      });
  };

  const googleSignInButtonStyle = {
    background: `url(${GoogleSignin}) center/cover no-repeat`,
    width: "200px",
    height: "35px",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  };

  return (
    <main className="welcome">
      <img src={connect2} alt="Connect2 logo" width="100" height="100" />
      <h2>Welcome to Connect2</h2>
      <p>
        Sign in to play!
      </p>
      <button
        style={googleSignInButtonStyle}
        onClick={googleSignIn}
        size="lg"
        aria-label="Sign in with Google"
      >
      </button>
    </main>
  );
};

export default Welcome;
