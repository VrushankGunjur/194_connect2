import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/AddGroup.css';

const AddGroup = ({ user, onGroupChange }) => {
  const [groupCode, setGroupCode] = useState('');
  const navigate = useNavigate();

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      alert("Please enter a valid group code.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupCode);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        alert("No group found with the provided code.");
        return;
      }

      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        Group: arrayUnion(groupCode),
      });
      alert("Successfully joined the group!");
      onGroupChange();
      navigate(`/group-info/${groupCode}`);
      window.location.reload(); 
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join the group. Please try again.");
    }
  };

  return (
    <div className="add-group-page">
      <div className="container">
        <h2 className="title">Join an Existing Group</h2>
        <input
          className="group-code-input"
          type="text"
          placeholder="Enter Group Code"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
        />
        <div className="buttons">
          <button className="join-button" onClick={handleJoinGroup}>Join Group</button>
          <button className="cancel-button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroup;
