import { TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { getDSRStatus, formatCurrency } from '../../utils/mortgageCalculations';

interface FinancialAssessmentPanelProps {
  gdsRatio: number | null;
  tdsRatio: number | null;
  qualificationScore: number | null;
  monthlyIncome: number;
  monthlyPayment: number;
  estimatedPropertyTax: number;
  estimatedHeating: number;
  totalMonthlyDebts: number;
}

export function FinancialAssessmentPanel({
  gdsRatio,
  tdsRatio,
  qualificationScore,
  monthlyIncome,
  monthlyPayment,
  estimatedPropertyTax,
  estimatedHeating,
  totalMonthlyDebts,
}: FinancialAssessmentPanelProps) {
  const [showGDSBreakdown, setShowGDSBreakdown] = useState(false);
  const [showTDSBreakdown, setShowTDSBreakdown] = useState(false);

  if (gdsRatio === null || tdsRatio === null || qualificationScore === null) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Financial Assessment</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center py-6 sm:py-8">
          Enter your income information to see your financial assessment
        </p>
      </div>
    );
  }

  const totalHousingCosts = monthlyPayment + estimatedPropertyTax + estimatedHeating;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Financial Assessment</h3>
        <div className="relative group ml-auto">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 sm:w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <p className="mb-2"><strong>GDS (Gross Debt Service):</strong> Housing costs as % of income. Target: ≤32%</p>
            <p><strong>TDS (Total Debt Service):</strong> All debts + housing as % of income. Target: ≤40%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border-2 ${
          gdsRatio <= 32 ? 'border-green-300 dark:border-green-700' :
          gdsRatio <= 35 ? 'border-yellow-300 dark:border-yellow-700' :
          'border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">GDS Ratio</p>
            <button
              type="button"
              onClick={() => setShowGDSBreakdown(!showGDSBreakdown)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              {showGDSBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${getDSRStatus(gdsRatio).color}`}>
            {gdsRatio.toFixed(1)}%
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs font-medium ${getDSRStatus(gdsRatio).color}`}>
              {getDSRStatus(gdsRatio).label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target: ≤32%</p>
          </div>

          {showGDSBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monthly Payment:</span>
                <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Property Tax:</span>
                <span className="font-medium">{formatCurrency(estimatedPropertyTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Heating:</span>
                <span className="font-medium">{formatCurrency(estimatedHeating)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Housing:</span>
                <span className="font-semibold">{formatCurrency(totalHousingCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monthly Income:</span>
                <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border-2 ${
          tdsRatio <= 40 ? 'border-green-300 dark:border-green-700' :
          tdsRatio <= 43 ? 'border-yellow-300 dark:border-yellow-700' :
          'border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">TDS Ratio</p>
            <button
              type="button"
              onClick={() => setShowTDSBreakdown(!showTDSBreakdown)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              {showTDSBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${getDSRStatus(tdsRatio).color}`}>
            {tdsRatio.toFixed(1)}%
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs font-medium ${getDSRStatus(tdsRatio).color}`}>
              {getDSRStatus(tdsRatio).label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target: ≤40%</p>
          </div>

          {showTDSBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Housing Costs:</span>
                <span className="font-medium">{formatCurrency(totalHousingCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Other Debts:</span>
                <span className="font-medium">{formatCurrency(totalMonthlyDebts)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Obligations:</span>
                <span className="font-semibold">{formatCurrency(totalHousingCosts + totalMonthlyDebts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monthly Income:</span>
                <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border-2 border-blue-300 dark:border-blue-700 sm:col-span-2 md:col-span-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Qualification Score</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#158EC5]">
            {qualificationScore.toFixed(0)}/100
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs font-medium ${
              qualificationScore >= 80 ? 'text-green-600 dark:text-green-400' :
              qualificationScore >= 65 ? 'text-blue-600 dark:text-blue-400' :
              qualificationScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {qualificationScore >= 80 ? 'Excellent' :
               qualificationScore >= 65 ? 'Good' :
               qualificationScore >= 50 ? 'Fair' : 'Poor'}
            </p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-2">
              <div
                className="bg-gradient-to-r from-[#158EC5] to-blue-500 h-3 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${qualificationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {(gdsRatio > 32 || tdsRatio > 40) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Your debt ratios are above the recommended thresholds.
            {gdsRatio > 32 && ' Consider increasing your down payment or choosing a less expensive property.'}
            {tdsRatio > 40 && ' Consider paying down existing debts before applying.'}
          </p>
        </div>
      )}
    </div>
  );
}
