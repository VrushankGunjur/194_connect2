import React from 'react';
import '../styles/ResultsTable.css' // Make sure to import the CSS file

const ResultsTable = ({ users, correctGuessId }) => {
  console.log(correctGuessId)
  const defaultURL = "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea";
  return (
    <table className="resultsTable">
      <thead>
        <tr>
          <th>Photo</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Age</th>
          <th>Ethnicity</th>
          <th>Favorite Color</th>
          <th>Favorite Sport</th>
          <th>Gender</th>
          <th>Height</th>
          <th>Home State</th>
          <th>Major</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} style={{ backgroundColor: user.id === correctGuessId ? '#90EE90' : '' }}>
            <td><img src={user.ProfilePhotoURL ? user.ProfilePhotoURL : defaultURL} alt="Profile" className="profilePic"/></td>
            <td>{user.FirstName}</td>
            <td>{user.LastName}</td>
            <td>{user.Age}</td>
            <td>{user.Ethnicity}</td>
            <td>{user.FavoriteColor}</td>
            <td>{user.FavoriteSport}</td>
            <td>{user.Gender}</td>
            <td>{user.Height}</td>
            <td>{user.HomeState}</td>
            <td>{user.Major}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable;
