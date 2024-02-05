// import React, { useEffect, useRef, useState } from "react";
// import {
//   query,
//   collection,
//   orderBy,
//   onSnapshot,
//   limit,
//   getDocs,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import Message from "./Message";
// import SendMessage from "./SendMessage";

// export default function Game() {
//   // Set up
//   const [validGuesses, setValidGuesses] = useState([]);
//   const [guesses, setGuesses] = useState([]);
//   const [correctGuess, setCorrectGuess] = useState(false);
//   let user = null;
//   let querySnapshot = null;


//   // Get a random person from the database
//   useEffect(() => {
//     FetchRandomPerson();
//   }, []);

//   const FetchRandomPerson = () => {
//     querySnapshot = getDocs(query(collection(db, "users")));
//     user = querySnapshot.then(r => user = r.docs[Math.floor(Math.random() * 5)].data());
//     setGuesses(true)
//   }

//   // get a random person from database
  
//   console.log(user['FirstName']);

//   // Populate valid guesses, guesses made, etc.

//   // Now you have an array of user data in validGuesses
//   // You can iterate through it to get the first names

// })









//   return (<p>hello</p>)
//   // return (
//   //     <main className="chat-box">
//   //         <div className="messages-wrapper">
//   //             {messages?.map((message) => (
//   //                 <Message key={message.id} message={message} />
//   //             ))}
//   //         </div>
//   //         {/* when a new message enters the chat, the screen scrolls down to the scroll div */}
//   //         <span ref={scroll}></span>
//   //         <SendMessage scroll={scroll} />
//   //     </main>
//   // );
// };