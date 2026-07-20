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
- [x] (added 2026-07-20, done 2026-07-20) **Embedded Sign In on /checkin; "Sign In" wording everywhere; mobile-friendly Admin Dashboard.**
  From live prod screenshots: someone landing on `/checkin` fresh (e.g. from
  the door QR code) saw only text pointing at a header "Login" button that,
  especially on mobile, is tucked behind a hamburger menu — no visible way
  to actually sign in from the page itself. Also asked to rename "Login" to
  "Sign In" everywhere, and noted the Admin Dashboard table needs
  horizontal scrolling to see all columns on mobile.

  **Confirmed plan (both recommended options):**
  - `/checkin`'s logged-out state now embeds a real `GoogleLogin` button
    directly on the page (plus dev-only test sign-in buttons), instead of
    just text pointing at the header.
  - Renamed "Login" → "Sign In" on the header's desktop button and the
    "Test Login: Parent/Admin/Visitor" dev buttons (now "Test Sign In: …").
  - Admin Dashboard: table stays for `md:` and up; below that, each child
    renders as a stacked card (name, status, guardians, last event, last
    note, daily note, expected pickup, actions) — same pattern already used
    for the parent's check-in list — instead of a horizontally-scrolling
    table.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass.


- [x] (added 2026-07-20, done 2026-07-20) **Daily note display reflects the backend's new 7-day-reminder behavior for parents.**
  Backend change (see `aama-service-k/feature.md`): parents now see the
  most recent daily note within 7 days, not strictly today's. Since the
  note can now be from a prior day, labeling it "Today's note"
  unconditionally would be wrong.

  - `ChildStatus.dailyNoteDate` (new field) is used to label the note as
    `"Note from Jul 18"` etc. instead of a hardcoded "Today's note".
  - New `formatNoteDate(dateStr)` helper — parses the `YYYY-MM-DD` via
    explicit local y/m/d components (not the `Date` constructor directly)
    so it can't shift a day when the client's timezone differs from
    Pacific.
  - Admin Dashboard table's "Daily note" column is unaffected (admin's
    `dailyNote` stays today-only, per the backend change).

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass.


- [x] (added 2026-07-20, done 2026-07-20) **Move "Expected pickup" back next to "Last check-in", spelled out fully.**
  Reverts the prior round's placement: instead of a short "Pickup 5:00 PM"
  stacked next to the action button, it's back on the same line as "Last
  check-in", spelled out: `"Last check-in: Jul 20, 1:02 PM · Expected
  pickup: 5:00 PM"`. Action button returns to a lone chip, no longer
  paired with a stacked secondary line.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass.


- [x] (added 2026-07-20, done 2026-07-20) **Label the last check-in/out line; move expected pickup next to the action button.**
  From a live screenshot: the timeline line under the name read as a bare
  timestamp with an arrow to pickup, ambiguous without a label. Split into
  two clearer pieces:
  - Left (under name): `"Last check-in: Jul 20, 1:02 PM"` /
    `"Last check-out: Jul 20, 5:12 PM"` — explicit label, no more arrow.
  - Right (next to the action chip): `"Pickup 5:00 PM"` stacked under
    `Check Out`, shown only while checked in.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass.


- [x] (added 2026-07-20, done 2026-07-20) **Last checked in/out timeline line now includes the date, not just time.**
  Follow-up to the timeline-arrow row redesign: `formatEventTime(iso)` now
  formats as `"Jul 20, 1:46 PM"` (month/day + time) instead of just
  `"1:46 PM"` — matters once a child's last event wasn't today. Expected
  pickup stays time-only (it's always same-day as the check-in).

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass.

- [x] (added 2026-07-20, done 2026-07-20) **Note placeholder split by action; parent row redesigned as a "timeline" line.**
  From a live screenshot: the note textarea showed the check-in example
  ("Grandma will pick up today") even while checking *out*, which doesn't
  make sense at that point. Also asked for a more user-friendly redesign of
  the row (name, status, action button, last event, expected pickup) and to
  see a few options first.

  - Note placeholder now differs by action: check-in keeps "e.g. Grandma
    will pick up today"; check-out shows "e.g. Next week we're on
    vacation" (forward-looking, not same-day pickup logistics).
  - Presented 3 row-layout options (merged status line, timeline arrow,
    tightened badge) via preview; **user picked "Timeline arrow."**
  - Row now drops the status `Badge` and right-hand time entirely. Under
    the child's name: while checked in, `<checked-in time> → expected
    pickup <time>` (e.g. "1:46 PM → expected pickup 5:00 PM"); while
    checked out, "Checked out `<time>`"; if never checked in, "Not checked
    in yet." Action chip stays isolated top-right, unchanged from the prior
    round.
  - New `formatEventTime(iso)` helper (time-only, e.g. "1:46 PM") alongside
    the existing `formatTimeLabel(hhmm)`.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass. Live
  browser QA tool still unavailable this session — verified via lint/build
  and code review; screenshot-based feedback loop with the user in place of
  direct browser QA.

- [x] (added 2026-07-20, done 2026-07-20) **Parent row: consistent action-chip styling, moved "Last checked in/out" into the row's empty space.**
  The user flagged (from reading the code, since the live browser QA tool
  wasn't available this session either) that the trailing "Check In"/"Check
  Out" text picked up inconsistent visual weight from the adjacent status
  `Badge` (solid `default` variant when checked-in vs muted `secondary` when
  checked-out) — one read as a clear button, the other didn't. Also asked to
  use the empty vertical space in the row (right side has less content than
  the left name+badge column) for the "Last checked in/out" line instead of
  a separate full-width line below.

  - Action label is now its own small pill (`bg-primary/10` chip, consistent
    regardless of status) instead of bare colored text next to the status
    badge.
  - "Last checked in/out" moved into that same right-hand column, stacked
    under the action chip (e.g. "In 4:30 PM" / "Out 12:18 PM"), removed from
    the separate line below the row.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass. **Not**
  verified in an actual mobile browser — no live browser QA tool available
  this session; flagged to the user to confirm visually.

- [x] (added 2026-07-20, done 2026-07-20) **Expected pickup dropdown: descending order, dynamic range from check-in time to 6 PM.**
  Follow-up to the admin-table descending sort: the *dropdown* itself
  (shown when checking in) also needed to list descending, and the fixed
  1:00–5:30 PM window didn't make sense — the earliest sensible pickup time
  is right after check-in, not a fixed clock time, and 6 PM (not 5:30) is
  the actual cutoff.

  **Confirmed plan:**
  - `generatePickupTimeOptions(fromHHMM)` replaces the old fixed
    module-level array: rounds `fromHHMM` up to the next 15-minute mark,
    generates every 15 minutes through 6:00 PM, returns them **reversed**
    (latest first). Recomputed on every render from the current `eventTime`
    field, so it updates live as the parent adjusts the check-in time.
  - Changing the Time field re-clamps `pickupTime` if the current selection
    is no longer in range (falls back to the new list's first/latest
    option).
  - Default pickup time on open: `17:00` if it's in range for "now",
    otherwise the latest available option.
  - Backend (`aama-service-k`): the fixed 19-slot whitelist in
    `validatePickupTime` no longer matches (the valid window is now
    dynamic and depends on `eventTime`, which the server would have to
    duplicate the "round up to 15 min, cap at 6 PM" logic to replicate
    exactly). Relaxed to format + 15-minute-alignment validation only — the
    "sensible range" stays a client-side UX nicety rather than a
    server-enforced invariant, since it's not security-sensitive.

  **Verified:** `npm run lint` (0 errors) and `npm run build` pass in both
  repos; backend `tsc` build passes. Curl-verified a pickup time outside
  the old fixed window (`18:00`) now succeeds, and a non-15-minute-aligned
  value still 400s.

- [x] (added 2026-07-20, done 2026-07-20) **Three small follow-ups: post-login redirect, last check-in/out on parent row, admin sort.**
  - `Header.tsx`: after any successful login (real Google or dev test-login,
    both parent and admin), navigate to `/checkin` regardless of which page
    the user was on — previously login left them wherever they were.
  - Parent's child row on `/checkin` now shows "Last checked in/out: <time>"
    (from the already-fetched `lastEventAt`), filling space that was
    previously blank when there was no daily note or pickup time to show.
  - Admin Dashboard table now sorts by "Expected pickup" descending (latest
    pickup time first); children with none (checked out, or no pickup set)
    sort after those with a value.

  **Verified:** `npm run lint` (0 errors, same 11 baseline warnings) and
  `npm run build` both pass.

- [x] (added 2026-07-20, done 2026-07-20) **Replace the confirm modal with an inline tap-to-expand row; add editable time + expected pickup time.**
  Supersedes the confirm-modal entry directly below (shipped same day). The
  user asked for a bigger rethink: remove the checkmark/circle "selector"
  icon, make tapping a child directly start the action, confirm with an
  editable time (defaults to now), and add an expected-pickup-time picker.
  Also asked to fold the dialog into the page instead of a separate
  component file, and to drop the word "staff" from this app's copy.

  **Confirmed plan (2026-07-20):**
  - No popup/overlay at all — tapping a child row expands the confirm
    fields (Time, Expected pickup [check-in only], Note) directly beneath
    that row, pushing the rest of the list down. Same treatment for the
    Admin Dashboard table (an inline `TableRow` under the target child).
    Only one row expands at a time across both parent and admin sections
    (shared `confirmTarget` state).
  - Deleted `src/components/CheckInOutDialog.tsx` — the confirm UI is
    inlined directly in `src/pages/CheckIn.tsx` (a local render function,
    not a separate component), since it's single-use on this one page.
  - Time field: native `<input type="time">`, defaults to the device's
    current time, editable — applies to both check-in and check-out.
  - Expected pickup field: shadcn `Select`, 19 options every 15 minutes from
    1:00 PM to 5:30 PM, default 5:00 PM, check-in only.
  - Note field unchanged in behavior (optional, 50-word cap), copy reworded
    to drop "staff" (also fixed two incidental "staff" mentions in this
    page's meta description and the sign-in dialog's role copy in
    `Header.tsx` — reworded to "admins").
  - Backend (`aama-service-k`) changes threading `eventTime`/`pickupTime`
    through to `/api/checkin`, `/api/checkout`, and the admin equivalents —
    see that repo's `feature.md` for the full write-up, including a
    `getLastEventForChild` ordering bug found and fixed during verification.

  **Verified (2026-07-20):** `npm run lint` (0 errors, same 11 baseline
  warnings) and `npm run build` both pass. Backend round-trip verified via
  curl (see `aama-service-k/feature.md`): custom `eventTime`/`pickupTime`
  land correctly, invalid values 400, `expectedPickupTime` clears on
  checkout. (Live browser QA tool unavailable this session — verified via
  lint/build/curl and manual review against this page's existing
  reset-on-open/rethrow-on-error conventions, same as the prior round.)

- [x] (added 2026-07-20, done 2026-07-20) **Replace inline check-in/out note field with a confirmation modal.**
  Follow-up to the inline/responsive note field below: at a 400px viewport
  the stacked layout's short textarea clipped the placeholder text. Rather
  than another CSS patch, the user asked to rethink the flow and proposed a
  modal that combines the check-in/check-out confirmation with the optional
  note field.

  **Confirmed plan (2026-07-20):** "i think modal is better, we can show it
  like confirmation for checkin checkout and note text also."
  - New `CheckInOutDialog` component: title confirms the action ("Check In
    {child}?" / "Check Out {child}?"), a full-size optional note `Textarea`
    with the parent-voiced placeholder, a word counter (50-word cap) shown
    once there's content, and Cancel/Confirm buttons — Confirm label goes
    dynamic (`Check In`/`Check Out` vs `Submit & Check In`/`Submit & Check
    Out`) same as before.
  - `CheckIn.tsx`'s parent card reverts to a simple icon+name+badge+Button
    row (no inline textarea); the Button now opens the modal instead of
    submitting directly. Word-count helper moved into the new component.
  - No backend changes — same `note` field/50-word cap as before, just a
    different place to type it.

  **Verified (2026-07-20):** `npm run lint` (0 errors, 10 baseline
  warnings) and `npm run build` both pass. Direct backend check confirmed
  a check-in with `note: "Grandma will pick up today"` round-trips
  correctly through `/api/checkin` and reverted via `/api/checkout` to
  restore prior state. (Live browser QA tool was unavailable this session;
  code was reviewed manually against the established dialog conventions
  used by `DailyNoteDialog`/`EnrollChildDialog`.)

- [x] (added 2026-07-17, done 2026-07-17) **Redesign parent's per-event note into an always-visible, self-explanatory field with a submitting button.**
  Follow-up to the just-shipped collapsed-behind-an-icon note field: the user
  found the placeholder example wrong (staff-voiced "napped well" instead of
  something a parent would actually write) and the flow unclear (parents
  don't realize the note is even submitted, or to whom).

  **Confirmed plan (2026-07-17):**
  - Drop the collapse-behind-`MessageSquarePlus`-icon toggle from the
    previous pass — show the note `Textarea` inline/always-visible next to
    the Check In/Check Out button again (compact, 1-2 rows), no click
    needed to discover it.
  - Placeholder becomes parent-voiced and concrete: "Write a note if you
    have — e.g. Grandma will pick up today" (replaces the old staff-voiced
    "napped well, bring extra diapers" example).
  - Button label goes dynamic: `Check In`/`Check Out` when the note field is
    empty, `Submit & Check In`/`Submit & Check Out` the moment the parent
    types anything (whitespace-only doesn't count) — this is what makes it
    obvious the note actually gets sent, without needing separate caption
    text explaining "staff will see this."
  - Word counter (`X/50 words`) only renders once the field has non-empty
    content — keeps the default (empty) state visually clean instead of
    showing "0/50 words" all the time.
  - No backend changes — this is a frontend-only copy/interaction redesign
    on top of the already-shipped `note` field and 50-word cap.
  - Admin's separate daily-note box ("Today's note") is untouched.

  **Verified (2026-07-17):** `npm run lint` (0 errors, 10 baseline warnings)
  and `npm run build` both pass. **QA'd live** via `gstack browse`: field is
  visible by default with the new placeholder, no counter shown while
  empty; typing a note flips the button to "Submit & Check In" and shows
  "5/50 words"; submitting checked the child in, cleared the field back to
  the placeholder, reverted the button to plain "Check Out", and a direct
  backend check confirmed the note ("Grandma will pick up today") landed
  exactly as typed. No console errors beyond the pre-existing, expected
  ones (React Router future-flag warnings, GSI localhost-origin warning).

  **Follow-up polish (2026-07-17):** moved the note field into the same row
  as the child info and Check In/Out button on wider screens (`sm:` and up)
  — fills the empty space between them instead of sitting on its own row.
  Responsive: below `sm`, reverts to the original stacked layout (info +
  button together on one row, full-width note below) via `sm:contents` +
  `sm:order-*`, since a naive single-row-always approach squeezed the note
  field down to ~1 character wide on a 390px mobile viewport — caught and
  fixed during QA, verified at both 390px and 1280px widths.

- [x] (added 2026-07-17, done 2026-07-17) **Admin daily note per child, shown to parents.**
  Companion to `aama-service-k/feature.md`'s same-named item (its "Confirmed
  approach" has the exact API shape). New endpoint:
  `PUT /api/admin/children/:childKey/daily-note` — body `{ note: string,
  date?: string }` (admin-auth). `ChildStatus` (parent- and admin-facing)
  gains `dailyNote: string | null` — always today's note.

  **Scope:** Admin Dashboard table gains a per-row action (small dialog,
  textarea + Save) to view/edit today's daily note for that child — separate
  from the existing per-event note column. Parent's "Check In / Out" card
  shows the daily note as a highlighted box whenever one exists for today
  (e.g. above the check-in/out button), always visible rather than gated
  behind the checkout click, so it's reliably seen without needing to
  intercept that specific action. This is a one-way note from staff to
  parents — no reply/thread UI, since admin can already see the parent's own
  per-event note in the existing "Last note" column.

  **Built:** new `src/components/DailyNoteDialog.tsx` (textarea + Save,
  pre-fills with today's existing note); `CheckIn.tsx`'s admin table gains a
  "Daily note" column and a `NotebookPen` icon action per row opening the
  dialog; parent's check-in card shows a highlighted `StickyNote` box
  ("Today's note from staff") whenever `child.dailyNote` is set;
  `lib/checkin.ts` gains `setDailyNote` and `dailyNote` on `ChildStatus`.

  **Verified (2026-07-17):** `npm run lint`/`npm run build` both pass.
  QA'd live via `gstack browse`: set a note as admin, confirmed it appeared
  on the parent's card immediately on next login; edited it again from the
  admin dialog (pre-filled correctly with the existing text) and confirmed
  the table + toast updated. No console errors.

  Companion backend half (`aama-service-k/feature.md`) already `[x]` done.

  **Follow-up polish (2026-07-17):** label shortened to just "Today's note"
  (dropped "from staff"). Parent's own per-event note textarea is now
  collapsed behind a small "Add a note (optional)" toggle
  (`MessageSquarePlus` icon) instead of always being visible — expands to
  the textarea + word counter on click (autofocused), with the counter
  itself now reading "X/50 words — totally optional" to make the
  non-mandatory nature explicit. Collapses again after a successful
  check-in/out. QA'd live: toggle expands/collapses correctly, no console
  errors.
- [x] (added 2026-07-17, done 2026-07-17) **Follow-up fixes to enrollment UI: per-guardian phone, editable enroll/left dates, rename comment→note with 50-word cap.**
  Companion to `aama-service-k/feature.md`'s same-named follow-up (marked
  `[~]` there — its "Confirmed approach" has the exact new API shapes).
  `EnrollChildDialog` gains a phone input next to each guardian email
  (`{ email, phone }` pairs instead of plain email strings), and two date
  inputs (enroll date, left date — both optional/editable, not read-only).
  Rename every user-facing "comment" to "note" (placeholder text, table
  column header, variable names in `lib/checkin.ts`/`CheckIn.tsx`) and
  enforce a 50-word cap client-side (live word count next to the textarea,
  matching the backend's real word-count validation, not a character-length
  proxy).

  **Built:** `EnrollChildDialog.tsx`'s `GuardianFormValue` is now
  `{ email, phone }`, with a second `Input` per guardian row and two native
  `type="date"` inputs (enroll date defaults to today only for a brand-new
  enrollment, not when editing); `lib/checkin.ts`'s types/functions renamed
  (`lastNote`, `guardians: Guardian[]`, `note` params) to match the backend;
  `CheckIn.tsx` renamed `commentByChild`→`noteByChild`, added a
  `countWords`/`MAX_NOTE_WORDS` live counter under the parent's note textarea
  (disables Check In/Out once over 50 words), renamed the admin table's
  "Last comment"→"Last note" column, and formats the Guardians column as
  `email (phone)` when a phone is present.

  **Verified (2026-07-17):** `npm run lint` (0 errors, 10 baseline warnings)
  and `npm run build` both pass. **QA'd live** via `gstack browse`: the
  Enroll dialog now shows email+phone side by side per guardian and an
  enroll-date input pre-filled to today; enrolled a child without a phone
  (optional field correctly not required); opened Edit on a child that *did*
  have a guardian phone/address/physician/enroll-date — every field,
  including phone and the date inputs, pre-filled correctly. Parent tab
  shows a live "X/50 words" counter under the note textarea. No console
  errors in the final state (some transient React error-boundary logs
  appeared *during* active file editing/HMR — confirmed gone on a clean
  reload once edits settled, not a real bug).

  Companion backend half (`aama-service-k/feature.md`) already `[x]` done.
- [x] (added 2026-07-17, done 2026-07-17) **Admin enrollment UI + admin-initiated check-in/out + parent comment field.**
  Companion frontend half of `aama-service-k/feature.md`'s enrollment/comment
  feature — **backend is now done and verified** (see that entry, marked
  `[x]`), so this is ready to build. Endpoints to consume:
  `POST /api/admin/children` — body `{ childName, guardianEmails: string[], address?, physicianInfo? }`,
  returns `{ childKey, guardianEmails }`.
  `PATCH /api/admin/children/:childKey` — body may include any of
  `childName`, `address`, `physicianInfo`, `guardianEmails` (full replacement
  list), returns `{ childKey, childName, address, physicianInfo, guardianEmails }`.
  `POST /api/admin/children/:childKey/deactivate` — no body, 204 on success.
  `POST /api/admin/checkin` / `POST /api/admin/checkout` — body
  `{ childKey, comment? }`, admin-auth, acts on any active child.
  Existing parent `POST /api/checkin`/`/api/checkout` now also accept an
  optional `comment` in the body. `GET /api/admin/status` now returns
  `AdminChildStatus` with `guardianEmails: string[]` (not a single
  `parentEmail`), plus `address`, `physicianInfo`, `enrollDate`,
  `lastComment` — one deduped entry per child even though the backend may
  have multiple roster rows per child. `GET /api/children` (parent-facing)
  now also returns `lastComment` on each `ChildStatus`.

  **Scope (`src/pages/CheckIn.tsx`, `src/lib/checkin.ts`):**
  - Admin Dashboard tab gains: an "Enroll Child" action opening a form (child
    name, **one or more guardian emails** — a repeatable/multi-entry email
    field, not a single input, since a child can have multiple authorized
    parents/guardians — address, physician name/phone), an "Edit" action per
    row opening the same form pre-filled (including the current guardian
    email list, addable/removable), a "Check In"/"Check Out" button per row
    (admin acting on any child), and an "Un-enroll" action per row (confirm
    dialog first) — refresh the table after each.
  - Parent "Check In / Out" tab gains an optional short comment field (text
    input, matching the backend's ~500-word/~3000-char cap) shown before the
    Check In/Check Out button, sent with the request.
  - Admin dashboard table shows each child's last comment (new `lastComment`
    field from `AdminChildStatus`) alongside status/last-event.
  - `lib/checkin.ts` gains typed client functions for all the new endpoints
    and extends `ChildStatus`/`AdminChildStatus` with `lastComment`.

  **Confirmed decisions carried over from the backend planning discussion
  (2026-07-17, revised same day for multi-guardian support):** child key is
  never entered by the admin (auto-generated server-side from the child's
  name); a child can have **multiple** authorized guardians (e.g. so parent A
  can check in and parent B can check the same child out) — the enroll/edit
  form must support a list of guardian emails, not one; un-enrolling is a
  soft-delete (`active=false` + `left-date` stamped for the whole child) with
  no hard-delete UI; admin-initiated check-in/out records the **admin's own
  email** in the event log (not a guardian's — there's no single "the
  parent" once a child has more than one), while parent-initiated check-in/
  out still logs whichever specific guardian performed that action. Don't
  add a manual child-key field or a "delete permanently" action.

  **Built:** new `src/components/EnrollChildDialog.tsx` — a shared
  create/edit form (child name, repeatable guardian-email list with
  add/remove, address, physician info) used for both "Enroll Child" and
  per-row "Edit". `src/lib/checkin.ts` gains `enrollChild`, `updateChild`,
  `deactivateChild`, `adminCheckInChild`, `adminCheckOutChild`, and the
  `ChildStatus`/`AdminChildStatus` type updates (`lastComment`,
  `guardianEmails`, `address`, `physicianInfo`, `enrollDate`).
  `src/pages/CheckIn.tsx`: parent "Check In / Out" cards gain a comment
  `Textarea` (cleared after a successful action); Admin Dashboard table
  gains Guardians/Last comment columns and per-row Check In/Out, Edit
  (pencil), and Un-enroll (user-minus, behind an `AlertDialog` confirm)
  actions, plus an "Enroll Child" button. Widened the page container from
  `max-w-3xl` to `max-w-5xl` — the admin table's new Actions column didn't
  fit in the old width.

  **Verified (2026-07-17):** `npm run lint` (0 errors, 10 baseline warnings)
  and `npm run build` (tsc + vite + prerender, all 5 routes) both pass.
  **QA'd live** via `gstack browse` against the real dev servers: signed in
  as `test:admin`, enrolled "Browser Test Kid" with two guardian emails
  (form correctly required at least one, supported adding/removing rows),
  confirmed it appeared in the table with both emails; admin-checked it in
  (status flipped, toast shown); opened Edit — form was correctly pre-filled
  including both guardians — removed one guardian and changed the address,
  saved, and confirmed the table updated to show only the remaining
  guardian; opened Un-enroll, confirmed the `AlertDialog` copy, confirmed,
  and the child correctly disappeared from the table. Separately signed in
  as `test:parent`: both of that parent's children showed the new comment
  textarea; checked one in, then checked the other out with a comment
  ("All good, checking out for the day") — confirmed via a direct
  `/api/admin/status` call that the comment landed correctly in the backend
  (`lastComment` matched exactly). No console errors at any step beyond the
  pre-existing, expected ones (React Router future-flag warnings, the real
  `GoogleLogin` widget's localhost GSI-origin warning/403).

  Companion backend half (`aama-service-k/feature.md`) already `[x]` done.
  One item still needs your real Google sign-in to close out (noted there):
  a real pass against the live Sheet with `AUTH_BYPASS_ENABLED=false`, since
  everything above ran against the bypass fixtures.
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
