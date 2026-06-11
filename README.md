# Kiriro Motors & Investment Limited

React/Vite prototype for a premium automotive marketplace and asset-backed financing platform.

The codebase is a Vite React app with Vercel API functions and a Supabase-ready persistence layer. If Supabase environment variables are missing, the app falls back to local demo storage so the UI remains usable during local development.

## Run Locally

Prerequisite: Node.js.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs on port `3000` by default.

## Implemented Routes

- `/` - home marketplace landing page
- `/cars` - inventory with advanced filters, save, compare, share, and recommendations
- `/cars/:slug` - vehicle details, gallery, finance estimate, inquiry, viewing, reservation, and brochure print/PDF flow
- `/loans` - financing hub
- `/logbook-loans` - logbook loan page
- `/land-title-loans` - land title loan page
- `/apply` - unified application portal, tracking dashboard, and trade-in valuation
- `/about` - company profile
- `/testimonials` - success stories
- `/blog` - resource center
- `/contact` - contact hub, map, WhatsApp, and lead form
- `/admin` - local staff CMS for vehicles, applications, leads, and analytics

## Quality Checks

Type-check the codebase:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Vercel + Supabase Deployment

This repo is configured for Vercel GitHub import:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites: configured in `vercel.json`
- Serverless API routes: `api/`

Set up Supabase before production deployment:

1. Create a new Supabase project.
2. Run [supabase/schema.sql](./supabase/schema.sql) in the Supabase SQL editor.
3. Create staff users in Supabase Auth.
4. Insert each staff user's UUID into `admin_profiles`.
5. Add the variables from [.env.example](./.env.example) to Vercel Preview and Production.

Server-only keys such as `SUPABASE_SERVICE_ROLE_KEY` must only be configured in Vercel environment variables, never in client code.

## Planning

See [BUILD_PLAN.md](./BUILD_PLAN.md) for the implementation roadmap, ASAP MVP scope, development instructions, and launch acceptance criteria.

## Codebase Documentation

Detailed documentation lives in [docs/](./docs/README.md).

Key documents:

- [Architecture](./docs/ARCHITECTURE.md)
- [Routes And Pages](./docs/ROUTES_AND_PAGES.md)
- [Components](./docs/COMPONENTS.md)
- [Data And State](./docs/DATA_AND_STATE.md)
- [Backend And API Plan](./docs/BACKEND_AND_API_PLAN.md)
- [Assets](./docs/ASSETS.md)
- [Styling Guide](./docs/STYLING_GUIDE.md)
- [Quality Checklist](./docs/QUALITY_CHECKLIST.md)
