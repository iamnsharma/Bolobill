# Deploy BoloBill API

**Live today:** API **https://bolobill.onrender.com** · Admin **https://bolobill.useaifast.com** (Vercel).  
See **`../PRODUCTION.md`** for env vars. Custom domain `api.useaifast.com` is optional once DNS points to Render.

## 1. MongoDB Atlas

1. Create cluster + database user.
2. Network access: allow your API server IP (or `0.0.0.0/0` temporarily).
3. Copy connection string → `MONGODB_URI`.

## 2. Host the API (pick one)

Use a host with **persistent disk** for `storage/` (PDFs, QR images).

### Render (good Railway replacement)

1. [render.com](https://render.com) → **New → Web Service** → connect GitHub repo.
2. **Root directory:** `bolobill-backend`
3. **Runtime:** Node  
   - **Build:** `npm ci --include=dev && npm run build` (required if `NODE_ENV=production` is set on the service — otherwise devDependencies are skipped and `tsc` fails)  
   - **Start:** `npm start`
4. **Environment** → add all variables from [§3](#3-production-environment-variables). Render sets **`PORT`** automatically — do not hardcode a conflicting port.
5. **Custom domain:** `api.useaifast.com` → add CNAME Render gives you.
6. **Disk (paid):** on free tier, `storage/` is wiped on redeploy. For real shops, add a **Persistent Disk** mounted at `storage` or use a VPS below.

Optional: deploy with Docker using repo `bolobill-backend/Dockerfile` (Render → Docker).

### Fly.io (volume for PDFs)

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/).
2. From `bolobill-backend`: `fly launch` (pick region near Mumbai if available).
3. `fly secrets set MONGODB_URI=... JWT_SECRET=...` (all env vars).
4. Create volume: `fly volumes create bolobill_storage --size 1` and mount at `/app/storage` in `fly.toml`.
5. `fly deploy` — use included `Dockerfile`.
6. `fly certs add api.useaifast.com` + DNS CNAME to your Fly app.

### Cheap VPS (best value ~₹400–800/mo, full disk)

**Hostinger VPS, Hetzner, DigitalOcean, Lightsail** — one small Ubuntu server runs API 24/7 with real `storage/` folder.

### Railway

Same as before if you have a paid plan; trial may be expired.

### VPS (Ubuntu + PM2 + nginx) — step by step

```bash
# On Ubuntu server (SSH as root or sudo user)
sudo apt update && sudo apt install -y git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

git clone <your-repo-url> && cd BoloBill/bolobill-backend
npm ci && npm run build
nano .env   # paste production env (same as §3); save
pm2 start dist/server.js --name bolobill-api
pm2 save && pm2 startup
```

Nginx site `/etc/nginx/sites-available/api.useaifast.com`:

```nginx
server {
  listen 80;
  server_name api.useaifast.com;
  location / {
    proxy_pass http://127.0.0.1:3011;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 20M;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api.useaifast.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.useaifast.com
```

DNS: **A record** `api` → your VPS public IP.

## 3. Production environment variables

```env
NODE_ENV=production
PORT=3011
BASE_URL=https://bolobill.onrender.com
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

Admin code defaults to `https://bolobill.onrender.com` in production builds (`admin/src/config/deployUrls.ts`).

1. Push latest `admin/`.
2. Vercel → **Environment variables** (Production):
   - `VITE_API_URL=https://bolobill.onrender.com`
   - `VITE_PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com`
3. **Redeploy** production (env changes require rebuild).

Smoke test: login → create bill → open public `/bill/...` link → PDF loads from `https://api.useaifast.com/api/files/pdfs/...`.

## Security notes

- Do not commit `.env`.
- OTP reset still uses dev static OTP in code — shops should use PIN + Settings; tighten OTP before relying on forgot-PIN in production.
