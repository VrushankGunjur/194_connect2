import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles/UserProfile.css";

const UserProfile = ({updateProfileFalse}) => {
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

  let majorOptions = [
    "Aerospace Engineering",
    "African Studies",
    "African and African American Studies",
    "American Studies",
    "Anthropology",
    "Applied and Engineering Physics",
    "Art History",
    "Art Practice",
    "Asian American Studies",
    "Atmospheric / Energy",
    "Bioengineering",
    "Biology",
    "Biomechanical Engineering",
    "Biomedical Computation",
    "Chemical Engineering",
    "Chemistry",
    "Chicana/o - Latina/o Studies",
    "Chinese Studies",
    "Classics",
    "Communication",
    "Community Health and Prevention Research",
    "Comparative Literature",
    "Comparative Studies in Race and Ethnicity",
    "Computer Science",
    "Dance (TAPS Minor)",
    "Data Science",
    "Democracy, Development, and the Rule of Law",
    "Digital Humanities",
    "Earth Systems",
    "East Asian Studies",
    "Education",
    "Electrical Engineering",
    "Energy Resources Engineering",
    "Engineering Physics",
    "English",
    "Environmental Systems Engineering",
    "Ethics in Society",
    "Film and Media Studies",
    "French",
    "Gender, and Sexuality Studies",
    "German Studies",
    "Global Studies",
    "History",
    "Honors in the Arts",
    "Human Biology",
    "Human Rights",
    "Iberian and Latin American Cultures",
    "International Policy Studies",
    "International Relations",
    "International Security Studies",
    "Iranian Studies",
    "Islamic Studies",
    "Italian",
    "Japanese",
    "Jewish Studies",
    "Korean",
    "Laboratory Animal Science",
    "Latin American Studies",
    "Linguistics",
    "Management Science and Engineering",
    "Materials Science and Engineering",
    "Mathematics",
    "Mechanical Engineering",
    "Medieval Studies",
    "Middle Eastern Language, Literature and Culture",
    "Modern Languages",
    "Modern Thought and Literature",
    "Music",
    "Music, Science, and Technology",
    "Native American Studies",
    "Philosophy",
    "Philosophy and Religious Studies",
    "Physics",
    "Political Science",
    "Portuguese",
    "Product Design",
    "Psychology",
    "Public Policy",
    "Religious Studies",
    "Russian Studies",
    "Science, Technology, and Society",
    "Slavic Languages and Literatures",
    "Sociology",
    "South Asian Studies",
    "Spanish",
    "Statistics",
    "Sustainability",
    "Symbolic Systems",
    "Theater and Performance Studies",
    "Translation Studies",
    "Turkish Studies",
    "Urban Studies",
    "Women's Studies",
  ];

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
    updateProfileFalse();
    console.log("handled submit");
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
        {majorOptions.map((major) => (
          <option key={major} value={major}>
            {major}
          </option>
        ))}
        </select>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default UserProfile;
