# Data And State

## Current Static Data

Static data lives in `src/data.ts`.

### `INVENTORY`

The current vehicle data shape is:

```ts
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  image: string;
  bodyType: string;
  features: string[];
}
```

Current records are premium sample vehicles used to populate the homepage, showroom, and detail pages.

### `LOAN_TIERS`

The current loan tier data shape is:

```ts
interface LoanTier {
  id: string;
  title: string;
  description: string;
  maxLTV: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
}
```

`LOAN_TIERS` is defined but not currently rendered by the loan page. It is useful seed data for the planned backend.

## Current UI State

| Component | State | Purpose |
| --- | --- | --- |
| `Navigation` | `isOpen` | Mobile menu open or closed. |
| `Showroom` | `isFilterOpen` | Mobile filter panel visibility. |
| `Showroom` | `activeType` | Selected body type filter. |
| `Showroom` | `priceRange` | Max vehicle price filter. |
| `VehicleDetails` | `showVirtualTour` | Virtual tour modal visibility. |
| `Loans` | `pipelineStep` | Current loan application step. |
| `Loans` | `selectedAsset` | Chosen application type. |
| `Loans` | `files` | Client-side selected documents. |
| `Loans` | `dragActive` | Drag-and-drop UI state. |
| `Loans` | `uploadError` | File validation message. |
| `Calculator` | `assetType` | Calculator mode. |
| `Calculator` | `assetValue` | Estimated asset value. |
| `Calculator` | `durationMonths` | Repayment term. |
| `Calculator` | `interestRate` | Monthly interest value used by the prototype formula. |

## Persistence Gaps

The following should become persistent data:

- Vehicles.
- Vehicle galleries.
- Leads and inquiries.
- Viewing requests.
- Loan applications.
- Uploaded documents.
- Customers.
- Admin users.
- Application status history.
- Staff notes.
- Analytics events.

## Proposed Database Entities

### Vehicle

Recommended fields:

- `id`
- `slug`
- `make`
- `model`
- `trim`
- `year`
- `price`
- `mileage`
- `fuel`
- `transmission`
- `bodyType`
- `condition`
- `color`
- `engine`
- `driveType`
- `seats`
- `vin`
- `location`
- `description`
- `features`
- `availability`
- `negotiable`
- `featured`
- `createdAt`
- `updatedAt`

### VehicleImage

Recommended fields:

- `id`
- `vehicleId`
- `url`
- `alt`
- `sortOrder`
- `isPrimary`
- `createdAt`

### Lead

Recommended fields:

- `id`
- `type`
- `name`
- `phone`
- `email`
- `message`
- `vehicleId`
- `source`
- `status`
- `createdAt`

### LoanApplication

Recommended fields:

- `id`
- `trackingNumber`
- `type`
- `status`
- `name`
- `phone`
- `email`
- `idNumber`
- `requestedAmount`
- `assetValue`
- `durationMonths`
- `purpose`
- `createdAt`
- `updatedAt`

### LoanDocument

Recommended fields:

- `id`
- `applicationId`
- `documentType`
- `fileName`
- `mimeType`
- `sizeBytes`
- `storageKey`
- `createdAt`

### AdminUser

Recommended fields:

- `id`
- `email`
- `passwordHash`
- `name`
- `role`
- `createdAt`
- `lastLoginAt`

## Data Migration Path

1. Expand `Vehicle` in `src/types.ts`.
2. Normalize `src/data.ts` so it resembles seed data.
3. Add Prisma schema.
4. Create a seed script that inserts current inventory.
5. Replace direct imports of `INVENTORY` with an API client.
6. Keep static data only as fallback fixtures for tests or local demos.
