# BoloBill — work context (resume from here)

Last updated: 2026-03-27. Use this file to pick up product, code, deployment, and business decisions without re-reading chat history.

---

## Product direction (locked for now)

| Topic | Decision |
|-------|----------|
| **Focus** | **Web merchant panel only** (`admin/` + backend). React Native app **parked** — do not prioritize. |
| **Customers (shops)** | **B2B**: shops do **not** self-register with OTP. You sell **offline** (UPI/bank/cash), then **provision** accounts. |
| **Shop login** | **Phone + PIN** on `/login`. Shops change PIN in **Settings** → `POST /auth/change-pin`. |
| **Public signup** | `/signup` = **Request access** (contact / `VITE_CONTACT_EMAIL`), not OTP registration. |
| **Memberships / Razorpay** | **Not** part of merchant path. Route `/dashboard/memberships` removed; no in-app subscription checkout for shops. |
| **Plan limits** | Off by default. Backend: `ENABLE_SUBSCRIPTION_LIMITS=true` only if you want SaaS caps later. |
| **Voice billing** | Backend supports Whisper; **web UI off** — `admin/src/utils/voiceComingSoon.ts` (`VOICE_MIC_FEATURE_ENABLED = false`). |
| **WhatsApp** | **Not Meta Business API yet**. Merchants share via **WhatsApp Web** + prefilled message + **public bill URL**. |
| **Mobile / app stores** | Landing **Get the app** section removed. Super admin **Store links** page removed. No Play/App promotion on web. |

---

## Roles & flows

| Role | Flow |
|------|------|
| **You (super admin)** | After offline payment → **Manage users → Add shop** (name, business, phone, temp PIN) → share credentials securely. |
| **Shop** | Login → Settings (PIN, branding) → QR Code (UPI) → Stock → Create Bill → share WhatsApp link. |
| **End customer** | Opens `https://<admin-host>/bill/:token` — no login; sees items, total, PDF, shop payment QR. |

Example narrative: **Coffee Express** — contact you → pay offline → you Add shop → they login and bill; customer gets link on WhatsApp.

---

## Sales & pricing (business — not in code)

Single commercial offer (no Standard/Premium **in app**; optional **sales** tiers on paper only):

| Offer | Shop pays you (offline) |
|-------|-------------------------|
| **BoloBill** | **₹8,999/year** — email/WhatsApp support, remote onboarding |
| **BoloBill + setup** | **₹8,999 + ₹2,499 once** — you load stock + QR + ~1 hr training |

**Your infra cost (planning, no shop revenue in this):**

- **Setup + run before first shop:** ~₹2,000–5,000 cash (VPS/API + a few months hosting); Vercel for admin often **₹0**.
- **Ongoing hosting (0–5 shops):** ~₹700–1,300/month (API server + domain slice); one VPS/Railway tier enough for **5 shops** — do not multiply by 5.
- **30% margin rule of thumb:** monthly price ≈ true cost per shop ÷ 0.70 (cost ≈ infra share + support time).

Competitors (sales talk, verify before quoting): Petpooja ~₹10k+/year/restaurant; Ezo app ~₹4k–5k/year or hardware bundles higher. BoloBill positioned as **lean web POS + bill link** for kirana/café without restaurant suite or billing machine.

---

## What was implemented (code)

### Backend (`bolobill-backend/`)

- **Super admin create merchant:** `POST /api/admin/users/merchants` → `adminService.createMerchantAccount()` (uses `authService.register`, `accountType: business`).
- **Change PIN:** `POST /api/auth/change-pin` (authenticated).
- **Public bill:** `GET /api/public/bills/:token`; invoices have `publicToken`; `PUBLIC_BILL_BASE_URL` / `publicBillPageUrl`.
- **Subscription limits:** `subscriptionLimitsEnabled()` in `config/env.ts` — default off.
- **Auth:** `verifyOtpSchema` import fixed in `auth.controller.ts`.
- **Removed:** public `GET /api/public/store-links` (mobile store links de-emphasized).

### Admin (`admin/`)

- **LoginPage:** phone + PIN only (no OTP-first flow).
- **SignupPage:** request access / contact, no OTP signup.
- **Landing:** B2B copy; no free trial block as primary CTA; no app download section; contact/social from env.
- **Settings:** change PIN form → `authApi.changePin`.
- **Users (super admin):** **Add shop** modal → `adminApi.createMerchant`.
- **App.tsx:** memberships route and `MembershipProvider` removed.
- **Removed files/pages:** `StoreLinks.tsx`, `DownloadAppSection.tsx`, `api/public.ts`; store-link API helpers removed from `admin.ts` (backend admin store-links routes may still exist unused).
- **WhatsApp share:** `shareQrOnWhatsApp.ts` — Ezo-style message, `web.whatsapp.com`, bill link from `VITE_PUBLIC_BILL_BASE_URL`.

### Env examples

**admin/.env.example**

- `VITE_API_URL`, `VITE_PUBLIC_BILL_BASE_URL`, `VITE_CONTACT_EMAIL`, `VITE_INSTAGRAM_URL`, `VITE_LINKEDIN_URL`

**bolobill-backend/.env.example**

- `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `BASE_URL`, optional `PUBLIC_BILL_BASE_URL`, `ENABLE_SUBSCRIPTION_LIMITS`

---

## Deployment status (as of last discussion)

| Asset | URL / status |
|-------|----------------|
| **Admin UI (live)** | [https://bolobill.useaifast.com/](https://bolobill.useaifast.com/) — likely **Vercel** + DNS `bolobill` → Vercel |
| **Domain** | **useaifast.com** (owned) |
| **API (needed)** | **`https://api.useaifast.com`** — **not the same as static site**; deploy `bolobill-backend` on **Railway / Render / VPS** (recommended over Vercel for **PDF/QR on disk** in `storage/`) |
| **MongoDB** | Production **Atlas M0** (or Mongo on VPS) — required for live login |
| **Local admin `.env`** | May still show `VITE_API_URL=http://localhost:3011` — **production Vercel** must set `VITE_API_URL=https://api.useaifast.com`, `VITE_PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com` and **redeploy** |

### Production env checklist

**Backend**

```env
NODE_ENV=production
BASE_URL=https://api.useaifast.com
PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com
MONGODB_URI=...
JWT_SECRET=...
OPENAI_API_KEY=...   # required to boot; ~₹0 if voice unused
```

**Vercel (admin build)**

```env
VITE_API_URL=https://api.useaifast.com
VITE_PUBLIC_BILL_BASE_URL=https://bolobill.useaifast.com
VITE_CONTACT_EMAIL=...
```

**DNS**

- `bolobill` → Vercel (done)
- `api` → CNAME to Railway/Render/VPS (todo)

**After API live:** run `seed:admin` once on prod DB; smoke test bill → public link → PDF/QR URLs on `api.useaifast.com`.

---

## Key file paths

| Area | Paths |
|------|--------|
| WhatsApp message | `admin/src/utils/shareQrOnWhatsApp.ts`, `admin/src/utils/publicBillUrl.ts` |
| Public bill page | `admin/src/pages/PublicBill.tsx`, route `/bill/:token` in `App.tsx` |
| Public bill API | `bolobill-backend/src/modules/public-bill/` |
| Auth | `bolobill-backend/src/modules/auth/` |
| Create merchant | `admin.service.ts` `createMerchantAccount`, `Users.tsx` modal |
| Nav | `admin/src/layouts/DashboardLayout.tsx` — `SUPERADMIN_NAV` vs `BUSINESS_NAV` |
| Voice gate | `admin/src/utils/voiceComingSoon.ts` |

---

## Not done / backlog

- [ ] **Deploy API** to `api.useaifast.com` (Railway/Render/VPS + persistent `storage/`)
- [ ] **Vercel env** + redeploy admin so live site hits prod API and bill links use `bolobill.useaifast.com`
- [ ] **Seed super admin** on production MongoDB
- [ ] Optional: disable or gate public `POST /auth/register` / OTP in production (`STATIC_OTP` is dev-only — not production-safe)
- [ ] Optional: remove dead backend **store-links** admin routes if unused
- [ ] **Meta WhatsApp Business API** — future; server-sent templates
- [ ] **RN app** — align with B2B model when resumed
- [ ] Production doc / `.env` on server; confirm `ALLOW_X_USER_ID_AUTH` off in prod if applicable

---

## Commands (local dev)

```bash
# Backend
cd bolobill-backend && npm run dev

# Admin (proxies /api to backend)
cd admin && npm run dev

# Seed super admin (local or prod URI in .env)
cd bolobill-backend && npm run seed:admin
```

---

## Git note

Many changes may be **uncommitted** across `admin/`, `bolobill-backend/`, etc. Run `git status` before deploy. Do not commit `.env` files with secrets.

---

## One-line resume

**Web-first B2B BoloBill:** offline sales → super admin **Add shop** → phone/PIN login → manual POS, stock, WhatsApp Web bill links; **bolobill.useaifast.com** live on Vercel; **API + Mongo + Vercel env** still needed for full production; voice and Meta WhatsApp deferred.
