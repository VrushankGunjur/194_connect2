import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import random

# Initialize the Firebase Admin SDK
cred = credentials.Certificate('./cs194-e95a9-firebase-adminsdk-2c109-76ac75a7fa.json')
firebase_admin.initialize_app(cred)

# Get a Firestore client
db = firestore.client()

def fetch_users():
    users_ref = db.collection('users')
    docs = users_ref.stream()
    
    users = []
    for doc in docs:
        user_data = doc.to_dict()
        user_data['id'] = doc.id  # Store Firestore document ID as part of the user data
        users.append(user_data)
        
    return users

def randomize_matches_and_update_users(users):
    # Randomize the order of users
    random.shuffle(users)
    
    # Iterate over the list in steps of 2 to pair users
    for i in range(0, len(users) - 1, 2):
        user1 = users[i]
        user2 = users[i + 1]
        
        # Update each user's document in Firestore with the match's user ID
        update_user_with_match(user1['id'], user2['id'])
        update_user_with_match(user2['id'], user1['id'])

def update_user_with_match(user_id, match_id):
    # Update the user document with the matchId field
    users_ref = db.collection('users').document(user_id)
    users_ref.update({'matchId': match_id})

def main():
    users = fetch_users()
    randomize_matches_and_update_users(users)
    print("Users updated with their random matches.")

if __name__ == "__main__":
    main()