# CLAUDE.md — aama-happy-home

Guidance for AI assistants working in this repo (Aama Daycare marketing site).

## What this is

React + Vite + TypeScript site for [aamadaycare.com](https://aamadaycare.com).
Deployed to Hostinger via GitHub Actions on push to `main`.

## Git workflow (required)

**Always sync `main` before creating a new branch.**

```bash
git checkout main
git pull origin main
git checkout -b feat/your-branch-name
```

Do this even if you were on another feature branch — start new work from up-to-date `main`.

If the user already has uncommitted changes, stash first (`git stash -u`), sync `main`, create the branch, then `git stash pop`.

Default branch is **`main`** (not `master`).

### Before opening a PR

```bash
git fetch origin main
git merge origin/main   # or rebase if the user prefers
```

Resolve conflicts, then push and open the PR targeting `main`.

### Commits and deploy

- Do not commit `.env` (gitignored). Use `.env.example` for documented vars.
- Production secrets (e.g. `VITE_GA_MEASUREMENT_ID`, FTP) live in GitHub Actions secrets.
- CI **Build** must pass before merge if branch protection is enabled.

## Key paths

- `src/components/` — UI (Header, Contact, Hero, etc.)
- `src/lib/contact.ts` — shared phone, SMS, email, directions URLs
- `src/lib/analytics.ts` — GA4 (requires `VITE_GA_MEASUREMENT_ID`)
- `.github/workflows/ci-cd.yml` — lint, build, deploy

## Local dev

```bash
npm install
npm run dev    # http://localhost:5173
```

Copy `.env.example` → `.env` for local GA4 testing.

## Testing check-in/admin roles (`/checkin`) — do not use real Google OAuth for QA

Real Google sign-in can't be driven headlessly (consent flow needs real account
interaction), so use the dev-only bypass instead — this is the default way to QA
either role, not a fallback:

1. Run the companion backend (`aama-service-k`) with `AUTH_BYPASS_ENABLED=true` in
   its `.env` (`npm run dev` there, port from its `PORT` env var, default 3000).
2. In this repo's header (`Header.tsx`), open the sign-in dialog/menu — desktop
   dialog or mobile menu — and click **"Test Login: Parent"** or **"Test Login:
   Admin"** under the "Dev only" section. This sends `test:parent`/`test:admin`
   as the bearer token instead of a real Google ID token.
3. This UI only renders when `import.meta.env.DEV` is true (stripped from
   production builds) — it will not appear if you build/preview a production
   bundle.

See `feature.md`'s Check-in section and the "test both real user roles" backlog
entry for the full contract (`hooks/auth-context.tsx`'s `decodeToken`, and
`aama-service-k`'s `middleware/googleAuth.ts`).
