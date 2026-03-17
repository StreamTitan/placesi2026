import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { uploadMultipleImages } from '../../services/imageUpload';
import { REGIONS, getAreasForRegion } from '../../lib/locations';
import {
  PROPERTY_CATEGORIES,
  getGeneralTypesForCategory,
  getStylesForGeneralType,
  getListingTypeFromCategory,
  type PropertyCategory,
  type PropertyGeneralType,
  type PropertyStyle,
} from '../../lib/propertyTypes';
import { getFeaturesByCategory, isCommercialPropertyType, isLandPropertyType } from '../../lib/propertyFeatures';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../lib/countries';

export function AddListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    half_bathrooms: '',
    sqft: '',
    parking_spaces: '',
    loading_docks: '',
    floor_number: '',
    total_floors: '',
    zoning: '',
    monthly_maintenance: '',
    property_type: 'house',
    property_category: 'buy' as PropertyCategory,
    property_general_type: 'residential' as PropertyGeneralType,
    property_style: 'house' as PropertyStyle,
    listing_type: 'sale',
    status: 'active',
    city: '',
    region: '',
    country: DEFAULT_COUNTRY,
    features: '',
    is_negotiable: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    if (!user) return [];

    const results = await uploadMultipleImages(files, user.id);
    const successfulUrls = results
      .filter((result) => result.url && !result.error)
      .map((result) => result.url);

    return successfulUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (imageUrls.length === 0) {
      alert('Please upload at least one image for your property.');
      return;
    }

    setLoading(true);
    try {
      const isCommercial = isCommercialPropertyType(formData.property_general_type);

      const { data: propertyData, error: propertyError } = await supabase.from('properties').insert({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : (isCommercial ? 0 : 1),
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : (isCommercial ? 0 : 1),
        half_bathrooms: formData.half_bathrooms ? parseFloat(formData.half_bathrooms) : 0,
        size_sqft: formData.sqft ? parseInt(formData.sqft) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : 0,
        loading_docks: formData.loading_docks ? parseInt(formData.loading_docks) : 0,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        zoning: formData.zoning || null,
        monthly_maintenance: formData.monthly_maintenance ? parseFloat(formData.monthly_maintenance) : null,
        property_type: formData.property_type,
        property_category: formData.property_category,
        property_general_type: formData.property_general_type,
        property_style: formData.property_style,
        listing_type: getListingTypeFromCategory(formData.property_category),
        status: formData.status,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        features: [],
        images: imageUrls,
        is_negotiable: formData.is_negotiable,
        listed_by: user.id,
      }).select().single();

      if (propertyError) throw propertyError;

      if (selectedFeatures.size > 0 && propertyData) {
        const featureInserts = Array.from(selectedFeatures).map(featureName => ({
          property_id: propertyData.id,
          feature_name: featureName,
        }));

        const { error: featuresError } = await supabase
          .from('property_features')
          .insert(featureInserts);

        if (featuresError) {
          console.error('Error adding features:', featuresError);
        }
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorDetails = error?.details || '';
      const errorHint = error?.hint || '';

      let displayMessage = 'Failed to create listing. Please try again.';
      if (errorMessage.includes('violates') || errorDetails) {
        displayMessage = `Database error: ${errorMessage}${errorDetails ? '\nDetails: ' + errorDetails : ''}${errorHint ? '\nHint: ' + errorHint : ''}`;
      } else if (errorMessage !== 'Unknown error occurred') {
        displayMessage = `Error: ${errorMessage}`;
      }

      alert(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/my-listings');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'region') {
      setFormData({
        ...formData,
        [name]: value,
        city: '',
      });
    } else if (name === 'property_category') {
      const newCategory = value as PropertyCategory;
      const generalTypes = getGeneralTypesForCategory(newCategory);
      const defaultGeneralType = generalTypes[0]?.value as PropertyGeneralType;
      const styles = getStylesForGeneralType(defaultGeneralType);
      setFormData({
        ...formData,
        property_category: newCategory,
        property_general_type: defaultGeneralType,
        property_style: styles[0]?.value as PropertyStyle,
        listing_type: getListingTypeFromCategory(newCategory),
      });
    } else if (name === 'property_general_type') {
      const newGeneralType = value as PropertyGeneralType;
      const styles = getStylesForGeneralType(newGeneralType);
      setFormData({
        ...formData,
        property_general_type: newGeneralType,
        property_style: styles[0]?.value as PropertyStyle,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFeatureToggle = (featureName: string) => {
    const newFeatures = new Set(selectedFeatures);
    if (newFeatures.has(featureName)) {
      newFeatures.delete(featureName);
    } else {
      newFeatures.add(featureName);
    }
    setSelectedFeatures(newFeatures);
  };

  const availableAreas = formData.region ? getAreasForRegion(formData.region) : [];
  const isCommercial = isCommercialPropertyType(formData.property_general_type);
  const isLand = isLandPropertyType(formData.property_general_type, formData.property_style);
  const featuresByCategory = getFeaturesByCategory(formData.property_general_type, formData.property_style);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-green-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Listing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Fill in the details to create a new property listing
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Beautiful 3 Bedroom House"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your property..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (TTD) *
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="property_category"
                  value={formData.property_category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                id="is_negotiable"
                checked={formData.is_negotiable}
                onChange={(e) => setFormData({ ...formData, is_negotiable: e.target.checked })}
                className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-green-600 dark:checked:border-green-600"
              />
              <label htmlFor="is_negotiable" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1">
                <div>Price is Negotiable</div>
                <div className="text-xs text-gray-600 dark:text-gray-300 font-normal mt-0.5">
                  Check this if you are open to price negotiations with potential buyers/renters
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type *
                </label>
                <select
                  name="property_general_type"
                  value={formData.property_general_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {getGeneralTypesForCategory(formData.property_category).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Style *
                </label>
                <select
                  name="property_style"
                  value={formData.property_style}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {getStylesForGeneralType(formData.property_general_type).map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              {!isCommercial && !isLand && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bedrooms *
                    </label>
                    <Input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Bathrooms *
                    </label>
                    <Input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Half Bathrooms
                    </label>
                    <Input
                      type="number"
                      name="half_bathrooms"
                      value={formData.half_bathrooms}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Half bath has toilet and sink (no shower/tub)
                    </p>
                  </div>
                </>
              )}

              {isCommercial && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Bathrooms
                    </label>
                    <Input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Half Bathrooms
                    </label>
                    <Input
                      type="number"
                      name="half_bathrooms"
                      value={formData.half_bathrooms}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Half bath has toilet and sink (no shower/tub)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Loading Docks
                    </label>
                    <Input
                      type="number"
                      name="loading_docks"
                      value={formData.loading_docks}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Floor Number
                    </label>
                    <Input
                      type="number"
                      name="floor_number"
                      value={formData.floor_number}
                      onChange={handleChange}
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      For office spaces within a building
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Floors
                    </label>
                    <Input
                      type="number"
                      name="total_floors"
                      value={formData.total_floors}
                      onChange={handleChange}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zoning
                    </label>
                    <Input
                      name="zoning"
                      value={formData.zoning}
                      onChange={handleChange}
                      placeholder="e.g., Commercial, Industrial, Mixed-Use"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Square Feet
                </label>
                <Input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  placeholder="2000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional - Enter the property size if known
                </p>
              </div>

              {!isLand && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parking Spaces
                  </label>
                  <Input
                    type="number"
                    name="parking_spaces"
                    value={formData.parking_spaces}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region *
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Region</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area / City *
                </label>
                {formData.region ? (
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Area</option>
                    {availableAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Select a region first"
                    disabled
                  />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select a region first to see available areas
                </p>
              </div>
            </div>

            {!isLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Maintenance Cost (TTD)
                </label>
                <Input
                  type="number"
                  name="monthly_maintenance"
                  value={formData.monthly_maintenance}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional - Enter monthly maintenance fees, HOA fees, or condo fees if applicable
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Property Features
              </label>
              <div className="space-y-6">
                {Object.entries(featuresByCategory).map(([category, features]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {features.map((feature) => {
                        const Icon = feature.icon;
                        const isSelected = selectedFeatures.has(feature.name);
                        return (
                          <label
                            key={feature.name}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFeatureToggle(feature.name)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`} />
                            <span className={`text-sm ${isSelected ? 'text-green-900 dark:text-green-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {feature.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Select all features that apply to this property
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Images *
              </label>
              <ImageUpload
                images={imageUrls}
                onChange={setImageUrls}
                onUpload={handleImageUpload}
                maxImages={10}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Upload high-quality images of your property. The first image will be used as the cover.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-listings')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Listing Created Successfully!"
        message="Your property listing has been published and is now visible to potential buyers/renters."
      />
    </div>
  );
}
