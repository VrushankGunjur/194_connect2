import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { query, collection, orderBy, onSnapshot, limit } from "firebase/firestore";
import Message from "./Message";
import SendMessage from "./SendMessage";
import '../styles/ChatBox.css'; // Ensure this path is correct

const ChatBox = ({ userId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    let q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.createdAt - b.createdAt);

      if (userId && otherUserId) {
        // Client-side filtering for messages between userId and otherUserId
        fetchedMessages = fetchedMessages.filter(message => 
          (message.senderId === userId && message.receiverId === otherUserId) ||
          (message.senderId === otherUserId && message.receiverId === userId));
      }

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [userId, otherUserId]);

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className={`chat-box ${isMinimized ? 'minimized' : ''}`}>
      <div className="toggle-chat" onClick={toggleMinimize}>
        {isMinimized ? 'Expand' : 'Minimize'}
      </div>
      {!isMinimized && (
        <div className="messages-wrapper">
          {messages.map(message => (
            // Pass an additional prop to Message to indicate if it's from the current user
            <Message key={message.id} message={message} isCurrentUser={message.senderId === userId} />
          ))}
          <span ref={scrollRef}></span>
        </div>
      )}
      <SendMessage scroll={scrollRef} userId={userId} otherUserId={otherUserId} />
    </main>
  );
};

export default ChatBox;
