# Architecture

## Current Runtime Architecture

Kiriro Motors is currently a client-rendered React single-page application.

```text
index.html
  -> src/main.tsx
    -> src/App.tsx
      -> Navigation
      -> route component
      -> Footer
```

The route components seed records from `src/data.ts` and then use localStorage utilities for demo persistence. There is no API client, no production database, and no server-side rendering in the current app.

## Source Tree

```text
src/
  App.tsx                  Route shell and scroll restoration
  main.tsx                 React entry point
  index.css                Tailwind import, theme tokens, global styles
  types.ts                 Shared TypeScript interfaces
  data.ts                  Static vehicle and loan tier seed data
  components/
    Navigation.tsx         Main responsive navigation
    Footer.tsx             Global footer and secondary links
    Home.tsx               Landing page and featured inventory preview
    Showroom.tsx           Inventory listing and client-side filters
    VehicleDetails.tsx     Vehicle detail view and virtual tour modal
    Loans.tsx              Loan product page and staged application UI
    Calculator.tsx         Asset-backed loan calculator
logo/
  Asset *.svg/png/webp      Brand logo variants, not currently imported
  favicon.png              Favicon asset, not currently wired into index.html
docs/
  *.md                     Human-facing project documentation
```

## Dependency Roles

| Package | Current role |
| --- | --- |
| `react`, `react-dom` | UI runtime. |
| `react-router-dom` | Client-side routing. |
| `vite` | Development server and production bundling. |
| `typescript` | Static type checking through `npm run lint`. |
| `tailwindcss`, `@tailwindcss/vite` | Utility styling and theme tokens. |
| `motion` | Entrance and layout animations. |
| `lucide-react` | Icon set used across navigation, CTAs, filters, and loan UI. |
| `express` | Installed but not yet used. Intended for the next backend pass. |
| `dotenv` | Installed but not yet used. Intended for backend environment loading. |
| `@google/genai` | Installed but not used by the current app. Keep only if AI assistant features are implemented. |

## Current Data Flow

1. `App.tsx` renders the shared layout and route components.
2. Public pages seed vehicles, loan tiers, testimonials, branches, and resources from `src/data.ts`.
3. Local demo records are read and written through `src/utils/storage.ts`.
4. Components keep UI state locally with `useState`.
5. Derived values such as filtered vehicles and formatted loan totals are calculated in component render logic, helpers, or `useMemo`.
6. Demo records survive page refresh through browser localStorage, but they are not shared between users or devices.

## Planned Production Architecture

The fastest functional platform should add an API and persistence layer without replacing the existing frontend.

```text
React/Vite frontend
  -> API client
    -> Express server
      -> Prisma ORM
        -> PostgreSQL
      -> Upload storage
      -> Notification providers
```

Recommended directories for the next implementation pass:

```text
server/
  index.ts
  app.ts
  routes/
  controllers/
  services/
  middleware/
  storage/
  auth/
prisma/
  schema.prisma
  seed.ts
src/
  api/
  lib/
  hooks/
  pages/
  components/
```

## Architectural Boundaries

Frontend responsibilities:

- Render public and admin screens.
- Validate forms before submission.
- Display loading, empty, error, and success states.
- Build WhatsApp and share links.
- Keep UI-only state such as open filters, selected files, active tab, and modal state.

Backend responsibilities:

- Persist vehicles, leads, users, loan applications, documents, and status history.
- Authenticate admin users.
- Validate and sanitize all submitted data.
- Store uploads in local development storage and production object storage.
- Emit notifications through email, SMS, or WhatsApp providers.
- Protect private document URLs and admin endpoints.

## Current Limitations

- Static `INVENTORY` means staff cannot manage vehicles without code changes.
- Loan applications only advance through a client-side mock workflow.
- File upload UI only stores `File` objects in browser memory.
- Tracking IDs are generated in render-time UI and are not durable.
- The route naming uses `/showroom`; the product plan recommends `/cars`.
- Some package dependencies are reserved for future work and are not used yet.

## Implementation Guardrails

- Keep visible copy honest. Do not claim encrypted uploads, S3 storage, approvals, or integrations before they exist.
- Add shared utilities before duplicating finance formulas across pages.
- Use typed API responses once the backend exists.
- Keep vehicle and loan data normalized in the database, but expose frontend-friendly DTOs.
- Add tests around finance calculations, application submission, and admin state transitions once those utilities and services exist.
