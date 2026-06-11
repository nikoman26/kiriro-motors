# Kiriro Motors Build Plan

## Current State

This repo is a React 19 + Vite + TypeScript single-page app styled with Tailwind CSS v4. It already has:

- Public routes for home, showroom, vehicle detail, and loans.
- Static inventory in `src/data.ts`.
- A loan calculator and a loan application-style upload UI.
- Responsive navigation and footer.
- Passing checks after dependency install:
  - `npm run lint`
  - `npm run build`

The app is still a prototype. Inventory, applications, uploads, admin workflows, contact leads, authentication, and application tracking are not persistent yet.

## Product Goal

Build Kiriro Motors & Investment Limited as a digital automotive marketplace, financing platform, and lead generation engine.

The ASAP functional version should let customers:

- Browse and filter vehicles.
- View full vehicle details.
- Estimate financing.
- Send vehicle inquiries through form and WhatsApp.
- Apply for logbook, land title, or vehicle financing.
- Upload required application documents.
- Receive a tracking number.
- Contact the business quickly on mobile.

It should let staff:

- Log in to an admin area.
- Add, edit, feature, archive, and mark vehicles as sold.
- Review loan applications and uploaded documents.
- Update application status.
- View customer leads and inquiry history.

## Recommended ASAP Architecture

Keep the existing Vite app for speed, then add a local API layer and persistence.

- Frontend: React, TypeScript, React Router, Tailwind CSS.
- Backend: Express in `server/`.
- Validation: Zod schemas shared between client and server where practical.
- Database: PostgreSQL for production. SQLite can be used only as a short local fallback if PostgreSQL setup blocks progress.
- ORM: Prisma.
- Uploads: local `uploads/` for development, Cloudflare R2 or S3-compatible storage for production.
- Auth: admin email/password with JWT stored in an HTTP-only cookie.
- Notifications: start with mailto/WhatsApp links and persisted leads, then add email/SMS providers.

## Phase 1: Functional MVP

Target outcome: a working dealership and lending web app with persistence and admin management.

1. Stabilize app foundation
   - Rename routes from `/showroom` to `/cars`, keeping redirects from old paths.
   - Add missing public pages: `/contact`, `/about`, `/apply`.
   - Expand `Vehicle` type with slug, gallery, condition, availability, location, color, VIN, engine, seats, drive type, negotiable flag, featured flag, and timestamps.
   - Move calculator formulas into reusable utilities.
   - Replace prototype-only claims such as fake S3 encryption with accurate copy until real storage is connected.

2. Add backend and database
   - Add `server/` Express app.
   - Add Prisma schema for vehicles, leads, loan applications, documents, customers, admins, and application status history.
   - Seed starter inventory from `src/data.ts`.
   - Add API endpoints for inventory, leads, loan applications, document uploads, and admin login.

3. Complete public revenue flows
   - Vehicle inventory with filters for make, model, year, price, mileage, transmission, fuel, body type, condition, availability, and search.
   - Vehicle detail page with gallery, specs, finance estimate, inquiry form, WhatsApp CTA, share links, and schedule viewing form.
   - Unified `/apply` flow for vehicle finance, logbook loans, and land title loans.
   - Logbook and land title pages with eligibility calculators and guided forms.
   - Contact page with branch details, business hours, contact form, and WhatsApp CTA.

4. Build admin CMS
   - Admin login.
   - Vehicle CRUD with image upload and sold/archive controls.
   - Applications dashboard with status updates: submitted, under review, approved, disbursed, rejected.
   - Document viewer/download links for uploaded files.
   - Lead inbox for vehicle inquiries, contact forms, and viewing requests.

5. Polish and ship
   - Mobile-first responsive pass.
   - SEO metadata per page.
   - Loading, empty, success, and error states.
   - Form validation and duplicate-submit protection.
   - Production build verification.

## Phase 2: Growth Features

Add after the MVP is stable:

- Compare vehicles.
- Save vehicles/wishlist.
- Blog and resources.
- Trade-in valuation.
- Reservation flow.
- PDF vehicle brochure generation.
- Analytics dashboard.
- Email/SMS/WhatsApp API notifications.
- M-Pesa payments or reservation deposits.

## Phase 3: Premium Features

Add once data and workflows are reliable:

- AI vehicle recommendation.
- AI loan assistant.
- Customer portal with application tracking.
- Dealer network or marketplace expansion.
- Mobile app.

## Development Instructions

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Check TypeScript:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Recommended environment variables for the next implementation pass:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/kiriro"
JWT_SECRET="replace-with-a-long-random-secret"
UPLOAD_DIR="./uploads"
VITE_API_BASE_URL="http://localhost:3001"
VITE_WHATSAPP_NUMBER="254700000000"
```

## Definition Of Done For ASAP Launch

- `npm run lint` passes.
- `npm run build` passes.
- Public pages work on mobile and desktop.
- Vehicle inventory is loaded from the database, not hardcoded data.
- Admin can create, edit, publish, feature, archive, and mark vehicles sold.
- Loan applications persist and generate a tracking number.
- Uploaded documents are stored and visible to admin users.
- Inquiry, viewing, and contact forms persist leads.
- WhatsApp CTAs open with useful prefilled messages.
- No public copy claims encryption, S3, approval timelines, or integrations that are not actually implemented.
