import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
// Uncomment the next line if you have CSS styles defined
// import "../styles/UserProfile.css";

const UserProfile = () => {
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
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevState) => ({
      ...prevState,
      [name]: name === "Age" || name === "Height" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userRef, userProfile);
        alert("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    } else {
      alert("No user logged in.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Include inputs for all fields from userProfile */}
        <input
          type="text"
          name="FirstName"
          value={userProfile.FirstName}
          onChange={handleChange}
          placeholder="First Name"
        />
        <input
          type="text"
          name="LastName"
          value={userProfile.LastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <input
          type="number"
          name="Age"
          value={userProfile.Age}
          onChange={handleChange}
          placeholder="Age"
        />
        <input
          type="text"
          name="Ethnicity"
          value={userProfile.Ethnicity}
          onChange={handleChange}
          placeholder="Ethnicity"
        />
        <select
          name="FavoriteColor"
          value={userProfile.FavoriteColor}
          onChange={handleChange}>
          <option value="">Favorite Color</option>
          {/* ... your color options here ... */}
        </select>
        <input
          type="text"
          name="FavoriteSport"
          value={userProfile.FavoriteSport}
          onChange={handleChange}
          placeholder="Favorite Sport"
        />
        <select name="Gender" value={userProfile.Gender} onChange={handleChange}>
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          name="Height"
          value={userProfile.Height}
          onChange={handleChange}
          placeholder="Height (in inches)"
        />
        <input
          type="text"
          name="HomeState"
          value={userProfile.HomeState}
          onChange={handleChange}
          placeholder="Home State"
        />
        <select name="Major" value={userProfile.Major} onChange={handleChange}>
          <option value="">Major</option>
          {/* ... your major options here ... */}
        </select>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default UserProfile;
