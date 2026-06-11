# Assets

## Current Asset Folders

### `logo/`

The workspace contains logo and favicon assets:

| File | Type | Current use |
| --- | --- | --- |
| `logo.png` | PNG | Available as a source asset, not currently imported. |
| `favicon.png` | PNG | Available as a source asset, not currently imported. |
| `Asset 1.svg` | SVG | Not currently imported. |
| `Asset 1@3x.webp` | WebP | Not currently imported. |
| `Asset 2.png` | PNG | Not currently imported. |
| `Asset 2.svg` | SVG | Not currently imported. |
| `Asset 2@3x.webp` | WebP | Not currently imported. |
| `Asset 3.svg` | SVG | Not currently imported. |
| `Asset 3@3x.webp` | WebP | Not currently imported. |
| `Asset 4.png` | PNG | Not currently imported. |
| `Asset 4.svg` | SVG | Not currently imported. |
| `Asset 4@3x.webp` | WebP | Not currently imported. |

## Current UI Asset Usage

The React app currently uses remote Unsplash URLs for vehicle and showroom imagery. These URLs are defined in `src/data.ts`.

`logo/logo.svg` is copied into `public/logo.svg` and `public/favicon.svg`. The navigation and footer use `/logo.svg`; `index.html` uses `/favicon.svg`.

## Recommended Integration

For the next frontend pass:

1. Choose the approved primary logo variant.
2. Move public static assets into `public/` if they should be referenced by URL from `index.html`.
3. Import component-specific assets from `src/assets/` if they should be bundled by Vite.
4. Add favicon markup to `index.html` after the favicon is moved to `public/`.
5. Replace the text-only brand in `Navigation` with the approved logo where it improves recognition.

Recommended public asset structure:

```text
public/
  favicon.png
  logos/
    kiriro-primary.svg
    kiriro-mark.svg
    kiriro-light.svg
```

Recommended source asset structure:

```text
src/
  assets/
    vehicles/
    brand/
```

## Naming Rules

Use descriptive, stable file names before production:

- `kiriro-logo-primary.svg`
- `kiriro-logo-light.svg`
- `kiriro-logo-mark.svg`
- `kiriro-favicon.png`

Avoid generic names such as `Asset 1.svg` in code imports. Generic names make future maintenance and content replacement harder.

## Vehicle Image Rules

Production inventory should use real vehicle images from the dealership or verified sellers.

Each vehicle should have:

- primary image
- gallery images
- descriptive alt text
- optional video walkthrough URL
- optional 360-degree asset set only if real 360 assets exist

## Asset Optimization Rules

- Prefer SVG for logos and marks.
- Prefer WebP or AVIF for large photographic assets.
- Keep image dimensions appropriate for display size.
- Avoid loading full-resolution images inside small cards.
- Add lazy loading for below-the-fold image grids.
- Keep external sample imagery out of production inventory.
