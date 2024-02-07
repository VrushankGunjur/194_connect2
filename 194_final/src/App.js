import React, { useState, useEffect } from 'react';
import { auth, db } from "./firebase"; // Ensure db is imported
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from 'firebase/firestore'; // Import getDoc for reading documents
import "./styles/App.css";
import NavBar from "./components/NavBar";
import { Game } from "./components/Game";
import Welcome from "./components/Welcome";
import UserForm from "./components/UserForm";

function App() {
  const [user] = useAuthState(auth);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true); // Start loading
      if (user) {
        console.log('updating newuser status')
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsNewUser(userData.NewUser);
        } else {
          setIsNewUser(true);
        }
      } else {
        console.log('user hasnt been initiated')
        setIsNewUser(true);
        setFormSubmitted(false);
      }
      setLoading(false); // Done loading
    };

    checkUserStatus();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking the user status
  }

  return (
    <div className="App">
      {user ? <NavBar /> : null}
      {!user ? (
        <Welcome onSignInComplete={setIsNewUser} />
      ) : isNewUser ? (
        <UserForm onFormSubmit={setFormSubmitted} setIsNewUser={setIsNewUser} />
      ) : (
        <Game />
      )}
    </div>
  );
}

export default App;
