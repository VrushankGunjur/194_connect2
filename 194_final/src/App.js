import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";
import NavBar from "./components/NavBar";
import ChatBox from "./components/ChatBox";
import Welcome from "./components/Welcome";
// import Game from "./components/Game";
import UserDropDown from "./components/UserDropDown";
import UserForm from "./components/UserForm"
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <NavBar />
      {!user ? (
        <Welcome />
      ) : (
        <>
          <UserDropDown/>
          <UserForm/>
        </>
      )}
    </div>
  );
}

export default App;