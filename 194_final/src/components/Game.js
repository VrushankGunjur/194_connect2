import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import UserForm from './UserForm';
import GameDropDown from './GameDropDown.js';
import ResultsTable from './ResultsTable.js';
import ChatBox from './ChatBox'; // Adjust the path as necessary
import "../styles/Game.css";


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
    let diff = { dir: 2, color: 1 };

    if (key == "ProfilePhotoURL") {
      diff.ProfilePhotoURL = trueState.ProfilePhotoURL;
      if (trueState.id === guessState.id) {
        diff.color = 1;
      } else {
        diff.color = 0;
      }
    } else if (colorCutoffs[key] === '') {
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
  const [showChatBox, setShowChatBox] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);




  let dispFeatures = ["ProfilePhotoURL", "FirstName", "LastName", "Age", "Ethnicity", "FavoriteColor", "FavoriteSport", "Gender", "Height", "HomeState", "Major"];

  // Your existing handler functions remain unchanged

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Use 'uid' instead of 'id'
      } else {
        // User is signed out
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This ensures fetchUsers only runs after currentUserId is set (i.e., not null)
    if (currentUserId === null) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fullName: `${doc.data().FirstName} ${doc.data().LastName}`, // Concatenate for display
          formattedHeight: formatHeight(doc.data().Height), // Convert Height to feet and inches
        }))
          .filter(user => user.NewUser === false && user.id !== currentUserId);

        console.log("current user id is " + currentUserId);
        console.log(usersData);
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
  }, [currentUserId]); // Re-run when currentUserId changes


  // Helper function to convert height from inches to feet and inches format
  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`; // Format as X'Y"
  };

  const handleGuessChange = (selectedOption) => {
    setSelectedUserId(selectedOption ? selectedOption.value : '');
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
        setShowChatBox(true);
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
        if (key === "Height") { dispUser[key].data = formatHeight(guessedUser[key]); }
        dispUser[key].disp = resDiffs[key];
      }
      setDispUsers([...dispUsers, dispUser]);
    }
    setSelectedUserId(''); // Reset for next guess
  };
  return (
    <div className="gameContainer">
      
      {randomUser && users.length > 0 && !showChatBox && (
        <>
          <h2 className="header">Guess the User's Name</h2>
          <p className="description">Can you guess the name of the user?</p>
          <form onSubmit={handleGuessSubmit} className="formStyle">
            <GameDropDown users={users} onChange={handleGuessChange} value={selectedUserId} />
            <button type="submit" className="guessButton">Guess</button>
          </form>
          {feedback && <p className="feedback">{feedback}</p>}
        </>
      )}
      {guessedUsers.length > 0 && (
        <>
          {showChatBox && <h2 className="header">{feedback}</h2>}
          <h3 className="subheader">Guessed Users:</h3>
          <ResultsTable users={guessedUsers} correctGuessId={randomUser.id} dispUsers={dispUsers} />
          {showChatBox && <ChatBox userId={currentUserId} otherUserId={randomUser.id} />}
        </>
      )}
    </div>
  );
}

export default Game;