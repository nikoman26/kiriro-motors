import { LoanProduct } from '../types';

export function calculateVehicleMonthlyPayment(price: number, deposit: number, durationMonths: number, annualRate = 16) {
  const principal = Math.max(price - deposit, 0);
  const monthlyRate = annualRate / 100 / 12;

  if (durationMonths <= 0) return 0;
  if (monthlyRate === 0) return principal / durationMonths;

  return principal * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / (Math.pow(1 + monthlyRate, durationMonths) - 1);
}

export function calculateAssetLoan(assetValue: number, product: LoanProduct, requestedAmount: number, durationMonths: number, monthlyRate = 3.2) {
  const ltv = product === 'land-title' ? 0.5 : product === 'logbook' ? 0.7 : 0.8;
  const maxLoan = assetValue * ltv;
  const approvedPrincipal = Math.min(Math.max(requestedAmount, 0), maxLoan);
  const totalRepayment = approvedPrincipal * (1 + (monthlyRate / 100) * Math.max(durationMonths, 1));
  const monthlyRepayment = totalRepayment / Math.max(durationMonths, 1);

  return {
    ltv,
    maxLoan,
    approvedPrincipal,
    totalRepayment,
    monthlyRepayment,
  };
}

export function isLoanEligible(assetValue: number, requestedAmount: number, product: LoanProduct) {
  const { maxLoan } = calculateAssetLoan(assetValue, product, requestedAmount, 12);
  return requestedAmount > 0 && requestedAmount <= maxLoan;
}
