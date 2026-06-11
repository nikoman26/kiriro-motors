# Routes And Pages

## Current Routes

| Route | Component | Purpose | Data source |
| --- | --- | --- | --- |
| `/` | `Home` | Marketplace landing page with slider, services, featured/latest vehicles, EMI calculator, process, testimonials, and CTA. | Supabase vehicles with local demo fallback |
| `/cars` | `Showroom` | Inventory with advanced filters, save, compare, share, grid/list controls, and recommendations. | Supabase vehicles with local demo fallback |
| `/cars/:slug` | `VehicleDetails` | Detail page with gallery, specs, finance, inquiry, WhatsApp, viewing, reservation, and brochure flow. | Supabase vehicles with local demo fallback |
| `/showroom` | redirect | Legacy inventory URL redirected to `/cars`. | n/a |
| `/showroom/:id` | `VehicleDetails` | Legacy detail URL still supported by ID lookup. | localStorage vehicles |
| `/loans` | `Loans` | Financing hub linking to vehicle finance, logbook, and land title flows. | static loan tiers |
| `/logbook-loans` | `LogbookLoans` | Logbook loan eligibility, calculator, form, documents, and tracking number generation. | Supabase applications/documents with local demo fallback |
| `/land-title-loans` | `LandTitleLoans` | Land title calculator, property form, documents, and tracking number generation. | Supabase applications/documents with local demo fallback |
| `/apply` | `Apply` | Unified application portal, application dashboard, document upload, and trade-in valuation. | Supabase applications/documents/leads with local demo fallback |
| `/about` | `About` | Company history, mission, values, licenses, partners, and timeline. | static content |
| `/testimonials` | `Testimonials` | Success stories and video placeholders. | static testimonials |
| `/blog` | `Blog` | SEO resource listing with search/category filtering. | static blog posts |
| `/contact` | `Contact` | Map, branches, WhatsApp CTA, and lead form. | static branches/Supabase leads with local demo fallback |
| `/admin` | `Admin` | Operations CMS for vehicles, applications, documents, leads, staff, analytics, and role-based workflows. | Supabase admin APIs with local demo fallback |
| `/pitch` | `Pitch` | Hidden owner presentation page with live demo links, business guidance, and labeled future-feature mockups. | static presentation content |

## Planned Route Map

| Route | Priority | Notes |
| --- | --- | --- |
| `/cars` | Implemented | Preferred inventory URL. `/showroom` redirects here. |
| `/cars/:slug` | Implemented | SEO-friendly vehicle detail route. |
| `/logbook-loans` | Implemented | Dedicated product page for vehicle-backed loans. |
| `/land-title-loans` | Implemented | Dedicated product page for property-backed loans. |
| `/apply` | Implemented | Unified finance application workflow. |
| `/contact` | Implemented | Contact hub, WhatsApp CTA, branch details, and lead form. |
| `/about` | Implemented | Company story, trust, values, certifications, and partners. |
| `/admin` | Implemented | Operations dashboard with Supabase-backed staff workflows and local fallback. |
| `/pitch` | Implemented | Public-but-hidden owner pitch page. Not linked from normal customer navigation. |
| `/admin?tab=vehicles` | Implemented | Vehicle CRUD and publishing controls. |
| `/admin?tab=applications` | Implemented | Loan application review and status management. |
| `/admin?tab=leads` | Implemented | Inquiry, contact, and viewing request inbox. |
| `/blog` | Phase 2 | SEO resources and buying guides. |
| `/track/:trackingId` | Phase 3 | Customer-facing application status page. |

## Primary Customer Journeys

### Buy A Vehicle

1. User lands on `/`.
2. User opens featured vehicle or goes to `/cars`.
3. User filters inventory.
4. User opens a vehicle detail page.
5. User checks price, specs, and finance estimate.
6. User sends an inquiry, opens WhatsApp, or schedules a viewing.

### Apply For Logbook Financing

1. User lands on `/logbook-loans` or `/apply`.
2. User checks basic eligibility and estimated repayment.
3. User submits personal, vehicle, and income details.
4. User uploads required documents.
5. Backend generates a tracking number.
6. Staff reviews the application in admin.

### Apply For Land Title Financing

1. User lands on `/land-title-loans` or `/apply`.
2. User enters property value and desired amount.
3. User submits property ownership and applicant details.
4. User uploads title deed, ID, KRA PIN, valuation, and supporting documents.
5. Staff reviews documents and updates status.

### Staff Vehicle Management

1. Staff logs into `/admin`.
2. Staff opens `/admin/vehicles`.
3. Staff creates or edits vehicle records.
4. Staff uploads gallery images.
5. Staff marks vehicles as featured, available, reserved, sold, or archived.
6. Public pages update from the database.

## Route Naming Notes

- Use `/cars` for public inventory because it is direct, SEO-friendly, and matches user search intent.
- Preserve `/showroom` as a redirect until any existing links can be retired.
- Use slugs rather than IDs for public vehicle URLs.
- Keep opaque IDs for API requests and admin records.
