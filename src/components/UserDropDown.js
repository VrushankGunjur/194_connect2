
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";

const UserDropdown = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollectionRef = collection(db, "users");
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    fetchUsers();
  }, []);

  return (
    <select>
      <option value="">Select a User</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.FirstName} {user.LastName}
        </option>
      ))}
    </select>
  );
};

export default UserDropdown;
