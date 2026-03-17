import type { MortgageCalculationParameters } from '../services/mortgageParameters';

export interface ApplicantFinancials {
  grossMonthlyIncome: number;
  otherIncome: number;
  creditCardPayments: number;
  carLoanPayments: number;
  studentLoanPayments: number;
  otherDebtPayments: number;
}

export interface LoanParameters {
  loanAmount: number;
  propertyPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  monthlyPayment: number;
  interestRate: number;
  loanTermYears: number;
}

export interface DebtServiceResults {
  gdsRatio: number;
  tdsRatio: number;
  ltvRatio: number;
  monthlyHousingCosts: number;
  totalMonthlyDebt: number;
  qualifiesGDS: boolean;
  qualifiesTDS: boolean;
  estimatedPropertyTax: number;
  estimatedHeating: number;
}

export interface QualificationScoreBreakdown {
  totalScore: number;
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  gdsScore: number;
  tdsScore: number;
  downPaymentScore: number;
  employmentScore: number;
  incomeScore: number;
}

export function calculateDebtServiceRatios(
  applicant: ApplicantFinancials,
  loan: LoanParameters,
  coApplicant?: ApplicantFinancials,
  params?: MortgageCalculationParameters | null
): DebtServiceResults {
  const propertyTaxRate = params?.property_tax_rate ?? 1.25;
  const heatingCost = params?.heating_cost_monthly ?? 150;
  const gdsQualifying = params?.gds_qualifying_threshold ?? 32;
  const tdsQualifying = params?.tds_qualifying_threshold ?? 40;

  const estimatedPropertyTax = (loan.propertyPrice * (propertyTaxRate / 100)) / 12;
  const estimatedHeating = heatingCost;

  const monthlyHousingCosts =
    loan.monthlyPayment +
    estimatedPropertyTax +
    estimatedHeating;

  const applicantIncome = applicant.grossMonthlyIncome + (applicant.otherIncome || 0);
  const coApplicantIncome = coApplicant
    ? coApplicant.grossMonthlyIncome + (coApplicant.otherIncome || 0)
    : 0;
  const totalGrossMonthlyIncome = applicantIncome + coApplicantIncome;

  const applicantDebts =
    (applicant.creditCardPayments || 0) +
    (applicant.carLoanPayments || 0) +
    (applicant.studentLoanPayments || 0) +
    (applicant.otherDebtPayments || 0);

  const coApplicantDebts = coApplicant
    ? (coApplicant.creditCardPayments || 0) +
      (coApplicant.carLoanPayments || 0) +
      (coApplicant.studentLoanPayments || 0) +
      (coApplicant.otherDebtPayments || 0)
    : 0;

  const totalMonthlyDebt = applicantDebts + coApplicantDebts;

  const gdsRatio = (monthlyHousingCosts / totalGrossMonthlyIncome) * 100;
  const tdsRatio = ((monthlyHousingCosts + totalMonthlyDebt) / totalGrossMonthlyIncome) * 100;
  const ltvRatio = (loan.loanAmount / loan.propertyPrice) * 100;

  return {
    gdsRatio: Number(gdsRatio.toFixed(2)),
    tdsRatio: Number(tdsRatio.toFixed(2)),
    ltvRatio: Number(ltvRatio.toFixed(2)),
    monthlyHousingCosts: Number(monthlyHousingCosts.toFixed(2)),
    totalMonthlyDebt: Number(totalMonthlyDebt.toFixed(2)),
    qualifiesGDS: gdsRatio <= gdsQualifying,
    qualifiesTDS: tdsRatio <= tdsQualifying,
    estimatedPropertyTax: Number(estimatedPropertyTax.toFixed(2)),
    estimatedHeating: estimatedHeating,
  };
}

export function calculateQualificationScore(
  dsrResults: DebtServiceResults,
  downPaymentPercent: number,
  yearsEmployed: number,
  grossAnnualIncome: number,
  loanAmount: number,
  params?: MortgageCalculationParameters | null
): QualificationScoreBreakdown {
  const gdsExcellent = params?.gds_excellent_threshold ?? 28;
  const gdsGood = params?.gds_good_threshold ?? 32;
  const gdsFair = params?.gds_fair_threshold ?? 35;
  const gdsWeight = params?.gds_score_weight ?? 20;

  const tdsExcellent = params?.tds_excellent_threshold ?? 35;
  const tdsGood = params?.tds_good_threshold ?? 40;
  const tdsFair = params?.tds_fair_threshold ?? 44;
  const tdsWeight = params?.tds_score_weight ?? 20;

  const scoreExcellent = params?.score_excellent_threshold ?? 80;
  const scoreGood = params?.score_good_threshold ?? 65;
  const scoreFair = params?.score_fair_threshold ?? 50;

  let gdsScore = 0;
  if (dsrResults.gdsRatio <= gdsExcellent) gdsScore = gdsWeight;
  else if (dsrResults.gdsRatio <= gdsGood) gdsScore = gdsWeight * 0.75;
  else if (dsrResults.gdsRatio <= gdsFair) gdsScore = gdsWeight * 0.5;
  else gdsScore = gdsWeight * 0.25;

  let tdsScore = 0;
  if (dsrResults.tdsRatio <= tdsExcellent) tdsScore = tdsWeight;
  else if (dsrResults.tdsRatio <= tdsGood) tdsScore = tdsWeight * 0.75;
  else if (dsrResults.tdsRatio <= tdsFair) tdsScore = tdsWeight * 0.5;
  else tdsScore = tdsWeight * 0.25;

  let downPaymentScore = 0;
  if (downPaymentPercent >= 20) {
    downPaymentScore = params?.down_payment_20_plus_score ?? 25;
  } else if (downPaymentPercent >= 15) {
    downPaymentScore = params?.down_payment_15_to_20_score ?? 20;
  } else if (downPaymentPercent >= 10) {
    downPaymentScore = params?.down_payment_10_to_15_score ?? 15;
  } else if (downPaymentPercent >= 5) {
    downPaymentScore = params?.down_payment_5_to_10_score ?? 10;
  } else {
    downPaymentScore = params?.down_payment_under_5_score ?? 5;
  }

  let employmentScore = 0;
  if (yearsEmployed >= 5) {
    employmentScore = params?.employment_5_plus_years_score ?? 20;
  } else if (yearsEmployed >= 3) {
    employmentScore = params?.employment_3_to_5_years_score ?? 15;
  } else if (yearsEmployed >= 1) {
    employmentScore = params?.employment_1_to_3_years_score ?? 10;
  } else {
    employmentScore = params?.employment_under_1_year_score ?? 5;
  }

  let incomeScore = 0;
  const loanToIncome = loanAmount / (grossAnnualIncome || 1);
  if (loanToIncome < 3) {
    incomeScore = params?.income_ratio_under_3_score ?? 15;
  } else if (loanToIncome < 4) {
    incomeScore = params?.income_ratio_3_to_4_score ?? 10;
  } else if (loanToIncome < 5) {
    incomeScore = params?.income_ratio_4_to_5_score ?? 5;
  } else {
    incomeScore = params?.income_ratio_over_5_score ?? 0;
  }

  const totalScore = Math.min(100, gdsScore + tdsScore + downPaymentScore + employmentScore + incomeScore);

  let category: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  let color: string;

  if (totalScore >= scoreExcellent) {
    category = 'Excellent';
    color = 'green';
  } else if (totalScore >= scoreGood) {
    category = 'Good';
    color = 'blue';
  } else if (totalScore >= scoreFair) {
    category = 'Fair';
    color = 'amber';
  } else {
    category = 'Poor';
    color = 'red';
  }

  return {
    totalScore,
    category,
    color,
    gdsScore,
    tdsScore,
    downPaymentScore,
    employmentScore,
    incomeScore,
  };
}

export function getDSRStatus(dsr: number): { color: string; label: string; bg: string } {
  if (dsr <= 35) {
    return {
      color: 'text-green-600 dark:text-green-400',
      label: 'Excellent',
      bg: 'bg-green-50 dark:bg-green-900/20'
    };
  } else if (dsr <= 43) {
    return {
      color: 'text-yellow-600 dark:text-yellow-400',
      label: 'Good',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    };
  } else if (dsr <= 50) {
    return {
      color: 'text-orange-600 dark:text-orange-400',
      label: 'Fair',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    };
  } else {
    return {
      color: 'text-red-600 dark:text-red-400',
      label: 'High Risk',
      bg: 'bg-red-50 dark:bg-red-900/20'
    };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDecimal(amount: number): string {
  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
