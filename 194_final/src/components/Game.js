import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Game() {
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

export default Game;
