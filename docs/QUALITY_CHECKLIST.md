# Quality Checklist

Use this checklist before handoff, demo, or deployment.

## Automated Checks

Run:

```bash
npm run lint
npm run build
```

Expected result:

- TypeScript check passes.
- Vite production build completes.
- No new warnings that indicate broken imports, missing assets, or invalid syntax.

## Manual Smoke Test

Check these pages:

- `/`
- `/showroom`
- `/showroom/v-001`
- `/loans`

On each page:

- Page loads without console errors.
- Navigation links work.
- Footer is visible and not overlapping content.
- Mobile layout is usable.
- Text is readable on image backgrounds.

## Home Page Checks

- Hero image loads.
- Primary CTAs route correctly.
- Featured vehicles render.
- Vehicle detail links open the expected detail page.
- Financing CTA routes to the loan page.

## Showroom Checks

- Body type filter updates results.
- Price slider updates results.
- Empty state appears for no matches.
- Clear filters restores vehicles.
- Vehicle card links open detail pages.
- Mobile filter toggle opens and closes.

## Vehicle Details Checks

- Valid vehicle IDs render details.
- Invalid vehicle IDs render the not-found state.
- Back button returns to showroom.
- Virtual tour modal opens and closes.
- Price and specs are formatted consistently.

## Loans Checks

- Loan calculator changes when asset type changes.
- Calculator sliders update totals.
- Starting logbook flow sets the correct labels.
- Starting land flow sets the correct labels.
- File validation rejects unsupported file types.
- File validation rejects files over configured limits.
- Submit button is disabled before files are selected.
- Final step displays a tracking number.

## Responsive Checks

Test at minimum:

- 390 x 844 mobile.
- 768 x 1024 tablet.
- 1440 x 900 desktop.

Look for:

- Text clipping.
- Button label overflow.
- Incoherent overlap.
- Sticky elements covering content.
- Cards changing height unexpectedly during interactions.

## Production Readiness Checks

Before real launch:

- Replace sample vehicle images with approved assets.
- Replace placeholder phone, email, and location.
- Remove unused dependencies or document why they remain.
- Replace static data with API-backed data.
- Ensure lead and loan forms persist.
- Ensure upload claims match the real storage implementation.
- Add privacy policy and terms pages.
- Add analytics only after privacy requirements are clear.
