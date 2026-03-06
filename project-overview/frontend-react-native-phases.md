# BoloBill React Native Frontend Plan (Phase-wise)

This plan is derived from:

- `BoloBill_doc1_project_overview.docx`
- `BoloBill_doc2_technical_specs.docx`
- `BoloBill_doc4_ai_prompts_guide.docx`

Goal: finish the React Native app first with a Khata Book-like experience for existing Khata Book users.

## 1) Product Scope for Frontend (What to Build)

### Core MVP user flow

1. OTP login/register
2. Home dashboard
3. Voice invoice creation (record -> upload -> process)
4. Invoice preview and edit
5. Confirm and generate PDF
6. Share/download PDF
7. Invoice history and detail
8. Upgrade and verification flow
9. Profile and account status (Personal vs Verified)

### Must-have business rules in UI

- Free users: max 10 invoices/month
- Free users show Personal warning state
- Verified users show verified badge and WhatsApp share enabled
- Upgrade prompts appear when free limit is reached
- Verification submission screen for shop proof

## 2) Khata Book-like Theme Direction

Design objective: keep a familiar ledger/business utility style (simple, high-contrast, bold CTAs, clean list cards), while branding as BoloBill.

### Theme tokens (v1)

- Primary: `#1E6EF2` (business blue)
- Primary dark: `#1554B8`
- Accent success: `#16A34A` (verified state)
- Accent warning: `#F59E0B` (personal/unverified state)
- Danger: `#DC2626`
- Background: `#F5F7FB`
- Surface: `#FFFFFF`
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Border: `#E5E7EB`

### Typography

- Heading: 20-24, semi-bold/bold
- Body: 14-16 regular/medium
- Label/caption: 12-13 medium
- Use one font family across app for speed and consistency

### UI patterns

- Rounded cards (10-14 radius)
- Large primary action buttons
- Prominent totals in invoice card/detail
- Status chips: Verified, Personal, Pending
- Bottom tab navigation for primary sections

## 3) Recommended App Structure

Use this structure from Doc 2 and adapt as needed:

- `src/screens/`
  - `SplashScreen.js`
  - `LoginScreen.js`
  - `RegisterScreen.js`
  - `HomeScreen.js`
  - `VoiceInvoiceScreen.js`
  - `InvoicePreviewScreen.js`
  - `InvoiceHistoryScreen.js`
  - `InvoiceDetailScreen.js`
  - `ProfileScreen.js`
  - `UpgradeScreen.js`
  - `VerificationScreen.js`
- `src/components/`
  - `VoiceRecorder.js`
  - `InvoiceCard.js`
  - `InvoiceItemList.js`
  - `VerifiedBadge.js`
  - `SubscriptionCard.js`
  - `LoadingOverlay.js`
- `src/navigation/`
  - `AuthNavigator.js`
  - `AppNavigator.js`
- `src/services/`
  - `api.js`
  - `auth.js`
  - `invoice.js`
  - `payment.js`
  - `storage.js`
- `src/context/`
  - `AuthContext.js`
  - `InvoiceContext.js`
- `src/theme/`
  - `colors.js`
  - `typography.js`
  - `spacing.js`
  - `index.js`
- `src/utils/`
  - `constants.js`
  - `helpers.js`
  - `validation.js`

## 4) Frontend Build Phases (React Native First)

## Phase 0: Setup and Foundation (Day 1)

Deliverable: running Expo app with base architecture.

Tasks:

- Initialize Expo SDK 50 project
- Install core dependencies:
  - React Navigation
  - React Native Paper
  - Axios
  - AsyncStorage
  - expo-av
  - expo-file-system
  - expo-sharing
- Configure folder structure
- Create theme tokens and global providers
- Add base API client and env config

Acceptance:

- App launches on Android device/emulator
- Navigation container loads
- Theme applies globally

## Phase 1: Auth + Onboarding (Day 2-3)

Deliverable: users can login/register with phone OTP flow UI.

Tasks:

- Build `SplashScreen`, `LoginScreen`, `RegisterScreen`
- Implement auth context and token persistence
- Integrate APIs:
  - `POST /api/auth/send-otp`
  - `POST /api/auth/verify-otp`
  - `GET /api/auth/me`
- Add account type selection (personal/shop)
- Add basic profile/shop fields for onboarding

Acceptance:

- User can complete OTP flow
- Session persists after app restart
- Auth navigator to app navigator transition works

## Phase 2: Home + Voice Capture (Day 4-5)

Deliverable: user can record and submit voice for invoice creation.

Tasks:

- Build `HomeScreen` with quick actions and status cards
- Build `VoiceInvoiceScreen` + `VoiceRecorder` component
- Microphone permission handling
- Recording start/stop states and UX feedback
- Integrate `POST /api/invoice/create`
- Loading and error states (network, parsing, quota)
- Free-tier limit handling with upgrade CTA

Acceptance:

- Voice is recorded and uploaded
- Successful response navigates to preview
- Limit reached state routes to upgrade flow

## Phase 3: Preview + Edit + Share (Day 6-7)

Deliverable: invoice preview/edit/confirm/download/share flow works.

Tasks:

- Build `InvoicePreviewScreen` and item editing UI
- Integrate:
  - `PUT /api/invoice/:invoiceId/edit`
  - Confirm action endpoint (as backend provides)
- Add PDF actions:
  - Download via `expo-file-system`
  - WhatsApp share (only verified users)
- Add verified/personal badge logic across preview UI

Acceptance:

- User can edit and confirm invoice
- PDF download works on device
- WhatsApp button hidden/disabled for personal accounts

## Phase 4: History + Detail + Search (Day 8-9)

Deliverable: ledger-like invoice listing similar familiarity for Khata users.

Tasks:

- Build `InvoiceHistoryScreen` with card list
- Add pull-to-refresh, pagination, and search
- Build `InvoiceDetailScreen`
- Integrate:
  - `GET /api/invoice/history`
  - `GET /api/invoice/:invoiceId`
- Add empty, loading, and error states

Acceptance:

- User can browse past invoices quickly
- Search and date filters function
- Tapping card opens detail screen

## Phase 5: Upgrade + Verification + Profile (Day 10-11)

Deliverable: subscription funnel and verification UX complete.

Tasks:

- Build `UpgradeScreen`, `VerificationScreen`, `ProfileScreen`
- Display free usage count and plan benefits
- Integrate:
  - `POST /api/subscription/create`
  - `POST /api/subscription/verify-payment`
  - `POST /api/shop/verify`
- Verification status chips: pending/approved/rejected
- Show account trust state prominently in profile and invoices

Acceptance:

- User can initiate upgrade flow
- Verification request submission works
- Profile reflects live subscription + verification status

## Phase 6: Polish + QA + Beta Readiness (Day 12-14)

Deliverable: stable release candidate for Android beta.

Tasks:

- Accessibility pass (touch target size, contrast, labels)
- Offline/slow network handling and retry UX
- Performance polish (screen load, list rendering)
- Error telemetry and analytics hooks
- Final UI consistency against theme system
- Smoke test end-to-end flow

Acceptance:

- Crash-free core flow in testing
- End-to-end scenario works under normal network
- APK builds for beta distribution

## 5) Screen Priority Order (If Building Fast)

1. `LoginScreen`
2. `HomeScreen`
3. `VoiceInvoiceScreen`
4. `InvoicePreviewScreen`
5. `InvoiceHistoryScreen`
6. `InvoiceDetailScreen`
7. `UpgradeScreen`
8. `VerificationScreen`
9. `ProfileScreen`

## 6) Definition of Done (Frontend MVP)

- OTP login flow complete
- Voice -> invoice -> preview -> confirm path complete
- PDF download/share from app
- History listing + detail complete
- Free vs verified business logic visible in UI
- Upgrade and verification screens functional
- Theme is consistent and familiar for Khata-style users

## 7) Progress Tracker (Live)

### Documentation progress (requested update)

- [x] `BoloBill_doc1_project_overview.txt` reviewed and mapped to frontend scope
  - [x] Voice-to-invoice primary flow aligned
  - [x] Personal vs Verified trust-state UI behavior aligned
  - [x] Home/voice/history journey reflected in implemented screens
- [x] `BoloBill_doc2_technical_specs.txt` (sections `1-154`) reviewed and mapped
  - [x] API contract direction aligned for auth/invoice modules
  - [x] Invoice preview/edit and history screen structures aligned
  - [x] PDF/share integration points identified for next backend wiring
- [x] `BoloBill_doc4_ai_prompts_guide.txt` reviewed and integrated into execution plan
  - [x] Prompt-driven sequence converted into phase checklist
  - [x] Troubleshooting and implementation prompts captured for next iterations

### Done in app (UI-first)

- [x] Phase 1 base auth screens and auth/app navigation flow
- [x] Phase 2 `HomeScreen` + `VoiceInvoiceScreen` scaffolding
- [x] Voice recorder scaffold with mic permission prompt
- [x] Voice recorder now supports **Record / Pause-Resume / Stop** controls
- [x] Recording pulse animation in active record state
- [x] Recording metadata captured in UI (`fileName`, `duration`, `time`)
- [x] Bottom tabs now use PNG assets (`home.png`, `voice.png`, `settings.png`)
- [x] Phase 3 started: `InvoicePreviewScreen` with editable items + total
- [x] Preview actions scaffolded: Confirm, Download, WhatsApp Share
- [x] Voice success path navigates to invoice preview

### Additional completed work (latest)

- [x] Multi-language reactive text updates across Home, Voice, Settings, and tabs
- [x] Light theme switched to red khata-like style; dark theme kept black/white
- [x] Animated splash flow with visible logo container and fallback state
- [x] Profile management UI added with business-first behavior
- [x] Invoice history/preview moved toward transaction-first wording
- [x] Android back handling hardened with quit-confirm alert behavior
- [x] Back icon in stack headers migrated to asset-based icon (`back.png`)

### Intentionally deferred for now

- [ ] Real microphone engine integration (stable RN 0.81-compatible package)
- [ ] Real audio file creation on device storage
- [ ] Actual upload to backend and server parsing
- [ ] Real PDF generation/download/share wiring

## 8) Next Work: Recording -> PDF Generation (Implementation Plan)

### A. Real recording layer

1. Pick and lock recorder package version compatible with RN `0.81`.
2. Implement `start / pause / resume / stop` with real audio output (`.m4a`).
3. Save file path and duration in local state/store.
4. Add failure handling (permission denied, interrupted recording, zero-length file).

### B. Invoice creation from recording

1. Build multipart upload with recorded file to `POST /api/invoice/create`.
2. Handle API outcomes: success, quota reached, parsing failed, retry required.
3. On success, pass normalized response to preview screen.

### C. Preview confirmation and PDF

1. Send edited data to `PUT /api/invoice/:invoiceId/edit`.
2. Confirm invoice via backend confirm endpoint.
3. Download PDF to device storage.
4. Enable WhatsApp share only for verified users.

### D. Quality checks before moving to history phase

- Test quick taps on record/pause/stop sequence.
- Test app background/foreground during recording.
- Test low storage and network failure cases.
- Verify end-to-end: voice -> preview edit -> confirm -> PDF action.

## 9) Doc updates that will speed coding the most

1. **Update `BoloBill_doc2_technical_specs.txt` first (highest impact)**  
   Add one source-of-truth API table for current app routes, request/response shapes, and error codes actually used in the app (`auth`, `invoice`, `history`, `edit`, `confirm`, `share`).

2. **Update `BoloBill_doc4_ai_prompts_guide.txt` second**  
   Convert long generic prompts into short, repo-specific prompts referencing current paths and stack (RN CLI app structure, current navigation, stores, i18n, theme tokens).

3. **Update `BoloBill_doc1_project_overview.txt` third**  
   Keep only current-phase business scope and success criteria for MVP to avoid overbuilding from future-phase ideas while coding.
