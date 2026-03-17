import { useState, useEffect } from 'react';
import { Calculator, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface MortgageCalculatorProps {
  propertyPrice: number;
  onApplyForMortgage?: (calculationData: MortgageCalculation) => void;
}

export interface MortgageCalculation {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
  financingOption: string;
}

const FINANCING_OPTIONS = [
  { label: 'Less than or equal to 80% Financing', value: 'lte_80', downPaymentPercent: 20, interestRate: 4.5 },
  { label: 'More than 80% to 95% Financing', value: 'gt_80_to_95', downPaymentPercent: 10, interestRate: 5.0 },
  { label: 'More than 95% to 99% Financing', value: 'gt_95_to_99', downPaymentPercent: 5, interestRate: 5.5 },
  { label: '100% Financing', value: '100', downPaymentPercent: 0, interestRate: 6.0 },
];

const LOAN_TERMS = [
  { label: '5 years', value: 5 },
  { label: '10 years', value: 10 },
  { label: '15 years', value: 15 },
  { label: '20 years', value: 20 },
  { label: '25 years', value: 25 },
  { label: '30 years', value: 30 },
  { label: '35 years', value: 35 },
];

export function MortgageCalculator({ propertyPrice, onApplyForMortgage }: MortgageCalculatorProps) {
  const [financingOption, setFinancingOption] = useState<string>('');
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTermYears, setLoanTermYears] = useState(25);
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);

  const calculateMortgage = () => {
    if (!financingOption) {
      setCalculation(null);
      return;
    }

    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                       (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    const monthlyPrincipal = loanAmount / numberOfPayments;
    const monthlyInterest = monthlyPayment - monthlyPrincipal;

    const calculationData: MortgageCalculation = {
      propertyPrice,
      downPayment,
      loanAmount,
      interestRate,
      loanTermYears,
      monthlyPayment,
      totalPayment,
      totalInterest,
      monthlyPrincipal,
      monthlyInterest,
      financingOption,
    };

    setCalculation(calculationData);
  };

  useEffect(() => {
    calculateMortgage();
  }, [propertyPrice, downPaymentPercent, interestRate, loanTermYears, financingOption]);

  const handleFinancingOptionChange = (value: string) => {
    setFinancingOption(value);
    const option = FINANCING_OPTIONS.find(opt => opt.value === value);
    if (option) {
      setDownPaymentPercent(option.downPaymentPercent);
      setInterestRate(option.interestRate);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDecimal = (amount: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-[#158EC5] to-[#1178a3] rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
          <h2 className="text-xl sm:text-2xl font-bold">Mortgage Calculator</h2>
        </div>
        <p className="text-sm sm:text-base text-blue-100">Calculate your monthly mortgage payments and see a detailed breakdown.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Property Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Property Price</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(propertyPrice)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Loan Parameters</h3>

        <div>
          <label htmlFor="financing-option" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Financing Option
          </label>
          <select
            id="financing-option"
            value={financingOption}
            onChange={(e) => handleFinancingOptionChange(e.target.value)}
            className="w-full px-4 py-3 min-h-[48px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-colors cursor-pointer"
          >
            <option value="" disabled>Select your financing option ...</option>
            {FINANCING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="loan-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Loan Term
          </label>
          <select
            id="loan-term"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(Number(e.target.value))}
            className="w-full px-4 py-3 min-h-[48px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5] focus:border-[#158EC5] transition-colors cursor-pointer"
          >
            {LOAN_TERMS.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Down Payment: {downPaymentPercent}% ({formatCurrency((propertyPrice * downPaymentPercent) / 100)})
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-3 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#158EC5]"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {financingOption && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Interest Rate:</span>
              <span className="font-semibold text-base sm:text-sm text-[#158EC5] dark:text-blue-400">{interestRate}%</span>
            </div>
          </div>
        )}
      </div>

      {calculation && (
        <>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 sm:p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimated Monthly Payment</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {formatCurrencyDecimal(calculation.monthlyPayment)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Principal</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyDecimal(calculation.monthlyPrincipal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interest</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyDecimal(calculation.monthlyInterest)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Loan Summary</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loan Amount</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculation.loanAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Down Payment</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculation.downPayment)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Interest</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(calculation.totalInterest)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">Total Amount Payable</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(calculation.totalPayment)}
                </span>
              </div>
            </div>
          </div>

          {onApplyForMortgage && (
            <Button
              onClick={() => onApplyForMortgage(calculation)}
              variant="primary"
              className="w-full bg-[#158EC5] hover:bg-[#1178a3] text-base sm:text-lg py-4 min-h-[48px]"
            >
              Apply for Mortgage
            </Button>
          )}
        </>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Disclaimer:</strong> Calculations by this calculator are estimates only.
          Actual rates, payments, and terms may vary. Please consult with Republic Bank for
          accurate mortgage information and official loan terms.
        </p>
      </div>
    </div>
  );
}
