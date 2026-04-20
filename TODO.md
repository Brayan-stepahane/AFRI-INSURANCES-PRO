# Fix Node.js Server Crash

## Plan Steps:
- [x] Create server/index.js (Express app entry point with all routes)
- [x] Create server/.env.example (config template)
- [ ] Copy .env.example → server/.env & set real DB creds (Postgres + afri-pro.sql)
- [ ] cd server && npm install (if deps missing)
- [ ] Ensure Postgres running with afri-pro DB (run afri-pro.sql)
- [ ] npm run dev → Server starts on http://localhost:3000
- [ ] Test: curl http://localhost:3000/health
- [ ] Test API: POST /api/auth/register {"identifiant":"test","password":"test","nom":"Test","prenom":"User"}

## Status: Server files ready. Configure .env + DB next.

