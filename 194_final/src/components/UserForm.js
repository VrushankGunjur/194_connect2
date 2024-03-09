// Expanded UserForm.js
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import "../styles/UserForm.css";
import cities from '../data/city-pop-200k.json';

const UserForm = ({ onFormSubmit, setIsNewUser }) => {
  const [formState, setFormState] = useState({
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
    Group: ["Global"],
    NewUser: true,
    HotTake: "", // Added HotTake field to the initial state
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle file input separately
    if (name === "file") {
      setFormState((prevState) => ({
        ...prevState,
        file: e.target.files[0],
      }));
    } else {
      const isNumberField = name === "Age" || name === "Height";
      setFormState((prevState) => ({
        ...prevState,
        [name]: isNumberField ? Number(value) : value,
      }));
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const storageRef = ref(storage, `profilePictures/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress
        },
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (user && formState.file) {
      try {
        const photoURL = await uploadImage(formState.file);
        // Update profile photoURL in Firebase Authentication
        const displayName = `${formState.FirstName} ${formState.LastName}`;
        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL,
        })
          .then(() => {
            console.log("Update successful");
          })
          .catch((error) => {
            console.log("Update unsuccessful" + error);
          });

        // Now update Firestore document with new profile and possibly other fields
        const { file, ...restOfFormState } = formState; // Destructure to remove 'file'
        const updatedFormState = {
          ...restOfFormState,
          ProfilePhotoURL: photoURL,
          NewUser: formState.FirstName.length === 0,
        };

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, updatedFormState, { merge: true });

        onFormSubmit(true); // Assuming this callback is meant to update the parent component's state
        setIsNewUser(formState.FirstName.length === 0 ? true : false);
      } catch (error) {
        alert(`Failed to upload image and update profile: ${error.message}`);
      }
    } else {
      alert("No file selected or user not logged in.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <input
        type="text"
        name="FirstName"
        placeholder="First Name"
        value={formState.FirstName}
        onChange={handleChange}
      />

      <input
        type="text"
        name="LastName"
        placeholder="Last Name"
        value={formState.LastName}
        onChange={handleChange}
      />

      <input
        type="number"
        name="Age"
        placeholder="Age"
        value={formState.Age}
        onChange={handleChange}
      />

      <input
        type="text"
        name="Ethnicity"
        placeholder="Ethnicity"
        value={formState.Ethnicity}
        onChange={handleChange}
      />

      <select
        name="FavoriteColor"
        value={formState.FavoriteColor}
        onChange={handleChange}>
        <option value="">Favorite Color</option>
        <option value="Red">Red</option>
        <option value="Orange">Orange</option>
        <option value="Yellow">Yellow</option>
        <option value="Green">Green</option>
        <option value="Blue">Blue</option>
        <option value="Purple">Purple</option>
        <option value="Pink">Pink</option>
        <option value="Brown">Brown</option>
        <option value="White">White</option>
        <option value="Black">Black</option>
        <option value="Gray">Gray</option>
      </select>

      <input
        type="text"
        name="FavoriteSport"
        placeholder="Favorite Sport"
        value={formState.FavoriteSport}
        onChange={handleChange}
      />

      <select name="Gender" value={formState.Gender} onChange={handleChange}>
        <option value="">Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="number"
        name="Height"
        placeholder="Height (in inches)"
        value={formState.Height}
        onChange={handleChange}
      />

      <select name="HomeState" value={formState.HomeState} onChange={handleChange}>
        <option value="">Nearest Major City</option>
        {cities.map((city, index) => {
          return  <option key={index} value={`${city.name},${city.cou_name_en},${city.coordinates.lat},${city.coordinates.lon}`}>
                      {city.name}, {city.cou_name_en}
                  </option>
        })}
      </select>

      <select name="Major" value={formState.Major} onChange={handleChange}>
        <option value="">Major</option>
        {/* Add your major options here */}
      </select>

      <input
        type="text"
        name="HotTake"
        placeholder="Your Hot Take"
        value={formState.HotTake}
        onChange={handleChange}
      />

      <p className="form-label">Add a Profile Picture:</p>
      <input type="file" name="file" onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserForm;
