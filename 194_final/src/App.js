import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";
import NavBar from "./components/NavBar";
import ChatBox from "./components/ChatBox";
import { Game, AttributeRectangles } from "./components/Game";
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
          {/* <UserDropDown/> */}
          <Game/>
        </>
      )}
    </div>
  );
}

export default App;