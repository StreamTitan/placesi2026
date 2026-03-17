import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react';
import { Flag } from './Flag';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  maxLength: number;
}

const CARIBBEAN_COUNTRY_CODES: CountryCode[] = [
  { code: 'tt', dialCode: '+1868', name: 'Trinidad and Tobago', maxLength: 7 },
  { code: 'jm', dialCode: '+1876', name: 'Jamaica', maxLength: 7 },
  { code: 'bb', dialCode: '+1246', name: 'Barbados', maxLength: 7 },
  { code: 'bs', dialCode: '+1242', name: 'Bahamas', maxLength: 7 },
  { code: 'ag', dialCode: '+1268', name: 'Antigua and Barbuda', maxLength: 7 },
  { code: 'lc', dialCode: '+1758', name: 'Saint Lucia', maxLength: 7 },
  { code: 'gd', dialCode: '+1473', name: 'Grenada', maxLength: 7 },
  { code: 'vc', dialCode: '+1784', name: 'Saint Vincent and the Grenadines', maxLength: 7 },
  { code: 'dm', dialCode: '+1767', name: 'Dominica', maxLength: 7 },
  { code: 'kn', dialCode: '+1869', name: 'Saint Kitts and Nevis', maxLength: 7 },
  { code: 'gy', dialCode: '+592', name: 'Guyana', maxLength: 7 },
  { code: 'sr', dialCode: '+597', name: 'Suriname', maxLength: 7 },
];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, helperText, className = '', value, onChange, countryCode = 'tt', onCountryCodeChange, required, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value);
    const [selectedCountry, setSelectedCountry] = useState<string>(countryCode);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentCountry = CARIBBEAN_COUNTRY_CODES.find(c => c.code === selectedCountry) || CARIBBEAN_COUNTRY_CODES[0];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, '');

      if (input.length <= currentCountry.maxLength) {
        setLocalValue(input);
        onChange(input);
      }
    };

    const handleCountrySelect = (country: CountryCode) => {
      setSelectedCountry(country.code);
      setIsDropdownOpen(false);
      if (onCountryCodeChange) {
        onCountryCodeChange(country.code);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-stretch gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-900 dark:text-white font-medium">{currentCountry.dialCode}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                  {CARIBBEAN_COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {country.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {country.dialCode}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 relative">
            <input
              ref={ref}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={currentCountry.maxLength}
              value={localValue}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                error
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${className}`}
              placeholder="123-4567"
              {...props}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
              {localValue.length}/{currentCountry.maxLength}
            </div>
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
