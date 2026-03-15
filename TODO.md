# BoloBill – TODO tasks

Tasks to implement across **backend**, **admin**, and **mobile app**. This file acts as our master backlog.

---

## Completed

- **Membership / Manage subscriptions (admin UI)** – Plan cards with invoice limit, voice minutes limit, icon upload, edit/delete, new membership, delete confirmation modal.
- **Whisper tab (super admin)** – New “Whisper” tab: total usage (minutes/seconds), cost in INR and USD, users with usage, and note on per-plan limits + per-user usage in Manage users.

---

## Up Next: Membership Integration

### Backend
- [ ] **Subscriptions in DB** – Store user subscription/plan and expiry in backend (e.g. `User.subscription: { planId, expiresAt }`) so limits and “pending” are server-side.
- [ ] **Enforce invoice limit per user** – Before creating an invoice, check user’s plan and `usage.invoiceRequestSuccessCount` (or billing window) and reject if over limit.
- [ ] **Enforce voice minutes limit per user** – Before/after Whisper call, check user’s `usage.voiceToTextSecondsUsed` vs plan’s voice minutes limit and reject or cap.
- [ ] **Payments** – Integrate payment provider (Razorpay/Stripe/etc.) for plan purchase and renewal.

### Admin (Web)
- [ ] **Sync plan limits with backend** – Manage subscriptions read/write from API instead of localStorage. Remove all hardcoding.
- [ ] **Whisper: per-user "limit pending"** – Show remaining minutes per user when backend exposes it.
- [ ] **Dashboard stats** – Use real subscription/expiry stats from backend.

---

## Future High-Value Features

- [ ] **Customer Khata (Ledger / Udhaar Book)**
- [ ] **Smart Inventory & Low Stock Alerts**
- [ ] **Expense Tracking (Cash Flow Manager)**
- [ ] **AI Restock Recommendations**
- [ ] **Staff / Employee Access**

---

## Mobile app (BoloBillApp)

- [ ] **Respect plan limits in app** – Before creating invoice or using voice, call backend to check invoice limit and voice minutes limit; show upgrade prompt when at/over limit.
- [ ] **Show usage in app** – Display “X / Y invoices used” and “X / Y voice minutes used” (and remaining) from backend in profile or membership screen.
- [ ] **Payments in app** – Plan selection and payment flow (after backend payments are implemented).
- [ ] **Push / in-app notifications** – For subscription expiring, payment success, etc.
- [ ] **Offline / sync** – Offline invoice draft and sync when online (if desired).
