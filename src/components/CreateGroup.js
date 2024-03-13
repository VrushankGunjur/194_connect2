// CreateGroup.js
import React, { useState } from 'react';
import { doc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path matches your project structure
import { useNavigate } from 'react-router-dom'; // For navigation after group creation
import '../styles/CreateGroup.css'; // Assuming you create a separate CSS file for this component

const generateUniqueCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CreateGroup = ({ user, onGroupChange }) => {
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate(); // Use this for redirecting after creating the group

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    const groupCode = generateUniqueCode();
    try {
      const groupRef = doc(db, "groups", groupCode);
      await setDoc(groupRef, {
        name: groupName,
        code: groupCode,
        members: [user.uid],
        admin: [user.uid]
      });

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        Group: arrayUnion(groupCode),
      });
      onGroupChange(); // Call the function to indicate group change
      navigate(`/group-info/${groupCode}`);
      window.location.reload(); 
    } catch (error) {
      console.error("Error creating new group:", error);
    }
    navigate(`/group-info/${groupCode}`);
  };

  return (
    <div className="create-group-page">
      <div className="container">
        <h2 className="title">Create New Group</h2>
        <input
          className="group-name-input"
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="buttons">
          <button className="create-button" onClick={handleCreateGroup}>Create Group</button>
          <button className="cancel-button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
