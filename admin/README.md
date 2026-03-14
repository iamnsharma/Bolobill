# BoloBill Admin

React admin panel for BoloBill: invoices, users, memberships, and feature management.

## Setup

1. **Backend**: Ensure `bolobill-backend` is running and seed the admin user:
   ```bash
   cd bolobill-backend && npm run seed:admin
   ```
   Admin login: **phone** `6283515870`, **PIN** `870870`.

2. **Admin app**:
   ```bash
   cd admin
   npm install
   cp .env.example .env   # optional: set VITE_API_URL if backend is not on localhost:3011
   npm run dev
   ```
   Opens at http://localhost:3000. Sign in with the admin phone and PIN above.

## Features

- **Login**: Phone + PIN only (no signup; admin user is seeded in DB).
- **Dashboard**: Overview placeholders (stats require backend admin APIs).
- **Invoices**: Placeholder; needs `GET /api/admin/invoices`.
- **Users**: List and user detail placeholders; need `GET /api/admin/users`, user by id, and blacklist (no delete).
- **Memberships**: Placeholder; needs admin membership APIs.
- **Manage features**: Placeholder; needs feature-flag APIs.

Where an API is not implemented yet, the UI shows: **"Need to implement APIs in backend yet"**.

## Build

```bash
npm run build
```
Output in `dist/`. Serve with any static host or `npm run preview`.
