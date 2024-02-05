// Expanded DropdownForm.js
import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

/*
    submit your information when first signing in
*/



const DropdownForm = () => {
  const [formState, setFormState] = useState({
    age: '',
    ethnicity: '',
    favoriteColor: '',
    favoriteSport: '',
    gender: '',
    height: '',
    homeTown: '',
    major: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    // call a diff function (on target vs. e) and update the screen with new status
    e.preventDefault();

    console.log(formState);

    // diff(formState, )

    // Ensure you are pushing to a unique path for each user, for example by using a user ID
    const usersRef = ref(db, 'users/' + Date.now()); // Using Date.now() for demo, consider using user IDs
    set(usersRef, formState).then(() => {
      alert("Data saved successfully!");
    }).catch((error) => {
      alert("Failed to save data: " + error.message);
    });
  };


  return (
    <form onSubmit={handleSubmit}>
      <input type="number" name="age" placeholder="Age" value={formState.age} onChange={handleChange} />
      <input type="text" name="ethnicity" placeholder="Ethnicity" value={formState.ethnicity} onChange={handleChange} />
      <input type="text" name="favoriteColor" placeholder="Favorite Color" value={formState.favoriteColor} onChange={handleChange} />
      <input type="text" name="favoriteSport" placeholder="Favorite Sport" value={formState.favoriteSport} onChange={handleChange} />
      <select name="gender" value={formState.gender} onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" name="height" placeholder="Height" value={formState.height} onChange={handleChange} />
      <input type="text" name="homeTown" placeholder="Home Town" value={formState.homeTown} onChange={handleChange} />
      <input type="text" name="major" placeholder="Major" value={formState.major} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default DropdownForm;


