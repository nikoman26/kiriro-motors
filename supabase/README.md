# Supabase Setup

Run `schema.sql` in a new Supabase project's SQL editor before connecting Vercel.

After creating the first staff user in Supabase Auth, add them to `admin_profiles`:

```sql
insert into public.admin_profiles (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
```

Vercel environment variables:

```bash
VITE_SUPABASE_URL="https://PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="public-or-anon-key"
SUPABASE_URL="https://PROJECT_ID.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-or-secret-key"
SUPABASE_DOCUMENTS_BUCKET="kiriro-loan-documents"
SUPABASE_VEHICLES_BUCKET="kiriro-vehicle-images"
SITE_URL="https://your-vercel-domain.vercel.app"
VITE_WHATSAPP_NUMBER="254700000000"
```
