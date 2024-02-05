import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from "../firebase";

export const Game = () => {
    console.log("starting game")
    // const [validGuesses, setValidGuesses] = useState([]);
    // const [guesses, setGuesses] = useState([]);
    // const [correctGuess, setCorrectGuess] = useState(false);
    //const [users, setUsers] = useState([]);
    // let user = null;
    // let data = null;

    console.log("fetching users ")
    // useEffect(() => {
    //     const fetchUsers = () => {
    //         const data = getDocs(query(collection(db, "users")));
    //         data.then(r => setUsers(r.docs[Math.floor(Math.random() * 5)].data()));
    //     };

    //     fetchUsers();
    // }, []);
    
    console.log("fetched users ")
    // console.log(users);

    return (
        <div>
          <h1>This is my component!</h1>
          <p>It is a simple component that renders a heading and a paragraph.</p>
        </div>
      );
};