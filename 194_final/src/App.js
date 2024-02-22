import { doc, getDoc } from "firebase/firestore"; // Import getDoc for reading documents
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Game } from "./components/Game";
import LoadingPage from "./components/LoadingPage";
import NavBar from "./components/NavBar";
import UserForm from "./components/UserForm";
import Welcome from "./components/Welcome";
import { auth, db } from "./firebase"; // Ensure db is imported
import "./styles/App.css";

function App() {
  const [user, loadingAuth] = useAuthState(auth); // useAuthState might also indicate loading
  const [isNewUser, setIsNewUser] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loadingUserCheck, setLoadingUserCheck] = useState(true); // Separate loading state for user check
  const [currUserGroup, setCurrUserGroup] = useState("Global");

  // console.log("current user group in app is ", currUserGroup);
  // console.log(currUserGroup)

  const handleUserGroupChange = (newUserGroup) => {
    setCurrUserGroup(newUserGroup);
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loadingAuth && user) {
        // Ensure auth state is not loading and user exists
        console.log("updating newuser status");
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        console.log("userDoc:", userDoc.data());
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsNewUser(userData.NewUser);
        } else {
          setIsNewUser(true);
        }
      } else if (!loadingAuth) {
        console.log("user hasn't been initiated or not logged in");
        setIsNewUser(false); // Assuming a non-logged-in user is not a new user for initial state
      }

      setLoadingUserCheck(false);
    };

    if (loadingAuth) {
      setLoadingUserCheck(true); // Keep user check loading if auth state is still loading
    } else {
      checkUserStatus();
    }
  }, [user, loadingAuth]);

  if (loadingAuth || loadingUserCheck) {
    return <LoadingPage />; // Show a loading state while checking both auth and user status
  }

  return (
    <div className="App">
      {console.log(
        "before game is rendered, currusergroup is " + currUserGroup,
      )}
      {user ? (
        <NavBar
          currUserGroup={currUserGroup}
          setCurrUserGroup={handleUserGroupChange}
          isNewUser={isNewUser}
        />
      ) : null}
      {!user ? (
        <Welcome onSignInComplete={setIsNewUser} />
      ) : isNewUser ? (
        <UserForm onFormSubmit={setFormSubmitted} setIsNewUser={setIsNewUser} />
      ) : (
        <Game
          currUserGroup={currUserGroup}
          setCurrUserGroup={handleUserGroupChange}
        />
      )}
    </div>
  );
}

export default App;
