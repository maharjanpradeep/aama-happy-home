# aama-happy-home — features

_Snapshot of existing functionality as of 2026-07-15 (checked = already built and
running). Add new features below, unchecked, for `/feature-loop aama-happy-home`
to pick up. See `CLAUDE.md` for repo conventions (git workflow, deploy)._

_Checkbox legend: `[ ]` todo · `[~]` building now (mark the one you want
`/feature-loop` to pick up next — at most one at a time) · `[x]` done._

_The whole file is newest-first: `## Recent activity & backlog` below holds every
item added or completed, most recent date on top. The category sections further
down are the stable architecture snapshot and don't get reshuffled._

## Recent activity & backlog (newest first)
- [x] (added 2026-07-16, done 2026-07-16) **In-app QR code generator for the door check-in sign, shown on the Admin Dashboard tab.**
  Parents scan a QR code posted on the door with their phone camera; it opens
  the browser straight to the existing `/checkin` page (see the Check-in
  section below — login + Check In/Check Out tap already work end to end),
  where they just tap "Check In" or "Check Out" for their child. No changes
  to the check-in flow itself — this is purely about producing the QR code
  to print and post, and doing it inside the app rather than an external
  one-off generator (user's call after weighing both options).

  **Scope:**
  - One static QR code, not per-child — it just encodes the production
    `/checkin` URL (e.g. `https://aamadaycare.com/checkin`).
  - Add a small section to the existing "Admin Dashboard" tab in
    `src/pages/CheckIn.tsx` (the `isAdmin` `TabsContent`) — e.g. "Door
    Check-in QR Code" with the rendered QR image and a download/print
    button. Admin-only, since that's the only "admin page" in the app.
  - Client-side QR rendering (e.g. `qrcode.react` or similar) — no backend
    change needed since the encoded URL is public and static.
  - Should look reasonable at print size (large enough to scan reliably
    from a door at arm's length) and have a "Download PNG" (or equivalent)
    action so it can be printed.

  **Confirmed plan (2026-07-16):**
  - QR always encodes the fixed production URL `https://aamadaycare.com/checkin`
    (added as a shared constant, e.g. in `lib/contact.ts` alongside the other
    shared contact/URL constants) — never derived from `window.location.origin`,
    so a QR generated/printed from a local dev session still points at the
    live site.
  - Export is a single "Download PNG" button (renders the QR to a canvas and
    triggers a file download) — no separate print-optimized view for now.
  - New small dependency for client-side QR rendering (e.g. `qrcode.react`),
    added to `aama-happy-home`'s `package.json`.

  **Built:** `src/lib/contact.ts` gained `checkinDoorSignUrl` (fixed
  `https://aamadaycare.com/checkin` constant). New `src/components/DoorSignQrCode.tsx`
  renders a `QRCodeCanvas` (from the new `qrcode.react` dependency) encoding that
  constant, plus a "Download PNG" button that reads the canvas via `toDataURL` and
  triggers a file download. Mounted inside the Admin Dashboard `TabsContent` in
  `src/pages/CheckIn.tsx`, below the roster table.

  **Verified:** `npm run lint` (0 errors, 10 warnings — unchanged baseline) and
  `npm run build` (tsc + vite + prerender, all 5 routes crawled) both passed.
  **QA'd live** via `gstack browse` against the real dev server (`aama-happy-home`
  on :5173, `aama-service-k` on :3000 with `AUTH_BYPASS_ENABLED=true`): signed in
  via "Test Login: Admin", opened the "Admin Dashboard" tab — the "Door Check-in
  QR Code" card rendered below the roster table with a valid QR image (confirmed
  the canvas produces real PNG data via `toDataURL`); clicked "Download PNG" and
  "Refresh" with no console errors (only the pre-existing, expected React Router
  future-flag warnings and the real `GoogleLogin` widget's localhost GSI-origin
  403/warning — unrelated to this feature, same as prior QA notes above).
- [x] (added 2026-07-15, promoted 2026-07-16, done 2026-07-16) **Need a way to
  test both real user roles (parent with children, admin) without going
  through real Google login every time.**
  Today, testing either role requires a real Google account that's actually
  in the `Roster` or `Admins` tab of the live Sheet — there's no local/dev way
  to simulate either role. This surfaced directly while investigating the
  "rasu sees no children" bug: the frontend's `useAuth`/`decodeToken`
  (`src/hooks/auth-context.tsx`) never verifies the token's signature, but
  `aama-service-k`'s `verifyGoogleIdToken`
  (`aama-service-k/src/middleware/googleAuth.ts`) does — so a locally-forged
  token gets silently accepted by the frontend but rejected by the real
  backend, meaning end-to-end role testing needs an actual signed Google ID
  token today, not just a frontend trick.

  **This is a cross-repo feature — companion item filed in
  `aama-service-k/feature.md`** (marked `[~]` there, since that repo has no
  other active item right now). `aama-happy-home`'s `[~]` slot is occupied by
  the header-dropdown redesign above, so this one starts as `[ ]` here per
  the user's call — pick it up once the dropdown item is done, or promote it
  sooner if priorities change.

  **Confirmed plan, matching the backend's settled contract
  (`aama-service-k`'s `Bearer test:parent`/`Bearer test:admin`):**
  - `hooks/auth-context.tsx` — `decodeToken` special-cases the two sentinel
    tokens (only when `import.meta.env.DEV`, so the branch and the
    `TEST_USERS` map dead-code-eliminate out of the production bundle) and
    returns a synthetic `{ name, email }` matching the backend's
    `TEST_PARENT_EMAIL`/`TEST_ADMIN_EMAIL` (`test-parent@local.test` /
    `test-admin@local.test`). `login(idToken)` already accepted an arbitrary
    string, so no other change was needed there.
  - `components/Header.tsx` — a "Dev only" block (gated on
    `import.meta.env.DEV`) with "Test Login: Parent" / "Test Login: Admin"
    buttons, added to both the desktop sign-in dialog and the mobile menu's
    sign-in panel, below the real `GoogleLogin` button. Clicking one calls
    `login('test:parent' | 'test:admin')` directly — no popup, no real
    Google network call.

  **Verified done (2026-07-16):** `npm run lint` (0 errors, 10 warnings —
  unchanged baseline) and `npm run build` (tsc + vite + prerender) both
  passed. Confirmed via `grep -r "test:parent\|test:admin\|Test Login" dist/`
  that the sentinel strings and dev-only UI are fully absent from the
  production bundle (Vite tree-shakes the `import.meta.env.DEV` branches at
  build time) — stronger than the backend's boot-time-throw guard, since
  there's nothing shipped to guard against.

  **QA'd live** against the real dev servers (`aama-happy-home` on :5173,
  `aama-service-k` on :3000 with `AUTH_BYPASS_ENABLED=true`) via `gstack
  browse`: clicked "Test Login: Parent" → header avatar shows "T" fallback,
  dropdown shows "Test Parent" / `test-parent@local.test`; `/checkin` showed
  the "Check In / Out" tab with the fixture "Test Child" (checked-out);
  clicking "Check In" flipped it to "checked-in" with a success toast (`GET
  /api/children` 200, `POST /api/checkin` 200); the parallel
  `/api/admin/status` probe correctly 403'd for the parent token (silently
  swallowed by `loadAccount`'s `Promise.allSettled`, matching the existing
  isAdmin-detection pattern — no error shown to the user). Signed out,
  signed back in as "Test Login: Admin" → `/checkin` showed the "Admin
  Dashboard" tab (no "Check In / Out" tab, since the admin identity owns no
  children) with the fixture child, `test-parent@local.test`, "Checked in"
  (state persisted from the earlier action), and a last-event timestamp —
  both `/api/children` and `/api/admin/status` returned 200 for this
  identity. No console errors beyond pre-existing, unrelated ones (React
  Router v7 future-flag warnings; the real `GoogleLogin` widget's GSI origin
  warning, since `localhost:5173` isn't an allowed origin for the real OAuth
  client — expected and irrelevant since this feature bypasses that widget
  entirely).

  Companion backend half (`aama-service-k/feature.md`) already `[x]` done.
- [x] (done 2026-07-15) **Redesign the header's account entry point as a
  profile dropdown, inspired by build.nvidia.com's account menu.** Previously,
  once logged in, `Header.tsx` just showed the user's name and a small inline
  "Logout" text link. Now the desktop header renders a shadcn `DropdownMenu`
  triggered by an `Avatar` (Google profile photo, falling back to the first
  letter of the name); opening it shows name + email, then "My Account"
  (links to `/checkin`, which keeps all its existing role-based tabs
  unchanged — this was a supplement, not a replacement) and "Sign Out". The
  mobile slide-down menu's logged-in card got the same avatar + email, plus
  separate "My Account" / "Sign Out" buttons instead of just a name + bare
  "Logout" link.

  **Verified:** `npm run lint && npm run build` passed (0 errors, 10
  warnings — matches the pre-existing baseline; production build + prerender
  succeeded). Visually confirmed via `gstack browse` against the real dev
  server (desktop dropdown open, mobile menu open) with a simulated session.
  **Real Google OAuth login QA'd manually by the user** (2026-07-15) — could
  not be automated headlessly (Google's real consent flow needs actual
  account interaction); user confirmed the desktop dropdown and mobile card
  both work correctly with a real signed-in session.
## Marketing site (`/`, `src/pages/Index.tsx`)
- [x] `Header`, `Hero`, `About`, `Programs`, `Pricing`, `ScheduleTimeline`,
  `Testimonials`, `PhotoGallery` / `PhotoCarousel`, `VideoTour`, `Contact`,
  `Footer` sections (`src/components/`)
- [x] `src/data/reviews.ts` — testimonial content
- [x] `src/lib/contact.ts` — shared phone/SMS/email/directions URLs
- [x] `AIChatbot` — floating chat widget mounted globally in `App.tsx`
- [x] `/schedule` page (`src/pages/Schedule.tsx`)
- [x] `NotFound` catch-all route

## Check-in (`/checkin`, `src/pages/CheckIn.tsx`)
- [x] Google OAuth login (`@react-oauth/google`, `GoogleOAuthProvider` in
  `App.tsx`) — shares its client ID with the aama-service-k backend's
  `GOOGLE_OAUTH_CLIENT_ID` verification
- [x] `hooks/auth-context.tsx` — decodes the Google ID token client-side,
  persists it in `sessionStorage` (`checkinIdToken`)
- [x] `lib/checkin.ts` — typed client for the backend API
  (`fetchChildren`, `checkInChild`, `checkOutChild`, `fetchAdminStatus`),
  `ApiError` surfaces backend error bodies; `VITE_CHECKIN_API_URL` env-driven
- [x] `/checkin-admin` redirects to `/checkin` (admin view is the same page,
  gated by the signed-in email being in the backend's `Admins` tab)
- [x] Dev-only test-login bypass (`Header.tsx`, gated by `import.meta.env.DEV`
  so it's stripped from production builds) — "Test Login: Parent" / "Test
  Login: Admin" buttons send `test:parent`/`test:admin` as the bearer token
  instead of running real Google OAuth; `decodeToken`
  (`hooks/auth-context.tsx`) resolves those into synthetic
  `test-parent@local.test` / `test-admin@local.test` users. Requires
  `aama-service-k` running with `AUTH_BYPASS_ENABLED=true`. **This is the
  default way to QA either role — see `CLAUDE.md`.**

## Analytics
- [x] `lib/analytics.ts` — GA4 (`VITE_GA_MEASUREMENT_ID`)
- [x] `components/PageAnalytics.tsx` — route-change page-view tracking
  (mounted inside `BrowserRouter` in `App.tsx`)

## Build & deploy
- [x] Vite + React + TypeScript, shadcn-ui + Tailwind CSS (`src/components/ui/`)
- [x] `react-router-dom` (`BrowserRouter basename="/"`), `@tanstack/react-query`
- [x] Deployed to Hostinger via GitHub Actions (`.github/workflows/ci-cd.yml`)
  on push to `main`; CI runs lint + build
