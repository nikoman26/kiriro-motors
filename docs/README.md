# Documentation Index

This directory documents the Kiriro Motors & Investment Limited codebase as it exists today and the intended path toward a fully functional marketplace and financing platform.

The current application is a frontend MVP prototype. It is useful for validating visual direction, primary customer flows, copy, route structure, and staff workflows. It persists demo inventory, loan applications, leads, saved vehicles, and admin changes in localStorage. It does not yet have a production backend, database, authentication service, private upload storage, or real notification integrations.

## Start Here

- [Architecture](./ARCHITECTURE.md): how the current React/Vite app is organized and how the planned backend should fit.
- [Routes And Pages](./ROUTES_AND_PAGES.md): current public routes, planned route changes, and user journeys.
- [Components](./COMPONENTS.md): responsibilities of each React component in `src/components`.
- [Data And State](./DATA_AND_STATE.md): static data model, local UI state, and persistence gaps.
- [Backend And API Plan](./BACKEND_AND_API_PLAN.md): proposed Express, Prisma, PostgreSQL, upload, and auth contracts.
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
- A local admin CMS for inventory, loan applications, leads, and analytics.
- Responsive navigation and footer.
- Logo and favicon wired from `logo/logo.svg` through `public/logo.svg` and `public/favicon.svg`.

The app currently lacks:

- Real backend API calls.
- Database persistence beyond browser localStorage.
- Production-grade admin authentication.
- Real document storage.
- Real notification integrations.
- Production integrations for WhatsApp, SMS, email, payments, or maps.

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
