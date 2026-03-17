import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Home as HomeIcon, MapPin, FileText, CheckCircle, Maximize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { formatPropertyType } from '../../lib/propertyTypes';
import { isCommercialPropertyType, isLandPropertyType } from '../../lib/propertyFeatures';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyRowCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyRowCard({ property, onClick }: PropertyRowCardProps) {
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    fetchFeatures();
  }, [property.id]);

  const fetchFeatures = async () => {
    try {
      const { data } = await supabase
        .from('property_features')
        .select('feature_name')
        .eq('property_id', property.id)
        .limit(3);

      if (data) {
        setFeatures(data.map(f => f.feature_name));
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getLandTenure = (): string => {
    if (features.includes('Freehold Land')) return 'Freehold Land';
    if (features.includes('Leasehold Land')) return 'Leasehold Land';
    return 'Unknown';
  };

  const getTCStatus = (): string => {
    if (features.includes('T&C Approved')) return 'T&C Approved';
    return 'Unknown';
  };

  const images = Array.isArray(property.images) ? property.images : [];
  const imageUrl = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop';

  const isCommercial = isCommercialPropertyType(property.property_general_type);
  const isLand = isLandPropertyType(property.property_general_type, property.property_style);

  const CardWrapper = onClick ? 'div' : Link;
  const cardProps = onClick
    ? { onClick, className: "block cursor-pointer" }
    : { to: `/property/${property.id}`, state: { from: window.location.pathname }, className: "block" };

  return (
    <CardWrapper {...cardProps as any}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 p-3">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 left-1 bg-gray-900/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {property.property_category === 'rent' ? 'Rent' : 'Sale'}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                {property.title}
              </h3>

              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1.5">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">{property.city}, {property.region}</span>
              </div>

              <div className="flex items-center text-gray-700 dark:text-gray-300 gap-3 mb-1.5">
                {isLand ? (
                  <>
                    {property.size_sqft && (
                      <div className="flex items-center">
                        <Maximize2 className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-xs font-medium">{property.size_sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs font-medium">{getLandTenure()}</span>
                    </div>
                    <div className="hidden md:flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs font-medium">{getTCStatus()}</span>
                    </div>
                  </>
                ) : !isCommercial ? (
                  <>
                    <div className="flex items-center">
                      <Bed className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs font-medium">
                        {property.bathrooms}
                        {property.half_bathrooms && property.half_bathrooms > 0 ? `.${property.half_bathrooms}` : ''}
                      </span>
                    </div>
                    {property.size_sqft && (
                      <div className="flex items-center">
                        <HomeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-xs font-medium">{property.size_sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {property.size_sqft && (
                      <div className="flex items-center">
                        <HomeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-xs font-medium">{property.size_sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
