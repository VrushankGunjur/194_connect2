// Expanded DropdownForm.js
import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

// state
function diff(trueState, guessState) {
    /*
        Value 1- Difference  (DIRECTIONALITY)
        0 == true value is less than guess
        1 == true value is greater than guess
        2 == true value matches the guess

            OR BLANK (depending on use case)

        Value 2- Color Gradient  (MAGNITUDE) 0=Red, .5 = Yellow, 1 == Green  (approx)
        Age = Hard Coded +-
        Height 
        Ethnicity 
        Favorite Color 
        
    */
    

    // let diffState = [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]];
    let colorCutoffs = {
      age : 5,
      email
    }
    let resState = {};

    for (const key in trueState) {
      let val_diff = Math.abs(trueState[key] - guessState[key]);
      let diff = {dir : 2, color : 2};
      if (trueState[key] < guessState[key]) {
        diff.dir = 0;
      }
      else if (trueState[key] > guessState[key]) {
        diff.dir = 1
      }
      if (val_diff <= )

      resState[key] = diff;
    }
    
    if (state1.age === state2.age) {
        diffState[0] = 2;
    }
    if (state1.height === state2.height) {
        
    }
}

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
    // const usersRef = ref(db, 'users/' + Date.now()); // Using Date.now() for demo, consider using user IDs
    // set(usersRef, formState).then(() => {
    //   alert("Data saved successfully!");
    // }).catch((error) => {
    //   alert("Failed to save data: " + error.message);
    // });
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


