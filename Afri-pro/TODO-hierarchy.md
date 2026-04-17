# TODO: User Hierarchy (FKs)

1. [ ] DB: ALTER users ADD manager_id INT REFERENCES users(id), manager_adjoint_id INT REFERENCES users(id).
2. [ ] Backend /api/users POST: Validate based on role (commercial → manager_adj required).
3. [ ] UI users.tsx: Dynamic dropdowns (manager → filter adj → commercial).
4. [ ] Update hooks to include FKs.
5. [ ] Backend queries filter hierarchy.

Run DB migration first.

