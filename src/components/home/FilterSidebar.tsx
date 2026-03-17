import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { REGIONS, getAreasForRegion } from '../../lib/locations';
import {
  PROPERTY_CATEGORIES,
  getGeneralTypesForCategory,
  getStylesForGeneralType,
  type PropertyCategory,
  type PropertyGeneralType,
} from '../../lib/propertyTypes';
import { getFeaturesByCategory, isCommercialPropertyType } from '../../lib/propertyFeatures';
import { useState } from 'react';

export interface FilterOptions {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  propertyCategory?: PropertyCategory;
  propertyGeneralType?: string;
  propertyStyle?: string;
  city: string;
  region: string;
  area: string;
  areas?: string[];
  listingType?: string;
  features?: string[];
  isNegotiable?: boolean;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset
}: FilterSidebarProps) {
  const [featuresExpanded, setFeaturesExpanded] = useState(true);

  const handleChange = (field: keyof FilterOptions, value: string) => {
    if (field === 'region') {
      onFilterChange({ ...filters, [field]: value, area: '', areas: [] });
    } else if (field === 'propertyCategory') {
      const newCategory = value as PropertyCategory;
      const generalTypes = getGeneralTypesForCategory(newCategory);
      onFilterChange({
        ...filters,
        propertyCategory: newCategory,
        propertyGeneralType: '',
        propertyStyle: '',
        listingType: newCategory === 'rent' ? 'rent' : 'sale',
      });
    } else if (field === 'propertyGeneralType') {
      onFilterChange({
        ...filters,
        propertyGeneralType: value,
        propertyStyle: '',
      });
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleAreaToggle = (area: string) => {
    const currentAreas = filters.areas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    onFilterChange({ ...filters, areas: newAreas });
  };

  const handleSelectAllAreas = () => {
    const allAreas = filters.region ? getAreasForRegion(filters.region) : [];
    onFilterChange({ ...filters, areas: allAreas });
  };

  const handleClearAllAreas = () => {
    onFilterChange({ ...filters, areas: [] });
  };

  const handleFeatureToggle = (featureName: string) => {
    const currentFeatures = filters.features || [];
    const newFeatures = currentFeatures.includes(featureName)
      ? currentFeatures.filter(f => f !== featureName)
      : [...currentFeatures, featureName];
    onFilterChange({ ...filters, features: newFeatures });
  };

  const handleSelectAllFeatures = () => {
    const features = Object.values(featuresByCategory).flat();
    const allFeatureNames = features.map(f => f.name);
    onFilterChange({ ...filters, features: allFeatureNames });
  };

  const handleClearAllFeatures = () => {
    onFilterChange({ ...filters, features: [] });
  };

  const availableAreas = filters.region ? getAreasForRegion(filters.region) : [];
  const selectedAreas = filters.areas || [];
  const selectedFeatures = filters.features || [];
  const isCommercial = isCommercialPropertyType(filters.propertyGeneralType);
  const featuresByCategory = getFeaturesByCategory(filters.propertyGeneralType);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Search</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Category</h3>
              <div className="flex gap-2 relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <div
                  className={`absolute top-1 bottom-1 bg-gray-900 dark:bg-gray-100 rounded-md transition-all duration-300 ease-out ${
                    filters.propertyCategory === 'buy' ? 'left-1 w-[calc(50%-6px)]' : 'left-[calc(50%+2px)] w-[calc(50%-6px)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleChange('propertyCategory', 'buy')}
                  className={`relative z-10 flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors duration-300 ${
                    filters.propertyCategory === 'buy'
                      ? 'text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('propertyCategory', 'rent')}
                  className={`relative z-10 flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors duration-300 ${
                    filters.propertyCategory === 'rent'
                      ? 'text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Minimum Price"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                />
                <Input
                  label="Maximum Price"
                  type="number"
                  placeholder="10000000"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                />
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isNegotiable || false}
                    onChange={(e) => onFilterChange({ ...filters, isNegotiable: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Negotiable prices only
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Property Classification</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.propertyGeneralType || ''}
                    onChange={(e) => handleChange('propertyGeneralType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {filters.propertyCategory &&
                      getGeneralTypesForCategory(filters.propertyCategory).map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                  </select>
                </div>
                {filters.propertyGeneralType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property Style
                    </label>
                    <select
                      value={filters.propertyStyle || ''}
                      onChange={(e) => handleChange('propertyStyle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Styles</option>
                      {getStylesForGeneralType(filters.propertyGeneralType as PropertyGeneralType).map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {!isCommercial && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Bedrooms"
                    type="number"
                    placeholder="Any"
                    value={filters.bedrooms}
                    onChange={(e) => handleChange('bedrooms', e.target.value)}
                  />
                  <Input
                    label="Bathrooms"
                    type="number"
                    placeholder="Any"
                    value={filters.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Location</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent [&>option[value='']]:bg-green-50 [&>option[value='']]:text-green-800 [&>option[value='']]:font-semibold dark:[&>option[value='']]:bg-green-900 dark:[&>option[value='']]:text-green-100"
                  >
                    <option value="">All Regions</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                {filters.region && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Areas in {filters.region} ({selectedAreas.length} selected)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllAreas}
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllAreas}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-hide border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                      <div className="space-y-0.5">
                        {availableAreas.map((area) => (
                          <label
                            key={area}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAreas.includes(area)}
                              onChange={() => handleAreaToggle(area)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <Input
                  label="City (Optional)"
                  placeholder="Search by city name"
                  value={filters.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setFeaturesExpanded(!featuresExpanded)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-3 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <span>Features & Amenities ({selectedFeatures.length} selected)</span>
                {featuresExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {featuresExpanded && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllFeatures}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllFeatures}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-hide border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 space-y-3">
                    {Object.entries(featuresByCategory).map(([category, features]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {features.map((feature) => {
                            const Icon = feature.icon;
                            const isSelected = selectedFeatures.includes(feature.name);
                            return (
                              <label
                                key={feature.name}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 px-2 py-1.5 rounded transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleFeatureToggle(feature.name)}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                <span className={`text-sm flex-1 ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {feature.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="w-full"
            >
              Apply Filters
            </Button>
            <Button
              variant="secondary"
              onClick={onReset}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
