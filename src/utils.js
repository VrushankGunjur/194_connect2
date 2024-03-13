import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

/**
 * Finds or creates a chat group for two users and returns its ID.
 * 
 * @param {string} userId - The ID of the first user.
 * @param {string} otherUserId - The ID of the second user.
 * @returns {Promise<string>} The chat group ID.
 */
export async function getChatGroupId(userId, otherUserId) {
  const chatGroupsRef = collection(db, "chatGroups");

  // Create a query to find a chat group with both userId and otherUserId
  const q = query(chatGroupsRef, where("participants", "array-contains", userId));

  try {
    const querySnapshot = await getDocs(q);
    let chatGroupId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if both users are in the participants array
      if (data.participants.includes(userId) && data.participants.includes(otherUserId)) {
        chatGroupId = doc.id;
      }
    });

    // If a chat group exists, return its ID
    if (chatGroupId) return chatGroupId;

    // If not, create a new chat group
    const newChatGroupData = {
      participants: [userId, otherUserId],
      // Add any other initial data as needed
      createdAt: new Date() // Firestore timestamp if using Firebase 9+
    };

    const docRef = await addDoc(chatGroupsRef, newChatGroupData);
    return docRef.id; // Return the ID of the new chat group
  } catch (error) {
    console.error("Error getting or creating chat group:", error);
    throw new Error("Failed to get or create chat group.");
  }
}
