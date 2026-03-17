import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, X, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SingleImageUpload } from '../../components/ui/SingleImageUpload';
import { updateContractor, uploadContractorLogo } from '../../services/contractorManagement';
import { CONTRACTOR_CATEGORIES } from '../../lib/contractorCategories';
import { getAllAreas, REGIONS, getAreasForRegion } from '../../lib/locations';
import type { Database } from '../../lib/database.types';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../lib/countries';

type Contractor = Database['public']['Tables']['contractors']['Row'];

export function ContractorProfileEditPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [averageJobSize, setAverageJobSize] = useState('');
  const [residentialOrCommercial, setResidentialOrCommercial] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    loadContractor();
  }, [profile?.id]);

  const loadContractor = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContractor(data);
        setCompanyName(data.company_name || '');
        setDescription(data.description || '');
        setYearsInBusiness(data.years_in_business?.toString() || '');
        setPrimaryCategory(data.primary_category || '');
        setAdditionalCategories(data.additional_categories || []);
        setServiceAreas(data.service_areas || []);
        setAddress(data.address || '');
        setCountry(data.country || DEFAULT_COUNTRY);
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setEmail(data.email || '');
        setWebsiteUrl(data.website_url || '');
        setFacebookUrl(data.facebook_url || '');
        setInstagramUrl(data.instagram_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        setTiktokUrl(data.tiktok_url || '');
        setEmployeesCount(data.employees_count?.toString() || '');
        setCertifications(data.certifications || []);
        setAverageJobSize(data.average_job_size || '');
        setResidentialOrCommercial(data.residential_or_commercial || '');
      }
    } catch (error) {
      console.error('Error loading contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contractor) return;

    setSaving(true);
    try {
      let logoUrl = contractor.logo_url;

      if (logoFile && profile?.id) {
        const uploadedUrl = await uploadContractorLogo(profile.id, logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const updates = {
        company_name: companyName,
        description: description || null,
        years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        primary_category: primaryCategory,
        additional_categories: additionalCategories.length > 0 ? additionalCategories : null,
        service_areas: serviceAreas.length > 0 ? serviceAreas : null,
        address: address || null,
        country: country || DEFAULT_COUNTRY,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        website_url: websiteUrl || null,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        linkedin_url: linkedinUrl || null,
        tiktok_url: tiktokUrl || null,
        employees_count: employeesCount ? parseInt(employeesCount) : null,
        certifications: certifications.length > 0 ? certifications : null,
        average_job_size: averageJobSize || null,
        residential_or_commercial: residentialOrCommercial || null,
        logo_url: logoUrl,
      };

      await updateContractor(contractor.id, updates);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving contractor:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceArea = (area: string) => {
    setServiceAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleAllServiceAreas = () => {
    const allAreas = getAllAreas();
    if (serviceAreas.length === allAreas.length) {
      setServiceAreas([]);
    } else {
      setServiceAreas(allAreas);
    }
  };

  const isRegionFullySelected = (region: string): boolean => {
    const regionAreas = getAreasForRegion(region);
    return regionAreas.length > 0 && regionAreas.every(area => serviceAreas.includes(area));
  };

  const getSelectedAreasInRegion = (region: string): number => {
    const regionAreas = getAreasForRegion(region);
    return regionAreas.filter(area => serviceAreas.includes(area)).length;
  };

  const toggleRegion = (region: string) => {
    const regionAreas = getAreasForRegion(region);
    const isFullySelected = isRegionFullySelected(region);

    if (isFullySelected) {
      setServiceAreas(prev => prev.filter(area => !regionAreas.includes(area)));
    } else {
      setServiceAreas(prev => {
        const newAreas = [...prev];
        regionAreas.forEach(area => {
          if (!newAreas.includes(area)) {
            newAreas.push(area);
          }
        });
        return newAreas;
      });
    }
  };

  const toggleAdditionalCategory = (category: string) => {
    setAdditionalCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Company Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your business information and portfolio
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div>
                <SingleImageUpload
                  currentImage={contractor?.logo_url || undefined}
                  onImageSelect={setLogoFile}
                  label="Company Logo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Tell clients about your business..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years in Business
                </label>
                <Input
                  type="number"
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Categories & Services
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Category *
                </label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {CONTRACTOR_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                  {CONTRACTOR_CATEGORIES.filter(cat => cat.id !== primaryCategory).map(cat => (
                    <label key={cat.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={additionalCategories.includes(cat.id)}
                        onChange={() => toggleAdditionalCategory(cat.id)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Service Areas
            </h2>

            <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <input
                  type="checkbox"
                  checked={serviceAreas.length === getAllAreas().length}
                  onChange={toggleAllServiceAreas}
                  className="rounded text-green-600 focus:ring-green-500 w-5 h-5"
                />
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  All Areas
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({serviceAreas.length} / {getAllAreas().length} selected)
                </span>
              </label>
            </div>

            <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select by Region
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {REGIONS.map(region => {
                  const regionAreas = getAreasForRegion(region);
                  const selectedCount = getSelectedAreasInRegion(region);
                  const isFullySelected = isRegionFullySelected(region);

                  return (
                    <label
                      key={region}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isFullySelected}
                        onChange={() => toggleRegion(region)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {region}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({selectedCount} / {regionAreas.length})
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Individual Areas
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg scrollbar-hide">
              {getAllAreas().map(area => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={serviceAreas.includes(area)}
                    onChange={() => toggleServiceArea(area)}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 18687654321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Number
                </label>
                <Input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g., 18687654321"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional - Provide a different WhatsApp number if it differs from your phone number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {COUNTRIES.map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Online Presence
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook
                </label>
                <Input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram
                </label>
                <Input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn
                </label>
                <Input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TikTok
                </label>
                <Input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Employees
                </label>
                <Input
                  type="number"
                  value={employeesCount}
                  onChange={(e) => setEmployeesCount(e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Job Size
                </label>
                <select
                  value={averageJobSize}
                  onChange={(e) => setAverageJobSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select average job size</option>
                  <option value="under_5000">Under $5,000</option>
                  <option value="5000_15000">$5,000 - $15,000</option>
                  <option value="15000_50000">$15,000 - $50,000</option>
                  <option value="over_50000">Over $50,000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Type
                </label>
                <select
                  value={residentialOrCommercial}
                  onChange={(e) => setResidentialOrCommercial(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select work type</option>
                  <option value="residential">Residential Only</option>
                  <option value="commercial">Commercial Only</option>
                  <option value="both">Both Residential & Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certifications & Licenses
                </label>
                <div className="space-y-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={cert}
                        onChange={(e) => updateCertification(index, e.target.value)}
                        placeholder="Certification name"
                      />
                      <Button
                        variant="outline"
                        onClick={() => removeCertification(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCertification}>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              isLoading={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
