import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase.js";
import "../styles/Game.css";
import ChatBox from "./ChatBox.js"; // Adjust the path as necessary
import GameDropDown from "./GameDropDown.js";
import ResultsTable from "./ResultsTable.js";

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

//https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceLatLong(lat1, lon1, lat2, lon2) {
    // uses Haversine formula for great-circle distances, returns distance in miles

    const R = 3958.8; // radius of the Earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getCompassDir(lat1, long1, lat2, long2, headX) {
    
    var dLat = lat2-lat1;
    var dLon = long2-long1;

    var radians = Math.atan2(dLon, dLat); 
    var compassReading = radians * (180 / Math.PI);
    var coordNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    var coordIndex = Math.round(compassReading / 45);
    if (coordIndex < 0) {
        coordIndex = coordIndex + 8
    };

    return coordNames[coordIndex];
}

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
  let colorCutoffsNum = {
    Age: 1,
    Height: 3,
  };

  // normalization factors for numerical attributes -- should be the max difference possible in each attribute.
  let normals = {
    Age: 30,
    Height: 36,
    Dist: 12432,
  };

  let colorCutoffsWord = {
    FirstName: 0,
    LastName: 0,
    Gender: 5,
    Ethnicity: 10,
    //FavoriteColor: 20,
    FavoriteSport: 20,
    //HomeState: 10,
    Major: 10,
  };

  let colorVals = {
    Red: [255, 0, 0],
    Orange: [255, 87, 51],
    Yellow: [255, 255, 0],
    Green: [0, 255, 0],
    Blue: [0, 0, 255],
    Purple: [160, 32, 240],
    Pink: [255, 192, 203],
    Brown: [150, 75, 0],
    White: [255, 255, 255],
    Black: [0, 0, 0],
    Gray: [128, 128, 128],
  };

  let majorVals = {
    "Education": 0.010752688172043012,
    "Dance (TAPS Minor)": 0.021505376344086023,
    "Comparative Literature": 0.03225806451612903,
    "Anthropology": 0.043010752688172046,
    "Sociology": 0.053763440860215055,
    "Community Health and Prevention Research": 0.06451612903225806,
    "English": 0.07526881720430108,
    "Art History": 0.08602150537634409,
    "Art Practice": 0.0967741935483871,
    "Communication": 0.10752688172043011,
    "Gender, and Sexuality Studies": 0.11827956989247312,
    "Chicana/o - Latina/o Studies": 0.12903225806451613,
    "French": 0.13978494623655913,
    "Women's Studies": 0.15053763440860216,
    "Global Studies": 0.16129032258064516,
    "History": 0.17204301075268819,
    "Psychology": 0.1827956989247312,
    "Theater and Performance Studies": 0.1935483870967742,
    "Religious Studies": 0.20430107526881722,
    "Philosophy": 0.21505376344086022,
    "Linguistics": 0.22580645161290322,
    "Spanish": 0.23655913978494625,
    "Classics": 0.24731182795698925,
    "Comparative Studies in Race and Ethnicity": 0.25806451612903225,
    "Environmental Systems Engineering": 0.26881720430107525,
    "Political Science": 0.27956989247311825,
    "International Relations": 0.2903225806451613,
    "American Studies": 0.3010752688172043,
    "Film and Media Studies": 0.3118279569892473,
    "Digital Humanities": 0.3225806451612903,
    "German Studies": 0.3333333333333333,
    "Italian": 0.34408602150537637,
    "Jewish Studies": 0.3548387096774194,
    "Asian American Studies": 0.3655913978494624,
    "East Asian Studies": 0.3763440860215054,
    "Middle Eastern Language, Literature and Culture": 0.3870967741935484,
    "Iranian Studies": 0.3978494623655914,
    "Islamic Studies": 0.40860215053763443,
    "Korean": 0.41935483870967744,
    "Japanese": 0.43010752688172044,
    "Latin American Studies": 0.44086021505376344,
    "Iberian and Latin American Cultures": 0.45161290322580644,
    "International Policy Studies": 0.46236559139784944,
    "International Security Studies": 0.4731182795698925,
    "Chinese Studies": 0.4838709677419355,
    "Russian Studies": 0.4946236559139785,
    "Slavic Languages and Literatures": 0.5053763440860215,
    "Portuguese": 0.5161290322580645,
    "African Studies": 0.5268817204301075,
    "African and African American Studies": 0.5376344086021505,
    "Urban Studies": 0.5483870967741935,
    "Atmospheric / Energy": 0.5591397849462365,
    "Earth Systems": 0.5698924731182796,
    "Sustainability": 0.5806451612903226,
    "Bioengineering": 0.5913978494623656,
    "Biology": 0.6021505376344086,
    "Biomechanical Engineering": 0.6129032258064516,
    "Biomedical Computation": 0.6236559139784946,
    "Chemistry": 0.6344086021505376,
    "Chemical Engineering": 0.6451612903225806,
    "Materials Science and Engineering": 0.6559139784946236,
    "Mechanical Engineering": 0.6666666666666666,
    "Data Science": 0.6774193548387096,
    "Aerospace Engineering": 0.6881720430107527,
    "Applied and Engineering Physics": 0.6989247311827957,
    "Physics": 0.7096774193548387,
    "Computer Science": 0.7204301075268817,
    "Electrical Engineering": 0.7311827956989247,
    "Management Science and Engineering": 0.7419354838709677,
    "Mathematics": 0.7526881720430108,
    "Statistics": 0.7634408602150538,
    "Engineering Physics": 0.7741935483870968,
    "Product Design": 0.7849462365591398,
    "Ethics in Society": 0.7956989247311828,
    "Democracy, Development, and the Rule of Law": 0.8064516129032258,
    "Energy Resources Engineering": 0.8172043010752689,
    "Honors in the Arts": 0.8279569892473119,
    "Music, Science, and Technology": 0.8387096774193549,
    "Philosophy and Religious Studies": 0.8494623655913979,
    "Public Policy": 0.8602150537634409,
    "Science, Technology, and Society": 0.8709677419354839,
    "Translation Studies": 0.8817204301075269,
    "Laboratory Animal Science": 0.8924731182795699,
    "Medieval Studies": 0.9032258064516129,
    "Native American Studies": 0.9139784946236559,
    "Symbolic Systems": 0.9247311827956989,
    "South Asian Studies": 0.9354838709677419,
    "Modern Languages": 0.946236559139785,
    "Human Rights": 0.956989247311828,
    "Modern Thought and Literature": 0.967741935483871,
    "Music": 0.978494623655914,
    "Turkish Studies": 0.989247311827957,
    "Human Biology": 1.0,
  };

  let resState = {};

  for (const key in trueState) {
    // rename diff to 'hints'
    let diff = { dir: 2, color: 1, r: 2, g: 2, b: 2 , dist: 0, compassDir: ''};
    if (key === "Major") {
      let d = Math.abs(majorVals[trueState[key]] - majorVals[guessState[key]]);
      diff.color = 1 - d;
    } else if (key === "ProfilePhotoURL") {
      diff.ProfilePhotoURL = trueState.ProfilePhotoURL;
      if (trueState.id === guessState.id) {
        diff.color = 1;
      } else {
        diff.color = 0;
      }
    } else if (key === "FavoriteColor") {
      let trueColor = trueState.FavoriteColor;
      let guessColor = guessState.FavoriteColor;
      let trueColorRGB = colorVals[trueColor];
      let guessColorRGB = colorVals[guessColor];
      let diffColor = Math.sqrt(
        Math.pow(trueColorRGB[0] - guessColorRGB[0], 2) +
          Math.pow(trueColorRGB[1] - guessColorRGB[1], 2) +
          Math.pow(trueColorRGB[2] - guessColorRGB[2], 2),
      );
      diff.color = 1 - diffColor / 441.6729559300637; // magic number is the max denominator, srqt(255^2 + 255^2 + 255^2)

      // set r, g, and b arrows
      diff.r = trueColorRGB[0] < guessColorRGB[0] ? 0 : 1;
      diff.g = trueColorRGB[1] < guessColorRGB[1] ? 0 : 1;
      diff.b = trueColorRGB[2] < guessColorRGB[2] ? 0 : 1;
      diff.r = trueColorRGB[0] === guessColorRGB[0] ? 3 : diff.r;
      diff.g = trueColorRGB[1] === guessColorRGB[1] ? 3 : diff.g;
      diff.b = trueColorRGB[2] === guessColorRGB[2] ? 3 : diff.b;
    } else if (key === "HomeState") {
        // guessState is actually the randomly chosen match (?)
        const trueLat = Number(trueState.HomeState.split(',')[2]);
        const trueLong = Number(trueState.HomeState.split(',')[3]);
        const guessLat = Number(guessState.HomeState.split(',')[2]);
        const guessLong = Number(guessState.HomeState.split(',')[3]);
        
        // can't just take vec dist since earth is spherical and wraps around
        const dist = getDistanceLatLong(trueLat, trueLong, guessLat, guessLong);
        diff.color = 1 - dist / normals.Dist;
        diff.dist = dist.toFixed(2);

        // set diff.compassDir
        diff.compassDir = getCompassDir(trueLat, trueLong, guessLat, guessLong);
        //console.log(diff.compassDir);
        console.log(guessState.HomeState);
    } else if (key in colorCutoffsWord) {
      if (trueState[key] !== guessState[key]) {
        diff.color = 0;
      } else {
        diff.color = 1;
      }
    } else if (key in colorCutoffsNum) {
      // set direction
      if (trueState[key] < guessState[key]) {
        diff.dir = 0;
      } else if (trueState[key] > guessState[key]) {
        diff.dir = 1;
      } else {
        diff.dir = 3;
      }

      diff.color =
        1 - Math.abs(guessState[key] - trueState[key]) / normals[key];
    }

    resState[key] = diff;
  }

  return resState;
}

export function Game({ currUserGroup }) {
  const [randomUser, setRandomUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessedUsers, setGuessedUsers] = useState([]);
  const [dispUsers, setDispUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [remainingGuesses, setRemainingGuesses] = useState(20);
  const [allowedGuesses, setAllowedGuesses] = useState(20);
  const [propRemainingGuesses, setPropRemainingGuesses] = useState(100);

  let dispFeatures = [
    "ProfilePhotoURL",
    "FirstName",
    "LastName",
    "Age",
    "Ethnicity",
    "FavoriteColor",
    "FavoriteSport",
    "Gender",
    "Height",
    "HomeState",
    "Major",
  ];

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

    setFeedback(null);
    setGameFinished(false);
    setGuessedUsers([]);
    setDispUsers([]);

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        const usersData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            fullName: `${doc.data().FirstName} ${doc.data().LastName}`, // Concatenate for display
            formattedHeight: formatHeight(doc.data().Height), // Convert Height to feet and inches
          }))
          .filter(
            (user) =>
              user.NewUser === false &&
              user.id !== currentUserId &&
              user.Group.includes(currUserGroup),
          );

        setUsers(usersData);
        if (usersData.length < 40) {
          setAllowedGuesses(Math.ceil(usersData.length/2));
          setRemainingGuesses(Math.ceil(usersData.length/2));
        }
        if (usersData.length > 0) {
          const randomIndex = Math.floor(Math.random() * usersData.length);
          setRandomUser(usersData[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setFeedback("Failed to load users.");
      }
    };

    fetchUsers();
  }, [currentUserId, currUserGroup]); // Re-run when currentUserId changes

  // Helper function to convert height from inches to feet and inches format
  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`; // Format as X'Y"
  };

  const handleGuessChange = (selectedOption) => {
    setSelectedUserId(selectedOption ? selectedOption.value : "");
  };

  const handleGuessSubmit = (event) => {
    event.preventDefault();

    // call diff on guessedUser and randomUser
    // call AttributeRectangles on output of diff
    // return the output of AttributeRectangles in the HTML component

    const guessedUser = users.find((user) => user.id === selectedUserId);
    if (guessedUser) {
      if (randomUser && selectedUserId === randomUser.id) {
        setFeedback(
          "You matched with " + randomUser.fullName + "! Feel free to chat!",
        );
        setGameFinished(true);
        setGuessedUsers([]);
      } else if (randomUser && remainingGuesses === 1) {
        setRemainingGuesses(remainingGuesses - 1);
        setPropRemainingGuesses(100 * ((remainingGuesses - 1)/allowedGuesses));
        setFeedback('Incorrect guess. You have run out of guesses!');
        setGameFinished(true);
        setGuessedUsers([]);
      } else {
        setRemainingGuesses(remainingGuesses - 1);
        setPropRemainingGuesses(100 * ((remainingGuesses - 1)/allowedGuesses));
        setUsers(users.filter((user) => user.id !== selectedUserId));
        setFeedback("Incorrect guess. Try again!");
      }
      // Add the guessed user with all formatted traits to the guessedUsers array

      setGuessedUsers([...guessedUsers, guessedUser]);
      let resDiffs = diff(guessedUser, randomUser);
      let dispUser = {};
      for (const key of dispFeatures) {
        dispUser[key] = {};
        dispUser[key].data = guessedUser[key];
        if (key === "Height") {
          dispUser[key].data = formatHeight(guessedUser[key]);
        } else if (key === "HomeState") {
            const state = guessedUser[key].split(',');
            dispUser[key].data = state[0] + ', ' + state[1];
        }
        dispUser[key].disp = resDiffs[key];
      }
      setDispUsers([...dispUsers, dispUser]); // append the new user to the list of guessed users
    }
    setSelectedUserId(""); // Reset for next guess
  };
  return (
    <div className="gameContainer">
      {currUserGroup && users.length === 0 && !gameFinished ? (
        <>
          <h2 className="header">
            No users in group {currUserGroup}! Invite others to join.
          </h2>
        </>
      ) : randomUser ? (
        <>
          {!gameFinished && (
            <>
              <h2 className="header">Guess Your Match!</h2>
            </>
          )}
          {guessedUsers.length > 0 && (
            <>
              <ResultsTable
                users={guessedUsers}
                correctGuessId={randomUser.id}
                dispUsers={dispUsers}
              />
              {gameFinished && (
                <ChatBox userId={currentUserId} otherUserId={randomUser.id} />
              )}
            </>
          )}
          {!gameFinished && (
            <>
              <form onSubmit={handleGuessSubmit} className="formStyle">
                <GameDropDown
                  users={users}
                  onChange={handleGuessChange}
                  value={selectedUserId}
                />
                <br />
                <button type="submit" className="guessButton">
                  Guess
                </button>
              </form>
            </>
          )}
          <br />
          {feedback && <p className="header">{feedback}</p>}
          <p className="header">Guesses Remaining: {remainingGuesses}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${100 - propRemainingGuesses}%` }} />
          </div> 
          <h2 className="Extra Spacing" style={{ margin: '20px 0', color: 'rgba(0, 0, 0, 0)' }}>⠀</h2>
          {remainingGuesses === 0 && randomUser && (
            <h2 className="bottom-header" style={{ fontSize: '40px', color: 'white' }}>
              Your Match Was: {randomUser.fullName}
            </h2>
          )}
        </>
      ) : (
        // Show an error page
        <h2 className="header">There is an error, please reload the page!</h2>
      )}
    </div>
  );
}

export default Game;
