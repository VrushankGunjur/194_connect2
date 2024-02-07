import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import auth from '../firebase.js';
import { db } from '../firebase';
import UserForm from './UserForm';

// state
function diff(trueState, guessState) {
    /*
        Value 1- Difference  (DIRECTIONALITY)
        0 == true value is less than guess
        1 == true value is greater than guess
        2 == true value matches the guess

            OR BLANK (depending on use case)

        Value 2- Color Gradient  (MAGNITUDE) 0=Red, .5 = Yellow, 1 == Green  (approx)
        Age = 1 year is .5
        Height: 3 in is .5 
        Ethnicity: cos sim
        Favorite Color: cos sim
        Gender: 0-Red 1- Green 
        Hometown- cos sim
        Major- cos sim 

    */
    

    // let diffState = {age: {cur: 2, color: 1}, [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]};
    let colorCutoffs = {
      FirstName: '',
      LastName: '',
      Gender: '',
      Age: 1,
      Ethnicity: '',
      FavoriteColor: '',
      FavoriteSport: '',
      HomeState: '',
      Major: '',
      Height: 3
    }
    let resState = {};


    for (const key in trueState) {
      let diff = {dir : 2, color : 1};

      if (colorCutoffs[key] === '') {
        if (trueState[key] !== guessState[key]) {
          diff.color = 0;
        }
        else {
          diff.color = 1;
        }
      }
      else {
        if (trueState[key] < guessState[key]) {
          diff.dir = 0;
          if (guessState[key] - trueState[key] > colorCutoffs[key]) {
            diff.color = 0;
          }
          else {
            diff.color = 0.5;
          }
        }
        else if (trueState[key] > guessState[key]) {
          diff.dir = 1;
          if (trueState[key] - guessState[key] > colorCutoffs[key]) {
            diff.color = 0;
          }
          else {
            diff.color = 0.5;
          }
        }
      }

      resState[key] = diff;
    }

    console.log(resState);
    return resState;
}


export function Game() {
  const [randomUser, setRandomUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guessedUsers, setGuessedUsers] = useState([]);
  const [dispUsers, setDispUsers] = useState([]);
  const [firstLogin, setFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  let dispFeatures = ["FirstName", "LastName", "Gender", "Age", "Ethnicity", "FavoriteColor", "FavoriteSport", "HomeState", "Height"];

  const auth = getAuth();

  // Your existing handler functions remain unchanged

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => {
          const { newUser, ...userData } = doc.data();
          return {
            id: doc.id,
            ...userData,
            fullName: `${userData.FirstName} ${userData.LastName}`, // Concatenate for display
            formattedHeight: formatHeight(userData.Height), // Convert Height to feet and inches
          };
        });
        console.log(usersData)
        setUsers(usersData);
        if (usersData.length > 0) {
          const randomIndex = Math.floor(Math.random() * usersData.length);
          setRandomUser(usersData[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setFeedback('Failed to load users.');
      }
    };

    fetchUsers();
  }, []);

  // Helper function to convert height from inches to feet and inches format
  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`; // Format as X'Y"
  };

  const handleGuessChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  const handleGuessSubmit = (event) => {
    event.preventDefault();

    // call diff on guessedUser and randomUser
    // call AttributeRectangles on output of diff
    // return the output of AttributeRectangles in the HTML component

    const guessedUser = users.find(user => user.id === selectedUserId);
    if (guessedUser) {
      if (randomUser && selectedUserId === randomUser.id) {
        setFeedback('Correct! You guessed the right user.');
      } else {
        setUsers(users.filter(user => user.id !== selectedUserId));
        setFeedback('Incorrect guess. Try again!');
      }
      // Add the guessed user with all formatted traits to the guessedUsers array
      
      setGuessedUsers([...guessedUsers, guessedUser]);
      let resDiffs = diff(guessedUser, randomUser);
      let dispUser = {};
      for (const key of dispFeatures) {
        dispUser[key] = {};
        dispUser[key].data = guessedUser[key];
        if (key === "Height") {dispUser[key].data = formatHeight(guessedUser[key]);}
        dispUser[key].disp = resDiffs[key];
      }
      setDispUsers([...dispUsers, dispUser]);
    }
    setSelectedUserId(''); // Reset for next guess
  };

  return (
    <div>
      <h2>Guess the User's Name</h2>
      {randomUser && users.length > 0 ? (
        <>
          <p>Can you guess the name of the user?</p>
          <form onSubmit={handleGuessSubmit}>
            <select value={selectedUserId} onChange={handleGuessChange}>
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.fullName}</option>
              ))}
            </select>
            <button type="submit">Guess</button>
          </form>
          {feedback && <p>{feedback}</p>}
          {guessedUsers.length > 0 && (
            <>
              <h3>Guessed Users:</h3>
              <table>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Ethnicity</th>
                    <th>Favorite Color</th>
                    <th>Favorite Sport</th>
                    <th>Home State</th>
                    {/*<th>Major</th>*/}
                    <th>Height</th> {/* Additional column for Height */}
                  </tr>
                </thead>
                <tbody>
                  {dispUsers.map((dispUser, index) => (
                    <tr key={index}>
                      <td><AttributeRectangles dispComponent={dispUser.FirstName} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.LastName} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.Gender} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.Age} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.Ethnicity} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.FavoriteColor} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.FavoriteSport} /></td>
                      <td><AttributeRectangles dispComponent={dispUser.HomeState} /></td>
                      {/*<td><AttributeRectangles dispComponent={dispUser.Major} /></td>*/}
                      <td><AttributeRectangles dispComponent={dispUser.Height} /></td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

// Component that renders single rectangle based on data to print and display data
export const AttributeRectangles = ({ dispComponent }) => {
    // Function to determine the arrow based on the first number
    console.log(dispComponent);
    const getArrow = (value) => {
      switch(value) {
        case 0: return '↑';
        case 1: return '↓';
        case 2: return ''; // No arrow
        default: return ''; // Fallback, should not happen
      }
    };
  
    // Function to normalize the second number to a color
    const getColor = (value) => {
      if (value <= 0.33) return 'red';
      if (value <= 0.66) return 'yellow';
      return 'green';
    };
  
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        
          <div key={dispComponent.data} style={{
            backgroundColor: getColor(dispComponent.disp.color),
            padding: '10px',
            width: '125px',
            textAlign: 'center',
            color: 'black',
            fontWeight: 'bold',
            border: '1px solid #ccc'
          }}>
            {dispComponent.data} {getArrow(dispComponent.disp.dir)}
          </div>
      </div>
    );
  };
