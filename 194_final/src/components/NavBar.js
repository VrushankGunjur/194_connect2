import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore"; // Import arrayUnion
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import connect2 from "../img/connect2.png";
import "../styles/NavBar.css";
import  infoIcon  from "../img/info_icon.png"; // Import the info icon

const NavBar = ({ currUserGroup, setCurrUserGroup, isNewUser }) => {
  const [user] = useAuthState(auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userGroups, setUserGroups] = useState([]); // State to hold user groups
  const [currentUserId, setCurrentUserId] = useState(null);

  const updateGroup = (newGroup) => {
    console.log("trying to update group to:", newGroup);
    setCurrUserGroup(newGroup); // Assuming setCurrUserGroup is received via props from App
  };

  // useEffect(() => {
  //   console.log(userGroups); // To check if userGroups updates as expected
  // }, [userGroups]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
    if (currentUserId === null || isNewUser) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        // Extract current user data to find the current user's group
        const currUserData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id === currentUserId);

        if (currUserData.length > 0 && !isNewUser) {
          // const currUserGroup = currUserData[0].Group;

          console.log("Current user's group:", currUserGroup);
          // Add the current user's group to the userGroups state
          console.log("prev groups are", userGroups);
          setUserGroups((prevGroups) => [...prevGroups, currUserGroup]);
          console.log("user groups are, in useeffect, " + userGroups);

          console.log("user groups are, in useeffect, " + userGroups);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error
      }
    };

    fetchUsers();
  }, [currentUserId, isNewUser]); // Dependency array includes user to re-fetch groups when user state changes

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) =>
      console.error("Error signing in with Google:", error),
    );
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out:", error));
  };

  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const togglePopup = () => setShowPopup(!showPopup);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const addNewGroup = async () => {
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
    const groupName = prompt("Enter the name of your new group:");

    if (groupName) {
      try {
        if (userGroups.includes(groupName)) {
          alert(`You're already in group ${groupName}.`);
          throw new Error(`${groupName} is already in your groups.`);
        }
        // Update the user document in Firestore to add the group
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          Group: arrayUnion(groupName), // Use arrayUnion here
        });
        setCurrUserGroup(groupName); // Set the current user's group (if needed in the parent component
        // Update userGroups state with the new group
        setUserGroups((prevGroups) => [...prevGroups, groupName]);
        console.log("user groups are" + userGroups);
        console.log("ADDING NEW GROUP IS DONE");
      } catch (error) {
        console.error("Error adding new group:", error);
      }
    }
  };

  return (
    <nav className="nav-bar">
      <img src={connect2} alt="Connect2 Logo" className="logo" />
      <h1 className="titleHeader">Connect2</h1>
      <button onClick={togglePopup} className="info-btn">
        <img src={infoIcon} alt="Info Icon" className="info-icon" />
      </button>
      {showPopup && (
        <div className="fullscreen-popup">
          <div className="popup-content">
            <h1>Welcome to Connect2!</h1>
            <p>🎉 Connect2 is designed to help you connect and learn more about others!</p>
            <ul>
              <li>Each day, you'll be matched with another user from your group.</li>
              <li><strong>Your mission:</strong> Guess your match within your allotted guesses.</li>
            </ul>
            <h2>Guessing Game Rules</h2>
            <ul>
              <li>Each guess will be a person in your current group</li>
              <li>After each guess, see how your guess compares to your match.</li>
              <li>🔍 <strong>Arrows</strong> indicate the direction your match is compared to your guess.</li>
              <li><strong>Colors</strong> beyond red and green show how close your match is to your guess.</li>
            </ul>
            <p>Matches where both users are successful will appear on the leaderboard!</p>
            <p>Out of guesses? You won't get your match's responses, but will get their contact!</p>
            <button onClick={togglePopup}>GO!</button>
          </div>
        </div>
      )}
      {user ? (
        <div className="nav-right">
          <div className="user-groups">
            <button onClick={toggleDropdown} className="user-groups-btn">
              User Groups
            </button>
            {showDropdown && userGroups && (
              <div className="dropdown-content">
                {userGroups.length > 0 ? (
                  userGroups.map((group, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => updateGroup(group)}
                    >
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
