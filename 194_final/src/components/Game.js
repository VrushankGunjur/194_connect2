import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this import according to your Firebase config file's location

function Game() {
  const [randomUser, setRandomUser] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchRandomUser = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => doc.data());
      if (users.length > 0) {
        const randomIndex = Math.floor(Math.random() * users.length);
        setRandomUser(users[randomIndex]);
      }
    };

    fetchRandomUser();
  }, []);
  console.log(randomUser)

  const handleGuessSubmit = (event) => {
    event.preventDefault();
    if (guess.toLowerCase() === randomUser['FirstName'].toLowerCase()) {
      setFeedback('Correct! You guessed the right user.');
    } else {
      setFeedback('Incorrect guess. Try again!');
    }
  };

  const handleGuessChange = (event) => {
    setGuess(event.target.value);
  };

  return (
    <div>
      <h2>Guess the User's Name</h2>
      {randomUser ? (
        <>
          <p>Can you guess the name of the user?</p>
          <form onSubmit={handleGuessSubmit}>
            <input
              type="text"
              value={guess}
              onChange={handleGuessChange}
              placeholder="Enter your guess"
            />
            <button type="submit">Guess</button>
          </form>
          {feedback && <p>{feedback}</p>}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Game;