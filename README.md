# Violation Reports

Mobile-first internal tool for recording site violations and generating a PDF report:
**Project → Violation Type → Photo → Details → PDF.**

Projects and violation types are fully data-driven (managed by admins in the app) —
nothing is hardcoded. Every generated report snapshots the project/violation/employee
data at the time of creation, so editing a project or violation later never changes
historical reports.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage) via `@supabase/ssr`
- `@react-pdf/renderer` for server-side PDF generation
- `browser-image-compression` for client-side photo compression before upload

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the entire contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates:
   - `profiles`, `projects`, `violation_types`, `reports` tables
   - Row Level Security policies (employees see their own reports; admins see everything;
     only admins can manage projects/violations)
   - The private `violation-photos` storage bucket + its access policies
   - A trigger that auto-creates a `profiles` row (role `employee`) whenever someone signs up

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from
**Project Settings → API** in Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never exposed to the client
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
NEXT_PUBLIC_COMPANY_LOGO_URL=   # optional, public image URL shown on the PDF header
```

## 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## 4. Create your first users

Anyone can create an account from **`/signup`** (name + email + password). Every new
account gets role `employee` automatically via the `handle_new_user` trigger.

To make someone an admin, run in the SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid-from-auth-users>';
```

(Find the UUID in **Authentication → Users**.) Admins can manage Projects and Violation
Types; employees can create and view their own reports.

> By default Supabase requires email confirmation before a new account can sign in. For
> local testing, either confirm the user manually in **Authentication → Users**, or turn
> off "Confirm email" under **Authentication → Providers → Email** in your project
> settings.

## 5. Using the app

1. Admin signs in → **Projects** → add a project.
2. Admin → **Violations** → add a violation type, and define the extra fields that
   violation's report needs (short text, long text, number, date, dropdown, checkbox).
   Project, violation, date/time, employee, and photo are always included automatically —
   only add fields that genuinely need manual input.
3. Any employee → **New Report** → select project → select violation → take/choose a
   photo → fill the fields → **Generate Report**.
4. The report appears in **Reports** with a **View / Download PDF** button.

## About the PDF template

No physical form/template file was provided during this build, so
[`src/lib/pdf/violation-report-document.tsx`](src/lib/pdf/violation-report-document.tsx)
implements a clean, professional default layout (company header, project/violation info
grid, photo section, a details table generated from the violation's configured fields,
notes, and signature blocks).

**To match your company's real form:** edit that one file only — it's a self-contained
`@react-pdf/renderer` document (plain `View`/`Text`/`Image` components with a stylesheet,
similar to CSS flexbox). Nothing else in the app needs to change: the data it receives
(`report` + `photoDataUri`) already contains everything — project, violation, employee,
photo, dynamic field values, and notes.

## Project structure

```
src/
  app/
    login/                     # sign-in page + server actions
    (app)/                     # protected app shell (sidebar/bottom-nav)
      dashboard/
      projects/                # admin CRUD
      violations/               # admin CRUD + dynamic field builder
      reports/
        new/                   # the report creation wizard
        [id]/                  # report detail + PDF link
      settings/                # profile
    api/reports/[id]/pdf/      # server route rendering the PDF
  components/
    nav/                       # sidebar, bottom nav, mobile header
    projects/ violations/ reports/  # feature components
    ui/                        # shared primitives (buttons via CSS classes, icons, etc.)
  lib/
    supabase/                  # browser/server/middleware Supabase clients
    pdf/                       # the PDF document template
    data.ts                    # server-side data-fetching helpers
    types.ts                   # shared TypeScript types
supabase/migrations/0001_init.sql
```

## Notes

- RLS is the source of truth for access control; server actions also check role where it
  improves UX, but the database will reject unauthorized writes regardless.
- Photos are stored privately in the `violation-photos` bucket under `{user_id}/{uuid}.ext`
  and served via short-lived signed URLs — the bucket is not public.
- Deactivating a project/violation hides it from the report wizard without touching past
  reports (which store a full snapshot). Deleting is also available; existing reports are
  unaffected because they never depend on the live row.
