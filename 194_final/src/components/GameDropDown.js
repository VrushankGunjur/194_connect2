import React from 'react';
import Select from 'react-select';

const GameDropDown = ({ users, onChange, value }) => {
  // Map users to options for React Select
  const options = users.map((user) => ({
    value: user.id, // Assuming each user has a unique `id` property
    label: user.fullName, // Assuming each user has a `fullName` property
    photoURL: user.ProfilePhotoURL ? user.ProfilePhotoURL : "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea"
  }));


  // Define a custom option component to display the image and label
  const formatOptionLabel = ({ value, label, photoURL }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={photoURL} alt={label} style={{ marginRight: 10, width: 25, height: 25, borderRadius: '50%' }} />
      {label}
    </div>
  );

  // Handle selection changes
  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  // Find the currently selected option based on the `value` prop
  const selectedOption = options.find(option => option.value === value);

  return (
    <Select
      options={options}
      onChange={handleChange}
      formatOptionLabel={formatOptionLabel}
      value={selectedOption}
      isClearable={true}
      isSearchable={true}
    />
  );
};

export default GameDropDown;
