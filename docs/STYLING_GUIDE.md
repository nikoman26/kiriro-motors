# Styling Guide

## Current Visual Direction

The prototype uses a premium automotive look:

- Dark backgrounds.
- Gold accents.
- Editorial serif headings.
- Tight uppercase metadata labels.
- Large vehicle imagery.
- Thin borders and glass-like panels.

The overall tone is luxury dealership plus asset-backed financing.

## Theme Tokens

Theme tokens are defined in `src/index.css`.

```css
--font-sans: "Inter", "Helvetica Neue", Arial, sans-serif;
--font-editorial: "Georgia", serif;
--font-display: "Georgia", serif;
--color-luxury-gold: #C5A059;
--color-luxury-cream: #EBE7E0;
```

## Global Styles

The `body` uses:

- background: `#0A0A0A`
- text: white
- font: `font-sans`

The `.glass-panel` utility provides:

- transparent white background
- blur backdrop
- subtle white border

## UI Patterns

Use these existing patterns when extending the app:

- Primary dark-section CTA: white background, black text, uppercase small label.
- Secondary dark-section CTA: transparent background, white border, white text.
- Finance/light-section CTA: black background, white text.
- Metadata labels: small uppercase text with wide tracking.
- Vehicle cards: image on top, concise details below, gold price text.
- Filter controls: compact controls with clear active states.
- Modals: fixed overlay, dark backdrop, centered content.

## Responsive Notes

Current breakpoints mainly use Tailwind defaults:

- `sm`
- `md`
- `lg`
- `xl`

Existing responsive behavior:

- Navigation switches to a mobile menu below `md`.
- Showroom filters collapse into a mobile panel below `md`.
- Vehicle grids collapse from multi-column layouts to one column on small screens.
- CTA groups stack vertically on mobile.

## Copy Guardrails

Do not show operational claims unless the feature exists.

Avoid claiming:

- encrypted upload
- S3 storage
- approval within exact hours
- real application submission
- real virtual tour
- official repayment terms

Use softer prototype-safe copy until those systems are implemented.

## Accessibility Notes

Needed improvements:

- Add visible focus states to interactive controls where missing.
- Ensure icon-only buttons have `aria-label`.
- Ensure modal close actions are keyboard-accessible.
- Trap focus inside modals once a modal abstraction exists.
- Ensure color contrast remains readable on image overlays.

## Asset Guidance

Current vehicle images are remote Unsplash URLs. For a production dealership site:

- Use actual inventory photos.
- Store vehicle galleries through admin upload.
- Provide descriptive alt text.
- Avoid relying on remote third-party sample images for production.
