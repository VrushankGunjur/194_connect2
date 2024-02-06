import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
      age: 1,
      ethnicity: '',
      favoriteColor: '',
      favoriteSport: '',
      gender: '',
      height: 3,
      homeTown: '',
      major: ''
    }
    let resState = {};

    for (const key in trueState) {
      let diff = {dir : 2, color : 1};
  
      if (trueState[key] < guessState[key]) {
        diff.dir = 0;
      }
      else if (trueState[key] > guessState[key]) {
        diff.dir = 1;
      }
      else {resState[key] = diff; continue;}

      if (colorCutoffs[key] !== '') {
        let val_diff = Math.abs(trueState[key] - guessState[key]);
        if (val_diff > colorCutoffs[key]) {
          diff.color = 0;
        }
        else {
          diff.color = 0.5;
        }
      }
      else {
        diff.color = 0;
      }

      resState[key] = diff;
    }
}


export function Game() {
  const [randomUser, setRandomUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guessedUsers, setGuessedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            ...userData,
            fullName: `${userData.FirstName} ${userData.LastName}`, // Concatenate for display
            formattedHeight: formatHeight(userData.Height), // Convert Height to feet and inches
          };
        });
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
                    <th>Major</th>
                    <th>Height</th> {/* Additional column for Height */}
                  </tr>
                </thead>
                <tbody>
                  {guessedUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.FirstName}</td>
                      <td>{user.LastName}</td>
                      <td>{user.Gender}</td>
                      <td>{user.Age}</td>
                      <td>{user.Ethnicity}</td>
                      <td>{user.FavoriteColor}</td>
                      <td>{user.FavoriteSport}</td>
                      <td>{user.HomeState}</td>
                      <td>{user.Major}</td>
                      <td>{user.formattedHeight}</td> {/* Display formatted Height */}
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

// Component that renders rectangles based on values in a map
export const AttributeRectangles = ({ categories }) => {
    // Function to determine the arrow based on the first number
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
        {Object.entries(categories).map(([category, {firstNum, secondNum}]) => (
          <div key={category} style={{
            backgroundColor: getColor(secondNum),
            padding: '10px',
            width: '150px',
            textAlign: 'center',
            color: 'black',
            fontWeight: 'bold',
            border: '1px solid #ccc'
          }}>
            {category}: {getArrow(firstNum)}
          </div>
        ))}
      </div>
    );
  };
  
//   export default AttributeRectangles;
//   export default Game;
