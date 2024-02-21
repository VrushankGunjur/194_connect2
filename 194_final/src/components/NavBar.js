import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import connect2 from '../img/connect2.png';
import GoogleSignin from '../img/btn_google_signin_dark_pressed_web.png';
import '../styles/NavBar.css';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'; // Import arrayUnion

const NavBar = ({setCurrUserGroup}) => {
  const [user] = useAuthState(auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userGroups, setUserGroups] = useState([]); // State to hold user groups
  const [currentUserId, setCurrentUserId] = useState(null);

  const updateGroup = (newGroup) => {
    console.log("trying to update group to:", newGroup);
    setCurrUserGroup(newGroup); // Assuming setCurrUserGroup is received via props from App
  };

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
    if (currentUserId === null) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));

        // Extract current user data to find the current user's group
        const currUserData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id === currentUserId);

        if (currUserData.length > 0) {
          const currUserGroup = currUserData[0].Group;

          console.log("Current user's group:", currUserGroup);
          // Add the current user's group to the userGroups state
          setUserGroups((prevGroups) => [...prevGroups, currUserGroup]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Handle error
      }
    };

    fetchUsers();
  }, [currentUserId]); // Dependency array includes user to re-fetch groups when user state changes

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => console.error('Error signing in with Google:', error));
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error));
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const addNewGroup = async () => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }
    const groupName = prompt('Enter the name of your new group:');
    if (groupName) {
      try {
        // Update the user document in Firestore to add the group
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          Group: arrayUnion(groupName), // Use arrayUnion here
        });
        setCurrUserGroup(groupName); // Set the current user's group (if needed in the parent component
        // Update userGroups state with the new group
        setUserGroups((prevGroups) => [...prevGroups, groupName]);
      } catch (error) {
        console.error('Error adding new group:', error);
      }
    }
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
                  userGroups[0].map((group, index) => (
                    <div key={index} className="dropdown-item" onClick={() => updateGroup(group)}>
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
