import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import "../styles/GroupInfo.css";

const defaultPhotoURL = "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea"


const GroupInfo = ({ user, onGroupChange }) => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [membersInfo, setMembersInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupAndValidateMember = async () => {
      setLoading(true);
      try {
        // Fetch the group details
        const groupRef = doc(db, "groups", groupCode);
        const groupSnap = await getDoc(groupRef);

        // Check if the group exists
        if (!groupSnap.exists()) {
          setError("Group not found.");
          navigate('/'); // Or navigate to an error page or dashboard
          return;
        }

        // Validate if the current user is a member of the group
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().Group.includes(groupCode)) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() });
          await fetchMembersInfo(groupSnap.data().members);
        } else {
          setError("You do not have access to this group.");
          // Optionally, navigate away or just set an error message
          navigate('/');
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load group.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGroupAndValidateMember();
    } else {
      setError("You must be signed in to view this page.");
      navigate('/login'); // Adjust as needed
    }
  }, [user, groupCode, navigate]);

  const leaveGroup = async () => {
    try {
      // Remove user from group's members and possibly admin array
      await updateDoc(doc(db, "groups", groupCode), {
        members: arrayRemove(user.uid),
        // Only remove from admin array if they are in it
        ...(group.admin.includes(user.uid) && { admin: arrayRemove(user.uid) }),
      });

      // Remove group code from user's Group field
      await updateDoc(doc(db, "users", user.uid), {
        Group: arrayRemove(groupCode),
      });
      onGroupChange(); // Trigger group change
      alert("You have left the group.");
      navigate('/'); // Navigate the user away from the group page, perhaps to a dashboard or home
      window.location.reload();
    } catch (error) {
      console.error("Error leaving the group:", error);
      alert("Failed to leave the group. Please try again.");
    }
  };

  const promoteToAdmin = async (userId) => {
    if (!user) {
      console.error("No user logged in.");
      return;
    }

    // Ensure the current user is an admin of the group before proceeding.
    if (!group.admin.includes(user.uid)) {
      alert("You're not authorized to promote members to admin.");
      return;
    }

    // Ensure the user to be promoted is a member of the group.
    if (!group.members.includes(userId)) {
      alert("The user to be promoted is not a member of the group.");
      return;
    }

    try {
      // Reference to the group document.
      const groupRef = doc(db, "groups", groupCode);

      // Add the user to the group's 'admin' field.
      await updateDoc(groupRef, {
        admin: arrayUnion(userId),
      });


      alert("User promoted to admin successfully.");
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      alert("Failed to promote user to admin.");
    }
  };



  const fetchMembersInfo = async (members) => {
    try {
      const memberDocs = await Promise.all(
        members.map(memberId => getDoc(doc(db, "users", memberId)))
      );
      const membersData = memberDocs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembersInfo(membersData);
    } catch (error) {
      console.error("Error fetching members' info:", error);
      setError("Failed to load members' information.");
    }
  };

  const removeUser = async (userId) => {
    if (!user) {
      console.error("No user logged in.");
      return;
    }

    // Ensure the current user is an admin of the group before proceeding.
    if (!group.admin.includes(user.uid)) {
      alert("You're not authorized to remove members.");
      return;
    }

    try {
      // Reference to the group document.
      const groupRef = doc(db, "groups", groupCode);

      // Remove the user from the group's 'admin' and 'members' fields if present.
      await updateDoc(groupRef, {
        admin: arrayRemove(userId),
        members: arrayRemove(userId),
      });

      // Reference to the user document to be removed from the group.
      const userToRemoveRef = doc(db, "users", userId);

      // Remove the group's code from the user's 'Group' field.
      await updateDoc(userToRemoveRef, {
        Group: arrayRemove(groupCode),
      });

      console.log("updated user doc")

      // Optionally, update the local state to reflect these changes without needing to refetch.
      setGroup(prevGroup => ({
        ...prevGroup,
        admin: prevGroup.admin.filter(id => id !== userId),
        members: prevGroup.members.filter(id => id !== userId),
      }));

      console.log("updated group doc")

      // Update membersInfo state to reflect the removal.
      setMembersInfo(prevMembers => prevMembers.filter(member => member.id !== userId));

      alert("User removed successfully.");
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Failed to remove user.");
    }
  };


  return (
    <div className="group-info-container">
      <h1 className="group-info-header">Group Info</h1>
      {group && (
        <>
          <div className="group-info-content">
            <p className="group-name">Group Name: {group.name}</p>
            <p className="group-code">Invite Code: {group.code}</p>
            <ul className="members-list">
              Members:
              {membersInfo.map((member) => (
                <li key={member.id} className="member-item">
                  <img
                    src={member.ProfilePhotoURL || defaultPhotoURL}
                    alt={`${member.FirstName} ${member.LastName}`}
                    className="member-profile-picture"
                  />
                  {member.FirstName} {member.LastName}
                  {group.admin.includes(member.id) && (
                    <span className="admin-indicator">(Admin)</span>
                  )}
                  <div className="button-container">
                    {user && group.admin.includes(user.uid) && !group.admin.includes(member.id) && (
                      <button onClick={() => promoteToAdmin(member.id)} className="promote-button">Promote</button>
                    )}
                    {user && group.admin.includes(user.uid) && member.id !== user.uid && (
                      <button onClick={() => removeUser(member.id)} className="remove-button">Remove</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {/* Leave Group Button - Do not show if the user is the only admin */}
            {user && group.members.includes(user.uid) && (
              // if !(group.admin.length === 1 && group.admin.includes(user.uid)) then show the leave group button else show another button
              !(group.admin.length === 1 && group.admin.includes(user.uid)) ? (
                <button onClick={leaveGroup} className="leave-group-button">Leave Group</button>
              ) : (
                <button onClick={leaveGroup} className="delete-group-button">Delete Group</button>
              )
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default GroupInfo;
