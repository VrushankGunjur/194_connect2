import React from 'react';
import '../styles/ResultsTable.css'; // Make sure to import the CSS file

const ResultsTable = ({ guessedUsers, correctGuessId, dispUsers }) => {
    const defaultURL = "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea";

    // Function to determine the arrow based on the directionality value
    const getArrow = (value) => {
        switch (value) {
            case 0: return '↑';
            case 1: return '↓';
            case 2: return ''; // No arrow
            default: return ''; // Fallback, should not happen
        }
    };

    // Function to normalize the color value for background color
    const getBackgroundColor = (value) => {
        if (value === 0) return 'red';
        if (value === 1) return 'green';
        if (value === 0.5) return 'yellow';
        return "rgb(" + ((value) * 255) + ",0,0)";
        if (value <= 0.33) return 'red';
        if (value <= 0.66) return 'yellow';
        return 'green';
    };

    // Function to convert inches to feet and inches, if necessary
    function formatHeight(inches) {
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        return `${feet}'${remainingInches}"`;
    }

    // This function can be expanded to format other traits if necessary
    const formatTrait = (key, value) => {
        if (key === "Height") {
            // Assuming formatHeight is a function you have defined to format height 
            if (typeof (value) == "number") {
                return formatHeight(value);
            } else {
                return value;
            }
        } else if (key == "ProfilePhotoURL") {
            return <img src={value ? value : defaultURL}  alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />;
        }
        return value;
    };

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
                {dispUsers.map((user, index) => (
                    <tr key={index}>
                        {/* Iterate over other keys for user data */}
                        {Object.keys(user).map((key) => {
                            if (key == "ProfilePhotoURL") {
                                const backgroundColor = getBackgroundColor(user[key].disp.color);
                                return (
                                    <td key={key} style={{ backgroundColor: backgroundColor, color: '#000' }}>
                                        {formatTrait(key, user[key].data)}
                                        
                                    </td>
                                );
                            } else if (key !== "id") { // Exclude the id and ProfilePhotoURL from rendering as data cells
                                const traitValue = formatTrait(key, user[key].data);
                                const arrow = getArrow(user[key].disp.dir);
                                const backgroundColor = getBackgroundColor(user[key].disp.color);
                                return (
                                    <td key={key} style={{ backgroundColor: backgroundColor, color: '#000' }}> {/* Ensure text color is readable on all backgrounds */}
                                        {traitValue} {arrow}
                                    </td>
                                );
                            }
                            return null;
                        })}
                    </tr>
                ))}
            </tbody>

        </table>
    );
};

export default ResultsTable;
