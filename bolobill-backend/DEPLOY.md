# Deploy BoloBill API (`api.useaifast.com`)

Admin UI is already on **https://bolobill.useaifast.com**. Point it at this API after deploy (see `admin/src/config/deployUrls.ts`).

## 1. MongoDB Atlas

1. Create cluster + database user.
2. Network access: allow your API server IP (or `0.0.0.0/0` temporarily).
3. Copy connection string → `MONGODB_URI`.

## 2. Host the API (pick one)

Use a host with **persistent disk** for `storage/` (PDFs, QR images).

### Railway (simple)

1. New project → Deploy from GitHub → root **`bolobill-backend`**.
2. **Build:** `npm ci && npm run build`
3. **Start:** `npm start`
4. **Volume:** mount at `/app/storage` (or project root) so `storage/pdfs` and `storage/qr` survive restarts.
5. **Variables** (see below).
6. Settings → generate domain or add custom **`api.useaifast.com`** (CNAME to Railway).

### VPS (Ubuntu + PM2 + nginx)

```bash
# On server
git clone <repo> && cd BoloBill/bolobill-backend
npm ci && npm run build
cp .env.example .env   # edit production values
pm2 start dist/server.js --name bolobill-api
pm2 save && pm2 startup
```

Nginx: proxy `https://api.useaifast.com` → `http://127.0.0.1:3011`, `client_max_body_size 20M`, TLS via Certbot.

## 3. Production environment variables

```env
NODE_ENV=production
PORT=3011
BASE_URL=https://api.useaifast.com
PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-string-min-8-chars>
OPENAI_API_KEY=sk-...
ALLOW_X_USER_ID_AUTH=false
```

Optional: `RAZOR_API_KEY`, `RAZOR_KEY_SECRET`, `ENABLE_SUBSCRIPTION_LIMITS=false`.

## 4. DNS

| Record | Points to |
|--------|-----------|
| `api` (useaifast.com) | Railway/Render hostname or VPS IP |

Wait for TLS (platform or Let’s Encrypt).

## 5. Verify API

```bash
curl https://api.useaifast.com/api/health
# {"ok":true,"service":"bolobill-backend-ts"}
```

## 6. Seed super admin (once)

From your laptop with prod `MONGODB_URI` in `.env`:

```bash
cd bolobill-backend
npm run seed:admin
```

Login on live admin, then change PIN in Settings.

## 7. Redeploy admin (after API is live)

Admin code defaults to `https://api.useaifast.com` in production builds.

1. Push latest `admin/` (includes `deployUrls.ts`).
2. Vercel → project → **Environment variables** (optional but recommended):
   - `VITE_API_URL=https://api.useaifast.com`
   - `VITE_PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com`
3. **Redeploy** production (env changes require rebuild).

Smoke test: login → create bill → open public `/bill/...` link → PDF loads from `https://api.useaifast.com/api/files/pdfs/...`.

## Security notes

- Do not commit `.env`.
- OTP reset still uses dev static OTP in code — shops should use PIN + Settings; tighten OTP before relying on forgot-PIN in production.
