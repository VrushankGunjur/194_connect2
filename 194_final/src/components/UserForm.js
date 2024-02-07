// Expanded DropdownForm.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { collection, updateDoc, doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import { db } from '../firebase';

/*
    submit your information when first signing in
*/

const DropdownForm = ( { onFormSubmit, setIsNewUser } ) => {
  const [formState, setFormState] = useState({
    FirstName: '',
    LastName: '',
    Age: '',
    Ethnicity: '',
    FavoriteColor: '',
    FavoriteSport: '',
    Gender: '',
    Height: '',
    HomeState: '',
    Major: '',
    NewUser: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Check if the field is either 'Age' or 'Height' and convert the value to a number
    const isNumberField = name === 'Age' || name === 'Height';
    setFormState(prevState => ({
      ...prevState,
      [name]: isNumberField ? Number(value) : value // Convert to number if it's a number field
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // You have correctly prepared updatedFormState to set NewUser based on FirstName
    const updatedFormState = {
      ...formState,
      NewUser: formState.FirstName.length === 0 // NewUser is false if FirstName has length > 0
    };

    if (formState.FirstName.length == 0) {
      setIsNewUser(true)
    } else {
      setIsNewUser(false)
    }
  
    const userDocId = auth.currentUser?.uid;
  
    // Use updatedFormState for the update operation to reflect the change in NewUser
    if (userDocId) {
      const userRef = doc(db, "users", userDocId);
      setDoc(userRef, updatedFormState, { merge: true }) // Changed from formState to updatedFormState
        .then(() => {
          // alert("Data updated successfully!");
          onFormSubmit(true); // Assuming this callback is meant to update the parent component's state
        })
        .catch((error) => {
          alert("Failed to update data: " + error.message);
        });
    } else {
      alert("No user document ID found.");
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="FirstName" placeholder="First Name" value={formState.FirstName} onChange={handleChange} />
      <input type="text" name="LastName" placeholder="Last Name" value={formState.LastName} onChange={handleChange} />
      <input type="number" name="Age" placeholder="Age" value={formState.Age} onChange={handleChange} />
      <input type="text" name="Ethnicity" placeholder="Ethnicity" value={formState.Ethnicity} onChange={handleChange} />
      <input type="text" name="FavoriteColor" placeholder="Favorite Color" value={formState.FavoriteColor} onChange={handleChange} />
      <input type="text" name="FavoriteSport" placeholder="Favorite Sport" value={formState.FavoriteSport} onChange={handleChange} />
      <select name="Gender" value={formState.Gender} onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="number" name="Height" placeholder="Height (in inches)" value={formState.Height} onChange={handleChange} />
      <input type="text" name="HomeState" placeholder="Home State" value={formState.HomeState} onChange={handleChange} />
      <input type="text" name="Major" placeholder="Major" value={formState.Major} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default DropdownForm;


