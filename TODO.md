# BoloBill – TODO tasks

Tasks to implement across **backend**, **admin**, and **mobile app** (excluding the membership/subscription UI already done). Use this list to pick up work later.

---

## Completed

- **Membership / Manage subscriptions (admin)** – Plan cards with invoice limit, voice minutes limit, icon upload, edit/delete, new membership, delete confirmation modal.
- **Whisper tab (super admin)** – New “Whisper” tab: total usage (minutes/seconds), cost in INR and USD, users with usage, and note on per-plan limits + per-user usage in Manage users.

---

## Backend

- [ ] **Subscriptions in DB** – Store user subscription/plan and expiry in backend (e.g. `User.subscription: { planId, expiresAt }`) so limits and “pending” are server-side.
- [ ] **Whisper usage: optional USD_TO_INR** – Support `USD_TO_INR` env for Whisper cost INR conversion (already used in code; document in README).
- [ ] **Enforce invoice limit per user** – Before creating an invoice, check user’s plan and `usage.invoiceRequestSuccessCount` (or billing window) and reject if over limit.
- [ ] **Enforce voice minutes limit per user** – Before/after Whisper call, check user’s `usage.voiceToTextSecondsUsed` vs plan’s voice minutes limit and reject or cap.
- [ ] **Notify users (subscription expiring)** – Backend support for “notify users expiring in X days” (e.g. email/push or just an API that returns list and marks notified).
- [ ] **Payments** – Integrate payment provider (Razorpay/Stripe/etc.) for plan purchase and renewal.
- [ ] **Store links** – Already in backend; no change unless moving to DB.

---

## Admin (web)

- [ ] **Sync plan limits with backend** – When backend has plans/subscriptions, admin “Manage subscriptions” should read/write plans and limits from API instead of (or in addition to) localStorage.
- [ ] **Whisper: per-user “limit pending”** – If backend exposes plan + usage per user, show “remaining minutes” per user on Whisper page or in user detail.
- [ ] **Dashboard stats** – Use real subscription/expiry stats when backend supports them (e.g. active memberships, expiring soon count).
- [ ] **Export / reports** – Export users, invoices, or Whisper usage (CSV/Excel) for super admin.

---

## Mobile app (BoloBillApp)

- [ ] **Respect plan limits in app** – Before creating invoice or using voice, call backend (or read from API) to check invoice limit and voice minutes limit; show upgrade prompt when at/over limit.
- [ ] **Show usage in app** – Display “X / Y invoices used” and “X / Y voice minutes used” (and remaining) from backend in profile or membership screen.
- [ ] **Payments in app** – Plan selection and payment flow (after backend payments are implemented).
- [ ] **Push / in-app notifications** – For subscription expiring, payment success, etc., when backend supports it.
- [ ] **Offline / sync** – Offline invoice draft and sync when online (if desired).

---

## Later / optional

- [ ] **Manage features (removed)** – Reintroduce only if there is a clear set of platform “features” to toggle (e.g. enable/disable voice per plan).
- [ ] **Whisper: usage by date range** – Filter Whisper usage by period (e.g. this month) if backend stores usage with timestamps.
- [ ] **Audit log** – Super admin actions (blacklist, plan change, etc.) logged for compliance.
- [ ] **Multi-language** – i18n for admin and/or app.

---

*Last updated when Whisper tab and this TODO were added.*
