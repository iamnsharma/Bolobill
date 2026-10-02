# BoloBill Admin

React admin panel for BoloBill: invoices, users, memberships, and feature management.

## Setup

1. **Backend**: Ensure `bolobill-backend` is running and seed the admin user:
   ```bash
   cd bolobill-backend && npm run seed:admin
   ```
   Admin login: **phone** `6283515870`, **PIN** `915870`.

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
- **Dashboard**: Sales, stock, and platform stats from the backend API.
- **Invoices / bills**: List, search, and create bills (merchant) or platform-wide (super admin).
- **Users**: Search, blacklist, subscriptions (super admin).
- **Stock, sales, items sold**: Merchant inventory and reporting.

## Build

```bash
npm run build
```
Output in `dist/`. Serve with any static host or `npm run preview`.
