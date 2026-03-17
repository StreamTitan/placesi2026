import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Home as HomeIcon, MapPin, Heart, Building2, Car, User, FileText, CheckCircle, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Flag } from '../ui/Flag';
import type { Database } from '../../lib/database.types';
import { formatPropertyType } from '../../lib/propertyTypes';
import { getFeatureIcon, isCommercialPropertyType, isLandPropertyType } from '../../lib/propertyFeatures';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  fromChat?: boolean;
  onFavoriteChange?: () => void;
}

interface AgencyInfo {
  name: string;
  logo_url: string | null;
}

interface AgentInfo {
  name: string;
  avatar_url: string | null;
}

export function PropertyCard({ property, fromChat = false, onFavoriteChange }: PropertyCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [agent, setAgent] = useState<AgentInfo | null>(null);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
    fetchFeatures();
    fetchAgency();
    fetchAgent();
  }, [user, property.id]);

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

  const fetchAgency = async () => {
    try {
      if (property.agency_id) {
        const { data } = await supabase
          .from('agencies')
          .select('name, logo_url')
          .eq('id', property.agency_id)
          .maybeSingle();

        if (data) {
          setAgency(data);
          return;
        }
      }

      const { data: agentData } = await supabase
        .from('agent_profiles')
        .select('agency_id')
        .eq('user_id', property.listed_by)
        .maybeSingle();

      if (agentData?.agency_id) {
        const { data: agencyData } = await supabase
          .from('agencies')
          .select('name, logo_url')
          .eq('id', agentData.agency_id)
          .maybeSingle();

        if (agencyData) {
          setAgency(agencyData);
        }
      }
    } catch (error) {
      console.error('Error fetching agency:', error);
    }
  };

  const fetchAgent = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', property.listed_by)
        .maybeSingle();

      if (profileData) {
        setAgent({
          name: profileData.full_name || 'Agent',
          avatar_url: profileData.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);

        if (error) throw error;
        setIsFavorite(false);
        onFavoriteChange?.();
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: property.id,
          });

        if (error) throw error;
        setIsFavorite(true);
        onFavoriteChange?.();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
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

  const isLand = isLandPropertyType(property.property_general_type, property.property_style);

  const images = Array.isArray(property.images) ? property.images : [];
  const imageUrl = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop';

  return (
    <Link to={`/property/${property.id}`} state={{ fromChat, from: window.location.pathname }} className="block h-full">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 ${
        fromChat ? 'flex flex-col md:flex-row border border-gray-200 dark:border-gray-700' : 'flex h-full'
      }`}>
        <div className={`relative overflow-hidden flex-shrink-0 ${
          fromChat ? 'w-full h-52 md:w-40 md:h-auto' : 'w-48 h-full'
        }`}>
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-200"
          />
          <div className={`absolute top-2 left-2 bg-gray-900/90 backdrop-blur-sm text-white px-2 py-1 rounded-full font-semibold shadow-lg ${
            fromChat ? 'text-xs' : 'text-xs'
          }`}>
            {property.property_category === 'rent' ? 'For Rent' : 'For Sale'}
          </div>
          {fromChat && (
            <div className="absolute top-2 right-2 md:hidden bg-green-600 text-white rounded-full font-bold shadow-lg px-2.5 py-1 text-sm">
              {formatPrice(property.price)}
            </div>
          )}
          {user && (
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`absolute p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg ${
                fromChat ? 'bottom-2 left-2' : 'bottom-2 left-2'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </button>
          )}
        </div>

        <div className={`flex-1 flex flex-col min-w-0 ${
          fromChat ? 'p-3' : 'p-4'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-semibold text-gray-900 dark:text-white flex-1 ${
                fromChat ? 'text-base line-clamp-2 leading-tight' : 'text-base line-clamp-2 leading-tight'
              }`}>
                {property.title}
              </h3>
              {fromChat ? (
                <div className="hidden md:block bg-green-600 text-white px-2.5 py-1 rounded-md text-sm font-bold flex-shrink-0">
                  {formatPrice(property.price)}
                </div>
              ) : (
                <div className="bg-green-600 text-white px-2.5 py-1 rounded-md text-sm font-bold flex-shrink-0">
                  {formatPrice(property.price)}
                </div>
              )}
            </div>

            <div className={`flex items-start text-gray-600 dark:text-gray-400 gap-2 ${
              fromChat ? 'mb-1.5' : 'mb-1.5'
            }`}>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate text-xs">{property.city}, {property.region}</span>
                <Flag countryCode="tt" size="sm" title="Trinidad and Tobago" className="ml-2" />
              </div>
            </div>

            <div className={`flex items-center text-gray-600 dark:text-gray-400 ${
              fromChat ? 'mb-2' : 'mb-2'
            }`}>
              <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-xs truncate">
                {formatPropertyType(
                  property.property_category,
                  property.property_general_type,
                  property.property_style
                )}
              </span>
            </div>

            <div className={`flex items-center text-gray-700 dark:text-gray-300 flex-wrap ${
              fromChat ? 'gap-2.5 mb-2' : 'gap-3 mb-3'
            }`}>
              {isLand ? (
                <>
                  {property.size_sqft && (
                    <div className="flex items-center">
                      <Maximize2 className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                      <span className="text-xs font-medium whitespace-nowrap">{property.size_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FileText className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">{getLandTenure()}</span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <CheckCircle className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">{getTCStatus()}</span>
                  </div>
                </>
              ) : !isCommercialPropertyType(property.property_general_type) ? (
                <>
                  <div className="flex items-center">
                    <Bed className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {property.bathrooms}
                      {property.half_bathrooms && property.half_bathrooms > 0 ? `.${property.half_bathrooms}` : ''} Baths
                    </span>
                  </div>
                  {property.size_sqft && (
                    <div className="flex items-center">
                      <HomeIcon className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                      <span className="text-xs font-medium whitespace-nowrap">{property.size_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {property.parking_spaces !== null && property.parking_spaces > 0 && (
                    <div className="flex items-center">
                      <Car className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                      <span className="text-xs font-medium whitespace-nowrap">{property.parking_spaces} Parking</span>
                    </div>
                  )}
                  {property.total_floors && (
                    <div className="flex items-center">
                      <Building2 className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                      <span className="text-xs font-medium whitespace-nowrap">{property.total_floors} Floors</span>
                    </div>
                  )}
                  {property.size_sqft && (
                    <div className="flex items-center">
                      <HomeIcon className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                      <span className="text-xs font-medium whitespace-nowrap">{property.size_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {agent && (
              <div className={`flex items-center gap-1.5 mt-auto ${fromChat ? 'pt-1.5 border-t border-gray-200 dark:border-gray-700' : 'pt-2 border-t border-gray-200 dark:border-gray-700'}`.trim()}>
                {agent.avatar_url ? (
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden w-6 h-6">
                    <img
                      src={agent.avatar_url}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 w-6 h-6">
                    <User className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                  </div>
                )}
                <span className="whitespace-nowrap text-gray-700 dark:text-gray-300 truncate text-xs font-medium">
                  {agent.name}
                </span>
              </div>
            )}

            {agency && (
              <div className={`flex items-center gap-1.5 ${fromChat ? 'mt-1' : 'mt-1'}`.trim()}>
                {agency.logo_url ? (
                  <div className="rounded bg-white flex items-center justify-center flex-shrink-0 w-4 h-4">
                    <img
                      src={agency.logo_url}
                      alt={agency.name}
                      className="w-full h-full rounded object-cover"
                    />
                  </div>
                ) : (
                  <Building2 className="flex-shrink-0 text-gray-500 w-3.5 h-3.5" />
                )}
                <span className="whitespace-nowrap text-gray-600 dark:text-gray-400 truncate text-xs max-w-[100px]">
                  {agency.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
