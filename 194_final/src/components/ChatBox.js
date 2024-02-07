import React, { useEffect, useRef, useState } from "react";
import { query, collection, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../firebase";
import Message from "./Message";
import SendMessage from "./SendMessage";
import '../styles/ChatBox.css'; // Make sure this path is correct

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.createdAt - b.createdAt); // Ensure messages are sorted by createdAt
      setMessages(fetchedMessages);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Scroll to the latest message when the messages array updates
  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  return (
    <main className={`chat-box ${isMinimized ? 'minimized' : ''}`}>
      <div className="toggle-chat" onClick={toggleMinimize}>
        {isMinimized ? 'Expand' : 'Minimize'}
      </div>
      {!isMinimized && (
        <>
          <div className="messages-wrapper">
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
            {/* This empty span is used as a target to scroll into view */}
            <span ref={scrollRef}></span>
          </div>
          <SendMessage scroll={scrollRef} />
        </>
      )}
    </main>
  );
};

export default ChatBox;
