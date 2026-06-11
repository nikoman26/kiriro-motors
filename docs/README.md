# Documentation Index

This directory documents the Kiriro Motors & Investment Limited codebase as it exists today and the intended path toward a fully functional marketplace and financing platform.

The current application is a Vite React app with a Supabase-backed production layer through Vercel API functions. It still keeps localStorage fallback data for demos when the backend is unavailable, but inventory, loan applications, private documents, leads, staff profiles, and admin workflow actions now have production API paths.

## Start Here

- [Architecture](./ARCHITECTURE.md): how the current React/Vite app is organized and how the planned backend should fit.
- [Routes And Pages](./ROUTES_AND_PAGES.md): current public routes, planned route changes, and user journeys.
- [Components](./COMPONENTS.md): responsibilities of each React component in `src/components`.
- [Data And State](./DATA_AND_STATE.md): static data model, local UI state, and persistence gaps.
- [Backend And API Plan](./BACKEND_AND_API_PLAN.md): Vercel API, Supabase database/storage/auth, upload, and admin workflow contracts.
- [Assets](./ASSETS.md): current logo files, intended usage, and production asset rules.
- [Styling Guide](./STYLING_GUIDE.md): Tailwind theme, visual conventions, and implementation guardrails.
- [Quality Checklist](./QUALITY_CHECKLIST.md): manual and automated checks before handoff or release.
- [Build Plan](../BUILD_PLAN.md): phased delivery plan for the full platform.

## Current App Snapshot

The app currently provides:

- A premium automotive landing page.
- A car inventory page with advanced filters, saved vehicles, comparison, sharing, and recommendations.
- A vehicle details page with gallery controls, finance estimates, inquiry, viewing, reservation, WhatsApp, and brochure print/PDF flow.
- Dedicated logbook and land title loan pages.
- A unified application portal with status tracking and trade-in valuation.
- About, testimonials, blog/resources, and contact pages.
- An operations admin CMS for inventory, loan applications, private documents, leads, staff, analytics, and role-based workflows.
- A hidden `/pitch` owner presentation page with live demo links and clearly labeled future-feature mockups.
- Responsive navigation and footer.
- Logo and favicon wired from `logo/logo.svg` through `public/logo.svg` and `public/favicon.svg`.

Known remaining production gaps:

- Real notification integrations.
- Production integrations for SMS, email, payments, or maps.
- Final privacy and terms copy for real customer document collection.
- Automated end-to-end tests around admin workflows and uploads.

## Primary Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Documentation Maintenance Rule

When a route, component, data shape, environment variable, or workflow changes, update the matching document in this folder during the same change. This prevents the prototype and the platform roadmap from drifting apart.
