import React, { useEffect, useRef, useState } from "react";
import {
    query,
    collection,
    orderBy,
    onSnapshot,
    limit,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import Message from "./Message";
import SendMessage from "./SendMessage";

export default async function Game() {

    // get a random person from database
    let user = null;
    user = await getDocs(query(collection(db, "users"))).then(r => user = r.docs[Math.floor(Math.random() * 5)].data());
    console.log(user['FirstName']);

    // Populate valid guesses, guesses made, etc.c


    const [validGuesses, setValidGuesses] = useState([]);
    const [guesses, setGuesses] = useState([]);
    

    
    
    

    


    return (<p>hello</p>)
    // return (
    //     <main className="chat-box">
    //         <div className="messages-wrapper">
    //             {messages?.map((message) => (
    //                 <Message key={message.id} message={message} />
    //             ))}
    //         </div>
    //         {/* when a new message enters the chat, the screen scrolls down to the scroll div */}
    //         <span ref={scroll}></span>
    //         <SendMessage scroll={scroll} />
    //     </main>
    // );
};