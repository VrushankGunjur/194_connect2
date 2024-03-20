import React from "react";
import Select from "react-select";
import "../styles/GameDropDown.css";

const defaultPhotoURL = "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea"

const GameDropDown = ({ users, onChange, value }) => {
  const options = users.map((user) => ({
    value: user.id, 
    label: user.fullName, 
    photoURL: user.ProfilePhotoURL
      ? user.ProfilePhotoURL
      : defaultPhotoURL,
  }));

  const formatOptionLabel = ({ value, label, photoURL }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={photoURL}
        alt={label}
        style={{ marginRight: 10, width: 25, height: 25, borderRadius: "50%" }}
      />
      {label}
    </div>
  );

  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div>
      <br></br>
      <br></br>
      <Select
        className="gameDropDown"
        options={options}
        onChange={handleChange}
        formatOptionLabel={formatOptionLabel}
        value={selectedOption}
        isClearable={true}
        isSearchable={true}
      />
    </div>
  );
};

export default GameDropDown;
