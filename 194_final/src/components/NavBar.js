import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import connect2 from "../img/connect2.png";
import "../styles/NavBar.css";
import infoIcon from "../img/info_icon.png";

const NavBar = ({ currUserGroup, setCurrUserGroup, isNewUser, updateProfileTrue }) => {
  const [user] = useAuthState(auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const updateGroup = (newGroup) => {
    console.log("trying to update group to:", newGroup);
    setCurrUserGroup(newGroup);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
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

        const currUserData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id === currentUserId);

        if (currUserData.length > 0 && !isNewUser) {
          console.log("Current user's group:", currUserGroup);
          setUserGroups((prevGroups) => [...prevGroups, currUserGroup]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUserId, isNewUser]);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) =>
      console.error("Error signing in with Google:", error),
    );
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out:", error));
  };

  const [showPopup, setShowPopup] = useState(false);
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
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          Group: arrayUnion(groupName),
        });
        setCurrUserGroup(groupName);
        setUserGroups((prevGroups) => [...prevGroups, groupName]);
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
                  userGroups
                    .filter(group => group !== "Global") // Exclude the "Global" group
                    .map((group, index) => (
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
          <button onClick={updateProfileTrue} className="update-profile" type="button">
            Update Profile
          </button>
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
