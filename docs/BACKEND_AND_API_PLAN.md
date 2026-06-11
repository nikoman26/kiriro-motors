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

## Admin API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Supabase Auth login, admin profile check, and HTTP-only session cookie. |
| `POST` | `/api/auth/logout` | Clear the admin session cookie. |
| `GET` | `/api/auth/me` | Return the current admin profile. |
| `GET` | `/api/admin/vehicles` | List all vehicles for staff. |
| `POST` | `/api/admin/vehicles` | Create a vehicle. |
| `PATCH` | `/api/admin/vehicles/:id` | Update status, featured flag, or vehicle fields. |
| `GET` | `/api/admin/applications` | List loan applications. |
| `PATCH` | `/api/admin/applications/:id` | Update application status and write status history. |
| `GET` | `/api/admin/leads` | List leads. |
| `PATCH` | `/api/admin/leads/:id` | Update lead status. |
| `GET` | `/api/admin/documents/:id/signed-url` | Create a short-lived private document download URL. |

## Supabase Setup

Run:

```sql
-- Supabase SQL editor
-- contents of supabase/schema.sql
```

Then create Auth users for staff and link them:

```sql
insert into public.admin_profiles (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
```

## Environment Variables

Client-safe:

```bash
VITE_SUPABASE_URL="https://PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="SUPABASE_PUBLIC_OR_ANON_KEY"
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
