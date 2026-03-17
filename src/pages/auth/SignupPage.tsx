import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Button } from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { CONTRACTOR_CATEGORIES } from '../../lib/contractorCategories';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../lib/countries';

type Agency = Database['public']['Tables']['agencies']['Row'];

export function SignupPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'buyer');
  const [agencyName, setAgencyName] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyLogo, setAgencyLogo] = useState<File | null>(null);
  const [agencyLogoPreview, setAgencyLogoPreview] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [contractorLogo, setContractorLogo] = useState<File | null>(null);
  const [contractorLogoPreview, setContractorLogoPreview] = useState<string>('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);

  useEffect(() => {
    if (role === 'agent') {
      loadAgencies();
    }
  }, [role]);

  const loadAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (phoneNumber.length !== 7) {
      setError('Phone number must be exactly 7 digits');
      return;
    }

    if (role === 'agency') {
      if (!agencyLogo) {
        setError('Agency logo is required');
        return;
      }
      if (!agencyName.trim()) {
        setError('Agency name is required');
        return;
      }
    }

    if (role === 'agent' && !profilePicture) {
      setError('Profile picture is required');
      return;
    }

    if (role === 'contractor') {
      if (!companyName.trim()) {
        setError('Company name is required');
        return;
      }
      if (!primaryCategory) {
        setError('Primary category is required');
        return;
      }
    }

    if (role === 'agency' || role === 'contractor') {
      handleFinalSubmit();
    } else {
      setStep(2);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'agency' | 'agent' | 'contractor') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${type === 'agent' ? 'Profile picture' : 'Logo'} file size must be less than 5MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'agency') {
          setAgencyLogo(file);
          setAgencyLogoPreview(reader.result as string);
        } else if (type === 'contractor') {
          setContractorLogo(file);
          setContractorLogoPreview(reader.result as string);
        } else {
          setProfilePicture(file);
          setProfilePicturePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    try {
      if (role === 'contractor') {
        const contractorData = {
          companyName,
          primaryCategory,
          logo: contractorLogo
        };

        await signUp(
          email,
          password,
          fullName,
          role,
          undefined,
          undefined,
          undefined,
          undefined,
          phoneNumber,
          undefined,
          undefined,
          contractorData,
          country
        );
      } else {
        await signUp(
          email,
          password,
          fullName,
          role,
          agencyName,
          '',
          '',
          selectedAgencyId || undefined,
          phoneNumber,
          profilePicture || undefined,
          agencyLogo || undefined,
          undefined,
          country
        );
      }
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sex) {
      setError('Please select your sex');
      return;
    }

    if (!dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        email,
        password,
        fullName,
        role,
        agencyName,
        sex,
        dateOfBirth,
        selectedAgencyId || undefined,
        phoneNumber,
        profilePicture || undefined,
        agencyLogo || undefined,
        undefined,
        country
      );
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center">
          <Link to="/" className="inline-flex justify-center mb-6">
            <img
              src="/placesi-logo-dark copy.png"
              alt="Placesi"
              className="h-10 dark:hidden"
              style={{ width: 'auto', imageRendering: 'crisp-edges' }}
            />
            <img
              src="/placesi-logo-white copy.png"
              alt="Placesi"
              className="h-10 hidden dark:block"
              style={{ width: 'auto', imageRendering: 'crisp-edges' }}
            />
          </Link>
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="buyer">User</option>
                  <option value="agent">Real Estate Agent</option>
                  <option value="agency">Real Estate Agency</option>
                  <option value="contractor">Contractor / Service Provider</option>
                </select>
              </div>

              {role === 'agency' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agency Logo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {agencyLogoPreview ? (
                        <img
                          src={agencyLogoPreview}
                          alt="Agency logo preview"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="agency-logo"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'agency')}
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor="agency-logo"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        Choose Logo
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {role === 'agent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Agency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedAgencyId}
                      onChange={(e) => setSelectedAgencyId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">No Agency</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Select the agency you work for, or choose "No Agency" if independent
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Picture <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Profile picture preview"
                            className="w-20 h-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <Home className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="profile-picture"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'agent')}
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="profile-picture"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          Choose Picture
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {role === 'agency' && (
                <Input
                  label="Agency Name"
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  placeholder="Enter your agency name"
                />
              )}

              {role === 'contractor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {contractorLogoPreview ? (
                          <img
                            src={contractorLogoPreview}
                            alt="Company logo preview"
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Logo</span>
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors inline-block">
                          Choose Logo
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'contractor')}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Optional. Upload your company logo (Max 5MB)
                    </p>
                  </div>

                  <Input
                    label="Company Name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Enter your company name"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Service Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={primaryCategory}
                      onChange={(e) => setPrimaryCategory(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a category</option>
                      {CONTRACTOR_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
              />

              <PhoneInput
                label="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
                required
                helperText="Enter your 7-digit phone number"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {COUNTRIES.map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                helperText="Must be at least 6 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Help us understand our users
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This information helps us provide better recommendations
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              isLoading={loading}
            >
              {step === 1 ? 'Continue' : 'Create Account'}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}
