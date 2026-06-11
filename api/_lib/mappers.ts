import { Lead, LoanApplication, Vehicle } from '../../src/types';

export function vehicleFromRow(row: any): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    make: row.make,
    model: row.model,
    trim: row.trim ?? '',
    year: row.year,
    price: Number(row.price ?? 0),
    mileage: Number(row.mileage ?? 0),
    fuel: row.fuel,
    transmission: row.transmission,
    image: row.image,
    gallery: row.gallery ?? [],
    bodyType: row.body_type,
    engine: row.engine,
    seats: row.seats,
    driveType: row.drive_type,
    color: row.color,
    condition: row.condition,
    availability: row.availability,
    location: row.location,
    vin: row.vin,
    negotiable: Boolean(row.negotiable),
    featured: Boolean(row.featured),
    loanEligible: Boolean(row.loan_eligible),
    description: row.description,
    features: row.features ?? [],
    createdAt: row.created_at,
  };
}

export function vehicleToRow(vehicle: Vehicle) {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    image: vehicle.image,
    gallery: vehicle.gallery,
    body_type: vehicle.bodyType,
    engine: vehicle.engine,
    seats: vehicle.seats,
    drive_type: vehicle.driveType,
    color: vehicle.color,
    condition: vehicle.condition,
    availability: vehicle.availability,
    location: vehicle.location,
    vin: vehicle.vin,
    negotiable: vehicle.negotiable,
    featured: vehicle.featured,
    loan_eligible: vehicle.loanEligible,
    description: vehicle.description,
    features: vehicle.features,
    created_at: vehicle.createdAt,
  };
}

export function leadFromRow(row: any): Lead {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    phone: row.phone,
    email: row.email ?? '',
    message: row.message,
    vehicleId: row.vehicle_id ?? undefined,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function leadToRow(lead: Omit<Lead, 'id' | 'createdAt' | 'status'> & Partial<Pick<Lead, 'id' | 'createdAt' | 'status'>>) {
  return {
    id: lead.id,
    type: lead.type,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    vehicle_id: lead.vehicleId,
    source: lead.source,
    status: lead.status ?? 'New',
    created_at: lead.createdAt,
  };
}

export function applicationFromRow(row: any): LoanApplication {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    type: row.type,
    status: row.status,
    name: row.name,
    phone: row.phone,
    email: row.email,
    idNumber: row.id_number,
    requestedAmount: Number(row.requested_amount ?? 0),
    assetValue: Number(row.asset_value ?? 0),
    durationMonths: row.duration_months,
    purpose: row.purpose,
    employment: row.employment ?? '',
    income: Number(row.income ?? 0),
    vehicleRegistration: row.vehicle_registration ?? '',
    vehicleYear: row.vehicle_year ?? undefined,
    vehicleCondition: row.vehicle_condition ?? '',
    propertyCounty: row.property_county ?? '',
    propertyLocation: row.property_location ?? '',
    propertySize: row.property_size ?? '',
    propertyType: row.property_type ?? '',
    ownership: row.ownership ?? '',
    documents: row.documents ?? [],
    notes: row.notes ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function applicationToRow(application: Omit<LoanApplication, 'id' | 'trackingNumber' | 'status' | 'notes' | 'createdAt' | 'updatedAt'> & Partial<LoanApplication>) {
  return {
    id: application.id,
    tracking_number: application.trackingNumber,
    type: application.type,
    status: application.status ?? 'Submitted',
    name: application.name,
    phone: application.phone,
    email: application.email,
    id_number: application.idNumber,
    requested_amount: application.requestedAmount,
    asset_value: application.assetValue,
    duration_months: application.durationMonths,
    purpose: application.purpose,
    employment: application.employment,
    income: application.income,
    vehicle_registration: application.vehicleRegistration,
    vehicle_year: application.vehicleYear,
    vehicle_condition: application.vehicleCondition,
    property_county: application.propertyCounty,
    property_location: application.propertyLocation,
    property_size: application.propertySize,
    property_type: application.propertyType,
    ownership: application.ownership,
    documents: application.documents ?? [],
    notes: application.notes ?? [],
    created_at: application.createdAt,
    updated_at: application.updatedAt,
  };
}
