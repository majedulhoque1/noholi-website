# Noholi OS

Staff console for Noholi Library: Inventory, Lending, Members, Donations, Fines, Reports, Settings.

- All writes go through database RPCs (see `../supabase/CONTRACT.md`) — never direct table updates for anything that touches stock, loans or money.
- Only accounts with a `staff_roles` row can use the console; admins must use TOTP MFA.
- `npm run dev` → http://localhost:8080 (uses `.env.development`, the local Supabase).
