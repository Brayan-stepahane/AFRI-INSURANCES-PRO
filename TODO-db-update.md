# TODO: Mise à jour DB + Fix 500 Error (User Creation)

## ✅ 1. DB Schema Mis à Jour
- [x] `server/schema-updated.sql` créé (contient hiérarchie + 'chef_agence' + 'chef')
- Exécuter: `psql -U postgres -d afri-pro -f server/schema-updated.sql`

## ⏳ 2. Frontend Fix (role 'chef' → 'chef_agence')
```
Afri-pro/app/(app)/users.tsx:
ROLE_OPTIONS: ['commercial', 'manager_adj', 'manager', 'chef_agence', 'admin']
```

## ⏳ 3. Backend Validation
```
server/routes/users.js: 
Ajouter validation role avant INSERT
```

## ⏳ 4. Test
```
cd server
npm start
→ Frontend: Créer user role='chef_agence' (aucun parent requis)
→ Vérifier DB: SELECT * FROM users ORDER BY role;
→ Test hiérarchie: commercial (parent=manager_adj)
```

## 🚀 Commandes
```bash
# 1. Reset DB avec nouveau schema
psql -U postgres -d afri-pro -f server/schema-updated.sql

# 2. Backend
cd server && npm install && npm start

# 3. Frontend (Metro)
cd Afri-pro && npx expo start
```

