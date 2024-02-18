// import React, { useEffect, useState, useRef } from 'react';
// import { db } from '../firebase';
// import { query, collection, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
// import Message from './Message';
// import SendMessage from './SendMessage';

// const ChatGroup = ({ userId, otherUserId }) => {
//   const [messages, setMessages] = useState([]);
//   const [chatGroupId, setChatGroupId] = useState(null);
//   const scrollRef = useRef();

//   useEffect(() => {
//     const q = query(
//       collection(db, "messages"),
//       orderBy("createdAt"),
//       limit(50)
//     );

//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const fetchedMessages = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setMessages(fetchedMessages);
//     });

//     return () => unsubscribe(); // Cleanup on unmount
//   }); // Depend on chatGroupId

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div className="chat-group">
//       <div className="messages">
//         {messages.map(message => (
//           <Message key={message.id} message={message} />
//         ))}
//         {/* <div ref={scrollRef}></div> For auto-scrolling */}
//       </div>
//       {chatGroupId && <SendMessage userId={userId}  otherUserId={otherUserId}/>}
//     </div>
//   );
// };

// export default ChatGroup;
