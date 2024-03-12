import firebase_admin
from firebase_admin import credentials, firestore
import random
cred = credentials.Certificate('cs194-e95a9-firebase-adminsdk-2c109-0ef4c0590b.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def fetch_groups_and_users():
    groups_ref = db.collection('groups')
    groups_docs = groups_ref.stream()

    group_users = {}
    for doc in groups_docs:
        group_id = doc.id
        group_data = doc.to_dict()
        members = group_data.get('members', [])
        admin = group_data.get('admin', [])
        all_users = list(set(admin + members))
        group_users[group_id] = all_users
            
    return group_users

def randomize_matches_within_groups(group_users):
    for group_name, users in group_users.items():
        random.shuffle(users)
        for i in range(0, len(users) - 1, 2):
            user1_id = users[i]
            user2_id = users[i + 1]
            update_user_with_match(user1_id, user2_id, group_name)
            update_user_with_match(user2_id, user1_id, group_name)
        if len(users) % 2 != 0:  
            update_user_with_match(users[-1], "n/a", group_name)

def update_user_with_match(user_id, match_id, group_name):
    users_ref = db.collection('users').document(user_id)
    match_entry = {'group': group_name, 'matchId': match_id}
    
    @firestore.transactional
    def update_in_transaction(transaction, user_ref, new_match):
        snapshot = user_ref.get(transaction=transaction)
        user_data = snapshot.to_dict()
        if not user_data:
            user_data = {}
        if 'matches' in user_data:
            user_matches = user_data['matches']
            if not isinstance(user_matches, list): 
                user_matches = []
        else:
            user_matches = []
        match_exists = any(match['group'] == new_match['group'] and match['matchId'] == new_match['matchId'] for match in user_matches)
        
        if not match_exists:
            user_matches.append(new_match)
            transaction.update(user_ref, {'matches': user_matches})
        
    transaction = db.transaction()
    update_in_transaction(transaction, users_ref, match_entry)

def clear_previous_matches():
    users_ref = db.collection('users')
    docs = users_ref.stream()
    
    batch = db.batch()
    for doc in docs:
        user_ref = db.collection('users').document(doc.id)
        batch.update(user_ref, {'matches': []})
    
    batch.commit()

def main():
    clear_previous_matches()
    group_users = fetch_groups_and_users()
    randomize_matches_within_groups(group_users)
    print("Groups updated with their random matches.")

if __name__ == "__main__":
    main()