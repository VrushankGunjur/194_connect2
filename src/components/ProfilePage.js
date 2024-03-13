import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { auth, db } from "../firebase";
import "../styles/UserProfile.css";

const UserProfile = ({ updateProfileFalse }) => {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate(); // Instantiate the navigate function
  const [userProfile, setUserProfile] = useState({
    ProfilePhotoURL: "",
    FirstName: "",
    LastName: "",
    Age: "",
    Ethnicity: "",
    FavoriteColor: "",
    FavoriteSport: "",
    Gender: "",
    Height: "",
    HomeState: "",
    Major: "",
    Group: "Global", // Assuming this is a single value for simplicity
    IsNewUser: true,
    HotTake: "", // Added HotTake to the initial state
  });


  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleEditProfile = () => {
    navigate("/user-form"); // Navigate to UserForm component
  };

  const handleExitProfile = () => {
    navigate("/game"); // Navigate to UserForm component
  };

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);


  return (
    <div className="profile-container">
    
      <h2>Profile Page</h2>
      <p>First Name: {userProfile.FirstName}</p>
      <p>Last Name: {userProfile.LastName}</p>
      <p>Age: {userProfile.Age}</p>
      <p>Ethnicity: {userProfile.Ethnicity}</p>
      <p>Favorite Color: {userProfile.FavoriteColor}</p>
      <p>Favorite Sport: {userProfile.FavoriteSport}</p>
      <p>Gender: {userProfile.Gender}</p>
      <p>Height: {userProfile.Height} inches</p>
      <p>Home State: {userProfile.HomeState}</p>
      <p>Hot Take: {userProfile.HotTake}</p>
      <p>Major: {userProfile.Major}</p>
      <button onClick={handleEditProfile}>Edit Profile</button>
      <button onClick={handleExitProfile}>Exit Editing</button>
    </div>
  );
};

export default UserProfile;
