# Backend And API Plan

## Current Backend Architecture

The app now uses a Vercel API function in `api/[...path].ts` with Supabase as the production database, auth, and storage provider.

All `/api/*` endpoints are routed through that single catch-all function so the deployment remains compatible with Vercel Hobby plan limits while preserving the public URL contract.

Local development still works without Supabase credentials because `src/utils/storage.ts` falls back to browser demo storage when `/api/*` routes are unavailable or return a Supabase configuration error.

## Production Stack

- Frontend: Vite React deployed to Vercel.
- API: one Vercel Node catch-all serverless function in `api/[...path].ts`.
- Database: Supabase Postgres.
- Auth: Supabase Auth plus `admin_profiles`.
- Storage: Supabase Storage buckets:
  - `kiriro-loan-documents` private
  - `kiriro-vehicle-images` public
- Security: Row Level Security policies in `supabase/schema.sql`, with sensitive writes routed through server-side functions.

## Public API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/vehicles` | List available/reserved public vehicles. |
| `GET` | `/api/vehicles/:slug` | Read one public vehicle by slug or ID. |
| `POST` | `/api/leads` | Create inquiry, contact, viewing, reservation, trade-in, or brochure leads. |
| `POST` | `/api/applications` | Create a loan or vehicle finance application and tracking number. |
| `GET` | `/api/applications/track/:trackingNumber` | Return limited customer-facing application status. |
| `POST` | `/api/applications/:id/documents` | Create a private document record and signed upload URL. |
| `POST` | `/api/applications/:id/documents/:documentId/complete` | Mark a signed document upload complete after the browser upload succeeds. |

## Admin API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Supabase Auth login, admin profile check, and HTTP-only session cookie. |
| `POST` | `/api/auth/logout` | Clear the admin session cookie. |
| `GET` | `/api/auth/me` | Return the current admin profile. |
| `GET` | `/api/admin/vehicles` | List all vehicles for staff. |
| `POST` | `/api/admin/vehicles` | Create a vehicle. |
| `PATCH` | `/api/admin/vehicles/:id` | Update status, featured flag, or vehicle fields. |
| `POST` | `/api/admin/vehicle-images/upload` | Create a signed upload URL for a public vehicle image. |
| `GET` | `/api/admin/applications` | List loan applications. |
| `GET` | `/api/admin/applications/:id` | Read one application with documents and status history. |
| `PATCH` | `/api/admin/applications/:id` | Update application status and write status history. |
| `GET` | `/api/admin/leads` | List leads. |
| `GET` | `/api/admin/leads/:id` | Read one lead with assignment and notes. |
| `PATCH` | `/api/admin/leads/:id` | Update lead status, assignment, priority, and notes. |
| `GET` | `/api/admin/documents/:id/signed-url` | Create a short-lived private document download URL. |
| `PATCH` | `/api/admin/documents/:id` | Mark a private document reviewed or unreviewed. |
| `GET` | `/api/admin/staff` | List admin profiles for assignment controls. |
| `POST` | `/api/admin/staff` | Owner-only staff Auth user and profile creation. |
| `PATCH` | `/api/admin/staff/:id` | Owner-only role/profile/active-state updates. |
| `GET` | `/api/admin/analytics` | Return operations metrics, source breakdowns, and recent audit events. |

## Supabase Setup

Run:

```sql
-- Supabase SQL editor
-- contents of supabase/schema.sql
```

Then create Auth users for staff and link them:

```sql
insert into public.admin_profiles (id, email, role, full_name, is_active)
values ('AUTH_USER_UUID', 'admin@example.com', 'owner', 'Owner Admin', true);
```

## Environment Variables

Client-safe:

```bash
VITE_SUPABASE_URL="https://PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="SUPABASE_PUBLIC_OR_ANON_KEY"
VITE_SUPABASE_DOCUMENTS_BUCKET="kiriro-loan-documents"
VITE_SUPABASE_VEHICLES_BUCKET="kiriro-vehicle-images"
VITE_WHATSAPP_NUMBER="254700000000"
SITE_URL="https://your-domain.com"
```

Server-only:

```bash
SUPABASE_URL="https://PROJECT_ID.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_OR_SECRET_KEY"
SUPABASE_DOCUMENTS_BUCKET="kiriro-loan-documents"
SUPABASE_VEHICLES_BUCKET="kiriro-vehicle-images"
```

Never expose the service role key through `VITE_*` variables.
