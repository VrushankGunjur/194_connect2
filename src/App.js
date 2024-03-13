// Import necessary elements from react-router-dom
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Game } from './components/Game';
import LoadingPage from './components/LoadingPage';
import NavBar from './components/NavBar';
import UserForm from './components/UserForm';
import Welcome from './components/Welcome';
import UserProfile from './components/ProfilePage';
import { auth, db } from './firebase';
import './styles/App.css';
import CreateGroup from './components/CreateGroup';
import GroupInfo from './components/GroupInfo';
import AddGroup from './components/AddGroup';

function App() {
  const [user, loadingAuth] = useAuthState(auth);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loadingUserCheck, setLoadingUserCheck] = useState(true);
  const [currUserGroup, setCurrUserGroup] = useState('Global');
  const [updateProfile, setUpdateProfile] = useState(false);
  const [groupChangeTrigger, setGroupChangeTrigger] = useState(0); // Initialize a trigger counter
  

  // Function to be called to indicate group change
  const handleGroupChange = () => {
    setGroupChangeTrigger(prev => prev + 1); // Increment trigger to re-fetch groups
  };


  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loadingAuth && user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setIsNewUser(userDoc.data().NewUser);
        } else {
          setIsNewUser(true);
        }
      } else if (!loadingAuth) {
        setIsNewUser(false);
      }
      setLoadingUserCheck(false);
    };

    checkUserStatus();
  }, [user, loadingAuth]);

  if (loadingAuth || loadingUserCheck) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <div className="App">
        {user && (
          <NavBar
            currUserGroup={currUserGroup}
            setCurrUserGroup={setCurrUserGroup}
            isNewUser={isNewUser}
            updateProfileTrue={() => setUpdateProfile(true)}
            updateProfileFalse={() => setUpdateProfile(false)}
            fetchGroupsTrigger={groupChangeTrigger} 
            onGroupChange={handleGroupChange}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <Welcome onSignInComplete={setIsNewUser} />
              ) : isNewUser ? (
                <Navigate replace to="/user-form" />
              ) : updateProfile ? (
                <Navigate replace to="/profile" />
              ) : (
                <Navigate replace to="/game" />
              )
            }
          />
          <Route 
            path="/create-group" 
            element={<CreateGroup user={user}  onGroupChange={handleGroupChange}/>} 
          />
          <Route
            path="/user-form"
            element={<UserForm onFormSubmit={setIsNewUser} setIsNewUser={setIsNewUser} />}
          />
          <Route
            path="/profile"
            element={<UserProfile updateProfileFalse={() => setUpdateProfile(false)} />}
          />
          <Route
            path="/game"
            element={<Game currUserGroup={currUserGroup} />}
          />
          <Route 
            path="/group-info/:groupCode"
            element={<GroupInfo user={user} onGroupChange={handleGroupChange}/>} 
          />
          <Route path="/add-group" 
            element={<AddGroup user={user} onGroupChange={handleGroupChange}/>} 
          />

          {/* Redirect any unknown routes to the main page, adjust as necessary */}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
