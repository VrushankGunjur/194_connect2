import React, { useEffect, useState } from "react";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import connect2 from "../img/connect2.png";
import "../styles/NavBar.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
 

const NavBar = () => {
  const [user] = useAuthState(auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userGroups, setUserGroups] = useState([]); // State to hold user groups
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Use 'uid' instead of 'id'
      } else {
        // User is signed out
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId === null) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        // Extract current user data to find the current user's group
        const currUserData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.id === currentUserId);

        if (currUserData.length > 0) {
          const currUserGroup = currUserData[0].Group;

          console.log("Current user's group:", currUserGroup);
          // Add the current user's group to the userGroups state
          setUserGroups(prevGroups => [...prevGroups, currUserGroup]);
        }

      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error
      }
    };

    fetchUsers();
  }, [currentUserId]);// Dependency array includes user to re-fetch groups when user state changes

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(error => console.error("Error signing in with Google:", error));
  };

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error("Error signing out:", error));
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const addNewGroup = () => {
    console.log("Add new group functionality goes here.");
    // This is where you'd implement the logic to add a new group,
    // potentially opening a modal or redirecting to a page where the user can enter details for the new group.
  };

  return (
    <nav className="nav-bar">
      <img src={connect2} alt="Connect2 Logo" className="logo" />
      <h1 className="titleHeader">Connect2</h1>
      {user ? (
        <div className="nav-right">
          <div className="user-groups">
            <button onClick={toggleDropdown} className="user-groups-btn">
              User Groups
            </button>
            {showDropdown && (
              <div className="dropdown-content">
                {userGroups.length > 0 ? (
                  userGroups.map((group, index) => (
                    <div key={index} className="dropdown-item">
                      {group}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item">No groups found</div>
                )}
                <div className="dropdown-item" onClick={addNewGroup}>
                  + Add New Group
                </div>
              </div>
            )}
          </div>
          <button onClick={handleSignOut} className="sign-out" type="button">
            Sign Out
          </button>
        </div>
      ) : (
        <button className="sign-in" type="button" onClick={googleSignIn}>
          <img src={GoogleSignin} alt="Sign in with Google" />
        </button>
      )}
    </nav>
  );
};

export default NavBar;
