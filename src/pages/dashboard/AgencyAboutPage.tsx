import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface AgencyAboutData {
  about: string;
  mission: string;
  founded_year: number | null;
  team_size: number | null;
  website: string;
}

interface FormErrors {
  about?: string;
  mission?: string;
  founded_year?: string;
  team_size?: string;
  website?: string;
}

export function AgencyAboutPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<AgencyAboutData>({
    about: '',
    mission: '',
    founded_year: null,
    team_size: null,
    website: '',
  });
  const [formData, setFormData] = useState<AgencyAboutData>({
    about: '',
    mission: '',
    founded_year: null,
    team_size: null,
    website: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAgencyData();
  }, []);

  const loadAgencyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agencies')
        .select('about, mission, founded_year, team_size, website')
        .eq('created_by', profile?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const loadedData = {
          about: data.about || '',
          mission: data.mission || '',
          founded_year: data.founded_year,
          team_size: data.team_size,
          website: data.website || '',
        };
        setFormData(loadedData);
        setInitialData(loadedData);
      }
    } catch (error) {
      console.error('Error loading agency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.about || formData.about.trim() === '') {
      newErrors.about = 'About Your Agency is required';
    } else if (formData.about.length > 2000) {
      newErrors.about = 'About text must not exceed 2000 characters';
    }

    if (formData.mission && formData.mission.length > 500) {
      newErrors.mission = 'Mission statement must not exceed 500 characters';
    }

    if (formData.founded_year !== null) {
      const currentYear = new Date().getFullYear();
      if (formData.founded_year < 1800 || formData.founded_year > currentYear) {
        newErrors.founded_year = `Founded year must be between 1800 and ${currentYear}`;
      }
    }

    if (formData.team_size !== null && formData.team_size < 1) {
      newErrors.team_size = 'Team size must be at least 1';
    }

    if (formData.website && formData.website.trim() !== '') {
      try {
        const url = new URL(formData.website);
        if (!url.protocol.startsWith('http')) {
          newErrors.website = 'Website URL must start with http:// or https://';
        }
      } catch {
        newErrors.website = 'Please enter a valid URL (e.g., https://www.example.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = async () => {
    setTouched({
      about: true,
      mission: true,
      founded_year: true,
      team_size: true,
      website: true,
    });

    if (!validateForm()) {
      setErrorMessage('Please fix the errors before saving');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('agencies')
        .update({
          about: formData.about.trim(),
          mission: formData.mission.trim() || null,
          founded_year: formData.founded_year,
          team_size: formData.team_size,
          website: formData.website.trim() || null,
        })
        .eq('created_by', profile?.id);

      if (error) throw error;

      const updatedData = { ...formData };
      setInitialData(updatedData);
      setIsDirty(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving agency data:', error);
      setErrorMessage('Failed to save agency information. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof AgencyAboutData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setIsDirty(true);

    if (touched[field]) {
      setTimeout(() => validateForm(), 100);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleNavigation = useCallback((path: string) => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (confirmLeave) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  }, [isDirty, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => handleNavigation(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agency About Information
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-13">
            Share your agency's story, mission, and key information with potential clients
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-medium">
              Agency information saved successfully!
            </p>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300 font-medium">
              {errorMessage}
            </p>
          </div>
        )}

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Your Agency <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => handleFieldChange('about', e.target.value)}
                onBlur={() => handleFieldBlur('about')}
                rows={8}
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.about && errors.about
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-400'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="Tell your agency's story. What makes you unique? What are your core values? What services do you provide?"
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2">
                <div>
                  {touched.about && errors.about && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.about}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${
                  formData.about.length > 1900
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formData.about.length} / 2000 characters
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission Statement <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => handleFieldChange('mission', e.target.value)}
                onBlur={() => handleFieldBlur('mission')}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.mission && errors.mission
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-400'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="What is your agency's mission? What drives your team every day?"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <div>
                  {touched.mission && errors.mission && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.mission}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${
                  formData.mission.length > 450
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formData.mission.length} / 500 characters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Founded Year <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <Input
                  type="number"
                  value={formData.founded_year || ''}
                  onChange={(e) => handleFieldChange('founded_year', e.target.value ? parseInt(e.target.value) : null)}
                  onBlur={() => handleFieldBlur('founded_year')}
                  placeholder="e.g., 2010"
                  min="1800"
                  max={new Date().getFullYear()}
                  className={touched.founded_year && errors.founded_year ? 'border-red-500 dark:border-red-500' : ''}
                />
                {touched.founded_year && errors.founded_year && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.founded_year}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Size <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <Input
                  type="number"
                  value={formData.team_size || ''}
                  onChange={(e) => handleFieldChange('team_size', e.target.value ? parseInt(e.target.value) : null)}
                  onBlur={() => handleFieldBlur('team_size')}
                  placeholder="e.g., 25"
                  min="1"
                  className={touched.team_size && errors.team_size ? 'border-red-500 dark:border-red-500' : ''}
                />
                {touched.team_size && errors.team_size && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.team_size}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                onBlur={() => handleFieldBlur('website')}
                placeholder="https://www.yourwebsite.com"
                className={touched.website && errors.website ? 'border-red-500 dark:border-red-500' : ''}
              />
              {touched.website && errors.website && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.website}
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => handleNavigation('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (touched.about && !!errors.about)}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
