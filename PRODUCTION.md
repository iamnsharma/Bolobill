# BoloBill production URLs (current)

Use these until `api.useaifast.com` DNS points to **Render** (not Railway).

| Role | URL |
|------|-----|
| **Admin (Vercel)** | https://bolobill.useaifast.com |
| **API (Render)** | https://bolobill.onrender.com |
| **MongoDB** | Atlas cluster `bolobill-app` → database **`bolobill`** |

## Render (API) environment

```env
NODE_ENV=production
BASE_URL=https://bolobill.onrender.com
PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com
MONGODB_URI=mongodb+srv://...@bolobill-app....mongodb.net/bolobill?retryWrites=true&w=majority&...
JWT_SECRET=...
OPENAI_API_KEY=...
ALLOW_X_USER_ID_AUTH=false
```

`BASE_URL` must match where the API actually runs. It is used for **PDF**, **QR**, and file links (`/api/files/...`).

**Never** set `BASE_URL` to `https://bolobill.useaifast.com` — that is the admin app on Vercel; it does not serve `/api/files/qr/`. Opening a QR link on the admin domain shows a blank page.

## Vercel (admin) environment

```env
VITE_API_URL=https://bolobill.onrender.com
VITE_PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com
```

Redeploy admin after changing `VITE_*` variables.

## Code defaults (if env missing)

- Admin production API: `admin/src/config/deployUrls.ts` → `PROD_API_ORIGIN` = Render URL above.
- Backend: **no** hardcoded production URL; always set `BASE_URL` on Render.

## Later: custom API domain

1. Render custom domain `api.useaifast.com` + Namecheap CNAME `api` → Render.
2. Verify `https://api.useaifast.com/api/health`.
3. Set `BASE_URL=https://api.useaifast.com` on Render and `VITE_API_URL` on Vercel.
4. Re-upload shop QR; recreate bills if old links used wrong host.

## Seed super admin (Atlas `bolobill` DB)

```bash
cd bolobill-backend
# .env MONGODB_URI must match Render (include /bolobill)
npx tsx scripts/seed-admin.ts
```
