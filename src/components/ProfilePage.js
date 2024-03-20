import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import "../styles/ProfilePage.css";

const UserProfile = ({ updateProfileFalse }) => {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate(); 
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
    Group: "Global", 
    IsNewUser: true,
    HotTake: "", 
  });

  const handleEditProfile = () => {
    navigate("/user-form"); 
  };

  const handleExitProfile = () => {
    navigate("/game"); 
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
  
  const defaultPhotoURL = "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea"

  return (
    <div className="profile-container">
    
      <h2 className= "profile-title">Profile Page</h2>
      <img src = {userProfile.ProfilePhotoURL || defaultPhotoURL} className="member-profiles"/>
      <p className = "name">  {userProfile.FirstName} {userProfile.LastName}</p>
      <div className = "attributes">
        <p> <b>Age:</b> {userProfile.Age}</p>
        <p> <b>Ethnicity:</b> {userProfile.Ethnicity}</p>
        <p> <b>Favorite Color:</b> {userProfile.FavoriteColor}</p>
        <p> <b>Favorite Sport:</b> {userProfile.FavoriteSport}</p>
        <p> <b>Gender:</b> {userProfile.Gender}</p>
        <p> <b>Height:</b> {userProfile.Height} inches</p>
        <p> <b>Home State:</b> {userProfile.HomeState}</p>
        <p> <b>Hot Take:</b> {userProfile.HotTake}</p>
        <p> <b>Major:</b> {userProfile.Major}</p>
      </div>
      <button className = "Edit" onClick={handleEditProfile}>Edit Profile</button>
      <button className = "Edit" onClick={handleExitProfile}>Exit Viewing</button>
    </div>
  );
};

export default UserProfile;

