import firebase_admin
from firebase_admin import credentials, firestore
import random
import numpy as np
import collections
from collections import deque
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
cred = credentials.Certificate('cs194-e95a9-firebase-adminsdk-2c109-ac3d2fa6cd.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

FEATURES = ["Age", "Ethnicity", "FavoriteColor", "FavoriteSport", "Gender", "Height", "Major", "HomeState", "HotTake"]

class Forest:
    def __init__(self, N):
        self.N = N
        self.root = [-1 for _ in range(N)]
        self.par  = [-1 for _ in range(N)]
        self.edges = [[] for _ in range(N)]
        self.depth = [-1 for _ in range(N)]
        self.verts = set()

    def add_tree(self, node):
        self.root[node] = node
        self.depth[node] = 0
        self.verts.add(node)

    def add_edge(self, node, par):
        assert self.depth[par] > -1 and self.depth[node] == 1
        self.root[node] = self.root[par]
        self.par[node] = par
        self.edges[par].append(node)
        self.depth[node] = self.depth[par] + 1
        self.verts.add(node)

    def in_forest(self, node):
        return bool(self.depth[node] > -1)

    def dist_to_root(self, node):
        return self.depth[node]

    def path_to_root(self, v):
        path = [v]
        while not(path[-1] == F.root(v)):
            path.append(F.par[path[-1]])
        return path

    def slow_lca(self, n1, n2):
        if self.depth[n1] > self.depth[n2]:
            t = n2
            n2 = n1
            n1 = t
        pars = [n1]
        while not(self.par[pars[-1]] == -1):
            pars.append(self.par[pars[-1]])
        ps = set(pars)
        v = n2
        while not(v == -1):
            if v in ps:
                return v
            v = F.par[v]
        return -1

    def path_to_anc(self, n1, la):
        path = [n1]
        while not(path[-1] == la):
            path.append(self.par[path[-1]])
        return path

    def path_create(self, n1, n2):
        la = self.slow_lca(n1, n2)
        p1 = self.path_to_anc(n1, la)
        p2 = self.path_to_anc(n2, la)
        return p1 + (p2[:1])[::-1]
        

class Matching:
    def __init__(self, N, edges, connections):
        self.N = N
        self.edges = []
        self.connection = [-1 for _ in range(N)]

    def add_edge(self, n1, n2):
        assert self.connection[n1] == -1 and self.connection[n2] == -1
        self.edges.append((n1,n2))
        self.connection[n1] = n2
        self.connection[n2] = n1


class Graph:
    def __init__(self, adj_list):
        self.N = len(adj_list)
        self.e = adj_list

class EdgeMarker:
    def __init__(self, N, unmarked):
        self.N = N
        self.marked_grid = [[False for _ in range(N)] for _ in range(N)]
        self.unmarked_grid = [[True for _ in range(N)] for _ in range(N)]
        self.marked = [[] for i in unmarked]
        self.unmarked = [[i for i in j] for j in unmarked]

    def mark_edge(self, n1, n2):
        assert self.marked_grid[n1][n2] == False and self.unmarked_grid[n1][n2] == True
        self.marked_grid[n1][n2] = True
        self.marked_grid[n2][n1] = True
        self.unmarked_grid[n1][n2] = False
        self.numarked_grid[n2][n1] = False
        self.marked[n1].append(n2)
        self.marked[n2].append(n1)
        self.unmarked[n1].pop(self.unmarked[n1].find(n2))
        self.unmarked[n2].pop(self.unmarked[n2].find(n1))


def find_augmenting_path(G, M):
    F = Forest()
    E = EdgeMarker(G.N, G.e)
    vmarked = [False for _ in range(G.N)]
    is_exposed = [True for _ in range(G.N)]
    to_process = []
    for n1,n2 in M.edges:
        is_exposed[n1] = False
        is_exposed[n2] = False
        E.mark_edge(n1, n2)
        
    for v in range(G.N):
        if is_exposed[v]:
            F.add_tree(v)
            to_process.append(v)
            
    while len(to_process):
        v = to_process[0]
        while len(E.unmarked[v]):
            w = E.unmarked[v][-1]
            if not(F.in_forest(w)):
                x = M.connection[w]
                F.add_edge(v, w)
                F.add_edge(w, x)
                to_process.append(x)
                assert F.dist_to_root(x)%2 == 0
            else:
                if F.dist_to_root(w)%2 == 1:
                    tt = 3
                else:
                    if F.root(v) == F.root(w):
                        return F.path_to_root(v)[::-1] + F.path_to_root(w)
                    else:
                        path = F.path_create(v, w)                
            E.mark_edge(v, w)
        vmarked[v] = True
        to_process.pop(0)
    return []

def safe_index(li,x):
    for i,v in enumerate(li):
        if v == x:
            return i
    return -1

class Blossom:
    def __init__(self, N):
        self.N = N
        self.M = N + N//2
        self.connection = [-1 for _ in range(N)]
        self.b = [[] for _ in range(self.M)]
        self.d, self.p, self.bl = [0 for _ in range(self.M)], [0 for __ in range(self.M)], [0 for _ in range(self.M)]
        self.g = [[-1 for _ in range(self.M)] for _ in range(self.M)]
    def add_edge(self, u, v):
        self.g[u][v] = u
        self.g[v][u] = v
    def match(self, u, v):
        self.g[u][v] = -1
        self.g[v][u] = -1
        self.connection[u] = v
        self.connection[v] = u
    def trace(self, x):
        vx = []
        while True:
            while not(self.bl[x] == x):
                x = self.bl[x]
            if len(vx) and vx[-1] == x:
                break
            vx.append(x)
            x = self.p[x]
        return vx
    def contract(self, c, x, y, vx, vy):
        self.b[c] = []
        r = vx[-1]
        while len(vx) and len(vy) and vx[-1] == vy[-1]:
            r = vx[-1]
            vx.pop(-1)
            vy.pop(-1)
        self.b[c].append(r)
        self.b[c] = self.b[c] + vx[::-1]
        self.b[c] = self.b[c] + vy[:]
        for i in range(c+1):
            self.g[c][i] = -1
            self.g[i][c] = -1
        for z in self.b[c]:
            self.bl[z] = c
            for i in range(c):
                if not(self.g[z][i] == -1):
                    self.g[c][i] = z
                    self.g[i][c] = self.g[i][z]
    def lift(self, vx):
        A = []
        while len(vx) >= 2:
            z = vx[-1]
            vx.pop(-1)
            if z < self.N:
                A.append(z)
                continue
            w = vx[-1]
            i, j = None, None
            if len(A) % 2 == 0:
                j = 0
                i = safe_index(self.b[z], self.g[z][w])
            else:
                i = 0
                j = safe_index(self.b[z], self.g[z][A[-1]])
            k = len(self.b[z])
            dif = k - 1
            if (len(A)%2 == 0 and i%2 == 1) or (len(A)%2 == 1 and j%2 == 0):
                dif = 1
            while not(i == j):
                vx.append(self.b[z][i])
                i = (i + dif)%k
            vx.append(self.b[z][i])
        return A
    def solve(self):
        ans = -1
        while True:
            ans += 1
            self.d = [0 for _ in self.d]
            Q = deque()
            for i in range(self.M):
                self.bl[i] = i
            for i in range(self.N):
                if self.connection[i] == -1:
                    Q.append(i)
                    self.p[i] = i
                    self.d[i] = 1
            c = self.N
            aug = False
            while len(Q) and not(aug):
                x = Q.popleft()
                if self.bl[x] != x:
                    continue
                for y in range(c):
                    if self.bl[y] == y and not(self.g[x][y] == -1):
                        if self.d[y] == 0:
                            self.p[y] = x
                            self.d[y] = 2
                            self.p[self.connection[y]] = y
                            self.d[self.connection[y]] = 1
                            Q.append(self.connection[y])
                        elif self.d[y] == 1:
                            vx = self.trace(x)
                            vy = self.trace(y)
                            if vx[-1] == vy[-1]:
                                self.contract(c,x,y,vx,vy)
                                Q.append(c)
                                self.p[c] = self.p[self.b[c][0]]
                                self.d[c] = 1
                                c += 1
                            else:
                                aug = True
                                vx, vy = [y] + vx, [x] + vy
                                A, B = self.lift(vx)[:], self.lift(vy)[:]
                                A += B[::-1]
                                for i in range(0,len(A),2):
                                    if i + 1 < len(A):
                                        self.match(A[i], A[i+1])
                                    if i+2 < len(A):
                                        self.add_edge(A[i+1], A[i+2])
                            break
            if not(aug):
                return ans


def solve_with_edges(N, G, m):
    B = Blossom(N)
    added = 0
    for i in range(N):
        for j in range(i+1,N):
            if G[i][j] <= m:
                added += 1
                B.add_edge(i,j)
    amt = B.solve()
    return amt, B.connection

def get_matches(G):
    l, r, N = 0, 1e10, len(G)
    while l < r - 1e-5:
        m = (l + r)/2
        cnt, _ = solve_with_edges(N, G, m)
        if cnt == N//2:
            r = m
        else:
            l = m
    cnt, connection = solve_with_edges(N, G, r)
    return connection

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

def retrieve_group_users_data(users):
    res_data = {}
    for user in users:
        @firestore.transactional
        def ret(transaction, user_ref):
            snapshot = user_ref.get(transaction=transaction)
            user_data = snapshot.to_dict()
            return user_data
        user_ref = db.collection('users').document(user)
        transaction = db.transaction()
        pure_data = ret(transaction, user_ref)
        data = []
        for f in FEATURES:
            data.append(pure_data[f])
        res_data[user] = data
    return res_data

def get_response_diff(r1, r2):
    assert type(r1) == type(r2)
    if type(r1) is int or type(r1) is float:
        return abs(r1 - r2)
    else:
        assert type(r1) is str
        v1 = np.array(model.encode(r1))
        v2 = np.array(model.encode(r2))
        sim = np.dot(v1, v2)/(np.sqrt(np.sum(np.square(v1))) * np.sqrt(np.sum(np.square(v1))))
        return sim
        
def get_user_matches(users):
    users_data = retrieve_group_users_data(users)
    idx_to_user = []
    user_to_idx = {}
    for i, (user, data) in enumerate(users_data.items()):
        idx_to_user.append(user)
        user_to_idx[user] = i
    N = len(idx_to_user)
    G = [[0 for _ in range(N)] for _ in range(N)]
    for fi, feature in enumerate(FEATURES):
        largest_sim = 0
        hold = [[0 for _ in range(N)] for _ in range(N)]
        for i in range(N):
            for j in range(i+1,N):
                sim = get_response_diff(users_data[idx_to_user[i]][fi], users_data[idx_to_user[j]][fi])
                hold[i][j] = sim
                hold[j][i] = sim
                largest_sim = max(largest_sim, sim)
        for i in range(N):
            for j in range(i+1,N):
                G[i][j] += hold[i][j]/largest_sim
                G[j][i] += hold[j][i]/largest_sim
        print(fi, feature, G)
    print(G)
    matching = get_matches(G)
    user_updates = []
    for i in range(N):
        j = matching[i]
        if j == -1:
            user_updates.append((idx_to_user[i], "n/a"))
        else:
            user_updates.append((idx_to_user[i], idx_to_user[j]))
    return user_updates

def randomize_matches_within_groups(group_users):
    for group_name, users in group_users.items():
        user_match_updates = get_user_matches(users)
        for user1_id, user2_id in user_match_updates:
            update_user_with_match(user1_id, user2_id, group_name)

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

def clear_hotTakes():
    users_ref = db.collection('users')
    docs = users_ref.stream()
    batch = db.batch()
    for doc in docs:
        user_ref = db.collection('users').document(doc.id)
        batch.update(user_ref, {'HotTake': ""})
    
    batch.commit()

def main():
    clear_previous_matches()
    #clear_hotTakes()
    group_users = fetch_groups_and_users()
    randomize_matches_within_groups(group_users)

if __name__ == "__main__":
    main()