import { Home, DollarSign, TrendingDown, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/mortgageCalculations';
import { formatPropertyType } from '../../lib/propertyTypes';
import type { MortgageCalculation } from './MortgageCalculator';
import type { PropertyCategory, PropertyGeneralType, PropertyStyle } from '../../lib/database.types';

interface LoanDetailsPanelProps {
  property: {
    title: string;
    city: string;
    region: string;
    property_category: PropertyCategory;
    property_general_type: PropertyGeneralType;
    property_style: PropertyStyle;
  };
  calculation: MortgageCalculation;
}

export function LoanDetailsPanel({ property, calculation }: LoanDetailsPanelProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Property & Loan Details</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Property</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{property.title}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{property.city}, {property.region}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatPropertyType(
              property.property_category,
              property.property_general_type,
              property.property_style
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Property Price</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(calculation.propertyPrice)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Down Payment</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(calculation.downPayment)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((calculation.downPayment / calculation.propertyPrice) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Interest Rate</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {calculation.interestRate}%
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Loan Term</p>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {calculation.loanTermYears} years
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 border-2 border-blue-300 dark:border-blue-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Loan Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(calculation.loanAmount)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
              <p className="text-xl sm:text-2xl font-bold text-[#158EC5]">
                {formatCurrency(calculation.monthlyPayment)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
