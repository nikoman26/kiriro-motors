# Supabase Setup

Run `schema.sql` in a new Supabase project's SQL editor before connecting Vercel.

If your machine cannot connect to the direct `db.<project-ref>.supabase.co` host because it is IPv6-only, copy the SQL from `schema.sql` into the Supabase dashboard SQL editor instead. Alternatively, paste Supabase's Transaction Pooler connection string into `.env.local` as `DATABASE_URL` and run:

```powershell
npm run supabase:schema
```

After creating the first staff user in Supabase Auth, add them to `admin_profiles`:

```sql
insert into public.admin_profiles (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
```

Or seed/update the default admin account from this repo:

```powershell
$env:ADMIN_PASSWORD='use-the-shared-password-for-this-run-only'
npm run seed:admin
Remove-Item Env:\ADMIN_PASSWORD
```

The script creates or updates `admin@kiriromotors.com` by default and upserts the matching `admin_profiles` row. Override the email with `ADMIN_EMAIL` if needed.

For this project, the Auth user has already been created. After `schema.sql` is applied, rerun `npm run seed:admin` with `ADMIN_PASSWORD` set so the script can insert the `admin_profiles` row.

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
