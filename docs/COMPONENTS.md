# Components

## `App.tsx`

Owns the application shell:

- Creates the `BrowserRouter`.
- Renders `Navigation` above the active route.
- Renders `Footer` below the active route.
- Defines the current route table.
- Uses `ScrollToTop` so route changes start at the top of the page.

Future changes:

- Add redirects from `/showroom` to `/cars`.
- Add missing routes for contact, about, apply, and admin.
- Consider route-level lazy loading when the app grows.

## `Navigation.tsx`

Responsive top navigation.

Current behavior:

- Shows brand link to `/`.
- Shows desktop links for showroom and financial services.
- Shows a mobile menu controlled by `isOpen`.
- Highlights active desktop links when the current path starts with a link path.

State:

- `isOpen`: controls mobile menu visibility.

Future changes:

- Add links for `/cars`, `/logbook-loans`, `/land-title-loans`, `/contact`, and `/admin`.
- Replace "Client Portal" with the correct route once customer tracking exists.
- Add click tracking for WhatsApp and inquiry CTAs if analytics are introduced.

## `Footer.tsx`

Global footer with brand statement, secondary links, and contact details.

Current behavior:

- Provides automotive, finance, and contact link groups.
- Uses static contact details.
- Shows a dynamic copyright year.

Future changes:

- Move branch and contact data into a shared config file or database.
- Replace placeholder phone and email with production values.
- Add legal links once privacy and terms pages exist.

## `Home.tsx`

Landing page for the dealership and financing platform.

Current sections:

- Hero with image background and primary CTAs.
- Trust pillars.
- Featured arrivals from the first three `INVENTORY` records.
- Financing CTA section.

Data:

- Reads `INVENTORY.slice(0, 3)` directly from static data.

Future changes:

- Use `featured` flag from backend vehicles.
- Add finance calculator preview.
- Add testimonials, latest arrivals, loan process, and final CTA from the product brief.
- Replace generic imagery with approved brand or inventory assets.

## `Showroom.tsx`

Inventory listing page.

Current behavior:

- Reads all vehicles from `INVENTORY`.
- Filters by body type.
- Filters by maximum price.
- Displays responsive vehicle cards.
- Displays an empty state and reset action when no vehicles match.
- Has a mobile filter drawer/toggle.

State:

- `isFilterOpen`: controls mobile filter visibility.
- `activeType`: selected body type filter.
- `priceRange`: maximum accepted vehicle price.

Derived data:

- `bodyTypes`: unique body types from inventory.
- `filteredInventory`: memoized result of body type and price filters.

Future changes:

- Add filters for make, model, year, mileage, transmission, fuel, condition, availability, color, and search.
- Read filter defaults from query params.
- Move filtering to the backend once inventory grows.
- Add sort, pagination, compare, save, and share actions.

## `VehicleDetails.tsx`

Vehicle detail page.

Current behavior:

- Reads `id` from URL params.
- Finds a matching vehicle in `INVENTORY`.
- Shows a not-found state if no vehicle exists.
- Displays hero image, summary specs, features, price, availability badge, and CTAs.
- Opens a modal that simulates a 360-degree virtual tour.

State:

- `showVirtualTour`: controls modal visibility.

Future changes:

- Use slug-based lookup.
- Add real gallery thumbnails, zoom, fullscreen mode, and video walkthrough.
- Add inquiry form, WhatsApp link, schedule viewing, finance calculator, and related vehicles.
- Do not label the virtual tour as real unless actual 360 assets exist.

## `Loans.tsx`

Loan product and application prototype page.

Current behavior:

- Presents logbook and land title finance service cards.
- Lets the user choose an asset type and start a staged application flow.
- Provides a file drop zone and file input.
- Performs client-side file type and size checks.
- Shows a generated tracking ID at the final step.

State:

- `pipelineStep`: current application step.
- `selectedAsset`: `logbook`, `land`, or `null`.
- `files`: selected files held in browser memory.
- `dragActive`: drag-and-drop visual state.
- `uploadError`: validation error for rejected files.
- `fileInputRef`: opens native file picker from custom drop zone.

Important caveat:

- Files are not uploaded anywhere. They are only kept in local component state.
- Tracking IDs are not persisted and should not be treated as real application records.

Future changes:

- Split logbook, land title, and unified apply flows into dedicated pages or smaller form components.
- Submit application data to an API.
- Store documents securely.
- Persist tracking IDs and application status history.
- Replace simulated security claims with real implementation details.

## `Calculator.tsx`

Asset-backed loan estimate calculator.

Current behavior:

- Lets the user choose logbook or land title asset type.
- Lets the user adjust asset value, monthly interest rate, and duration.
- Calculates maximum loan amount using loan-to-value:
  - Logbook: 70 percent
  - Land title: 50 percent
- Calculates simple total repayment and monthly repayment.

State:

- `assetType`
- `assetValue`
- `durationMonths`
- `interestRate`

Future changes:

- Move formulas into a shared finance utility.
- Add tests for calculation rules.
- Confirm actual interest and fee rules before presenting estimates as official.
- Add disclaimers and validation around ranges.
