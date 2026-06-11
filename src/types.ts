/**
 * Vehicle data displayed across the public marketplace UI.
 *
 * The current app persists staff edits in localStorage. A production backend
 * should use the same fields as its public vehicle DTO where practical.
 */
export type VehicleAvailability = 'Available' | 'Reserved' | 'Sold' | 'Archived';

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  image: string;
  gallery: string[];
  bodyType: string;
  engine: string;
  seats: number;
  driveType: string;
  color: string;
  condition: string;
  availability: VehicleAvailability;
  location: string;
  vin: string;
  negotiable: boolean;
  featured: boolean;
  loanEligible: boolean;
  description: string;
  features: string[];
  createdAt: string;
}

/**
 * Financing product summary used as seed data for asset-backed loan offerings.
 *
 * These values describe product boundaries for the prototype. Real repayment,
 * fee, and approval rules should come from verified business policy before
 * being exposed as production loan terms.
 */
export interface LoanTier {
  id: string;
  title: string;
  description: string;
  maxLTV: number; // Max Loan to Value percentage
  minAmount: number;
  maxAmount: number;
  processingTime: string;
}

export type LoanProduct = 'vehicle-financing' | 'logbook' | 'land-title';

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected';

export interface LoanApplication {
  id: string;
  trackingNumber: string;
  type: LoanProduct;
  status: ApplicationStatus;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  requestedAmount: number;
  assetValue: number;
  durationMonths: number;
  purpose: string;
  employment?: string;
  income?: number;
  vehicleRegistration?: string;
  vehicleYear?: number;
  vehicleCondition?: string;
  propertyCounty?: string;
  propertyLocation?: string;
  propertySize?: string;
  propertyType?: string;
  ownership?: string;
  documents: string[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed';

export interface Lead {
  id: string;
  type: 'vehicle-inquiry' | 'contact' | 'viewing' | 'reservation' | 'trade-in' | 'brochure' | 'whatsapp';
  name: string;
  phone: string;
  email?: string;
  message: string;
  vehicleId?: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  date: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  result: string;
}

export interface Branch {
  name: string;
  location: string;
  phone: string;
  email: string;
  hours: string;
}
