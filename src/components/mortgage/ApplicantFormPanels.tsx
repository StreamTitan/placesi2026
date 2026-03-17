import { User, Briefcase, DollarSign, CreditCard, Info } from 'lucide-react';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/mortgageCalculations';

export interface ApplicantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  employmentStatus: string;
  employerName: string;
  occupation: string;
  yearsEmployed: string;
  grossAnnualIncome: string;
  grossMonthlyIncome: string;
  otherIncome: string;
  creditCardPayments: string;
  carLoanPayments: string;
  studentLoanPayments: string;
  otherDebtPayments: string;
}

interface ApplicantFormPanelsProps {
  data: ApplicantData;
  setData: React.Dispatch<React.SetStateAction<ApplicantData>>;
  isCoApplicant?: boolean;
}

export function ApplicantFormPanels({ data, setData, isCoApplicant = false }: ApplicantFormPanelsProps) {
  const prefix = isCoApplicant ? 'Co-Applicant ' : '';

  const totalMonthlyDebts =
    (parseFloat(data.creditCardPayments) || 0) +
    (parseFloat(data.carLoanPayments) || 0) +
    (parseFloat(data.studentLoanPayments) || 0) +
    (parseFloat(data.otherDebtPayments) || 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {prefix}Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={data.firstName}
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
            required
            placeholder="Enter first name"
          />
          <Input
            label="Last Name"
            value={data.lastName}
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
            required
            placeholder="Enter last name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            placeholder="email@example.com"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            required
            placeholder="(868) 123-4567"
          />
        </div>

        <Input
          label="Date of Birth"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
          required
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {prefix}Employment Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              value={data.employmentStatus}
              onChange={(e) => setData({ ...data, employmentStatus: e.target.value })}
              className="w-full px-4 py-3 min-h-[48px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5] focus:border-[#158EC5]"
              required
            >
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="retired">Retired</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Years Employed"
            type="number"
            step="0.5"
            min="0"
            value={data.yearsEmployed}
            onChange={(e) => setData({ ...data, yearsEmployed: e.target.value })}
            required
            placeholder="e.g., 5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Employer Name"
            value={data.employerName}
            onChange={(e) => setData({ ...data, employerName: e.target.value })}
            required
            placeholder="Company name"
          />
          <Input
            label="Occupation"
            value={data.occupation}
            onChange={(e) => setData({ ...data, occupation: e.target.value })}
            required
            placeholder="Job title"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {prefix}Income Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Gross Annual Income"
            type="number"
            step="0.01"
            min="0"
            value={data.grossAnnualIncome}
            onChange={(e) => {
              const annual = e.target.value;
              const monthly = annual ? (parseFloat(annual) / 12).toFixed(2) : '';
              setData({ ...data, grossAnnualIncome: annual, grossMonthlyIncome: monthly });
            }}
            required
            placeholder="e.g., 60000"
          />
          <div>
            <Input
              label="Gross Monthly Income"
              type="number"
              step="0.01"
              value={data.grossMonthlyIncome}
              onChange={(e) => setData({ ...data, grossMonthlyIncome: e.target.value })}
              required
              disabled
              placeholder="Auto-calculated"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Calculated from annual income
            </p>
          </div>
        </div>

        <Input
          label="Other Monthly Income (Optional)"
          type="number"
          step="0.01"
          min="0"
          value={data.otherIncome}
          onChange={(e) => setData({ ...data, otherIncome: e.target.value })}
          placeholder="e.g., rental income, investments"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {prefix}Monthly Debt Obligations
          </h3>
          <div className="relative group ml-auto">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-6 w-72 sm:w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="mb-2"><strong>Include:</strong> Credit cards, car loans, student loans, personal loans, and other recurring debt payments.</p>
              <p><strong>Do NOT include:</strong> Rent, utilities, groceries, insurance, or other living expenses.</p>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          Enter only your <strong>recurring monthly debt payments</strong> (credit cards, loans, etc.).
          Do NOT include living expenses like rent, utilities, or groceries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Credit Card Minimum Payments"
            type="number"
            step="0.01"
            min="0"
            value={data.creditCardPayments}
            onChange={(e) => setData({ ...data, creditCardPayments: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Car Loan Payments"
            type="number"
            step="0.01"
            min="0"
            value={data.carLoanPayments}
            onChange={(e) => setData({ ...data, carLoanPayments: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Loan Payments"
            type="number"
            step="0.01"
            min="0"
            value={data.studentLoanPayments}
            onChange={(e) => setData({ ...data, studentLoanPayments: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Other Debt Payments"
            type="number"
            step="0.01"
            min="0"
            value={data.otherDebtPayments}
            onChange={(e) => setData({ ...data, otherDebtPayments: e.target.value })}
            placeholder="0.00"
          />
        </div>

        {totalMonthlyDebts > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Monthly Debt Payments:
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalMonthlyDebts)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
