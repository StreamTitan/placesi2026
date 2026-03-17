import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Home as HomeIcon,
  Calendar,
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Car,
  Building2,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import { AgentContactDrawer } from '../../components/property/AgentContactDrawer';
import { ShareDrawer } from '../../components/property/ShareDrawer';
import { ImageGalleryModal } from '../../components/property/ImageGalleryModal';
import { getFeatureIcon, getFeaturesByCategory, PROPERTY_FEATURES, COMMERCIAL_FEATURES, isCommercialPropertyType, isLandPropertyType } from '../../lib/propertyFeatures';
import { formatPropertyType } from '../../lib/propertyTypes';

type Property = Database['public']['Tables']['properties']['Row'];

interface AgentInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  avatar_url?: string | null;
}

interface AgencyInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const fromChat = (location.state as { fromChat?: boolean })?.fromChat;
  const fromPath = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (id) {
      fetchProperty(id);
      if (user) {
        checkFavoriteStatus(id);
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (id && property) {
      incrementViewCount(id);
    }
  }, [id, property?.id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (error) throw error;
      setProperty(data);

      if (data) {
        await fetchAgentInfo(data.listed_by);
        await fetchFeatures(propertyId);
        await fetchAgencyInfo(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (propertyId: string) => {
    if (!property) return;

    if (user && user.id === property.listed_by) {
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_property_views', {
        property_uuid: propertyId
      });

      if (error) {
        console.error('Error incrementing view count:', error);
      } else {
        setProperty(prev => prev ? { ...prev, view_count: prev.view_count + 1 } : prev);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const fetchFeatures = async (propertyId: string) => {
    try {
      const { data } = await supabase
        .from('property_features')
        .select('feature_name')
        .eq('property_id', propertyId)
        .order('feature_name');

      if (data) {
        setFeatures(data.map(f => f.feature_name));
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchAgencyInfo = async (propertyData: Property) => {
    try {
      if (propertyData.agency_id) {
        const { data } = await supabase
          .from('agencies')
          .select('id, name, logo_url')
          .eq('id', propertyData.agency_id)
          .maybeSingle();

        if (data) {
          setAgencyInfo(data);
          return;
        }
      }

      const { data: agentData } = await supabase
        .from('agent_profiles')
        .select('agency_id')
        .eq('user_id', propertyData.listed_by)
        .maybeSingle();

      if (agentData?.agency_id) {
        const { data: agencyData } = await supabase
          .from('agencies')
          .select('id, name, logo_url')
          .eq('id', agentData.agency_id)
          .maybeSingle();

        if (agencyData) {
          setAgencyInfo(agencyData);
        }
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    }
  };

  const fetchAgentInfo = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: agentData, error: agentError } = await supabase
        .from('agent_profiles')
        .select('email, whatsapp')
        .eq('user_id', userId)
        .maybeSingle();

      if (agentError && agentError.code !== 'PGRST116') throw agentError;

      setAgentInfo({
        id: userId,
        name: profileData?.full_name || 'Agent',
        phone: profileData?.phone || undefined,
        email: agentData?.email || undefined,
        whatsapp: agentData?.whatsapp || undefined,
        avatar_url: profileData?.avatar_url || null,
      });
    } catch (error) {
      console.error('Error fetching agent info:', error);
      setAgentInfo({ id: userId, name: 'Agent' });
    }
  };

  const checkFavoriteStatus = async (propertyId: string) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !property || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: property.id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const imageUrls = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-0 pb-8 md:py-8">
      <AdBanner className="h-[150px] mb-0" />

      <button
        onClick={() => {
          if (fromChat) {
            navigate('/chat', { state: { returnToResults: true } });
          } else if (fromPath) {
            navigate(fromPath);
          } else {
            navigate(-1);
          }
        }}
        className="flex items-center text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 mt-3 mb-4 md:mt-6 md:mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2 dark:text-green-500" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 dark:bg-white mb-6">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="w-full cursor-pointer group"
            >
              <img
                src={imageUrls[currentImageIndex]}
                alt={property.title}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover transition-transform group-hover:scale-105"
              />
            </button>

            <div className="absolute top-6 left-6 flex gap-2">
              <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </div>
              {property.is_negotiable && (
                <div className="bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Negotiable
                </div>
              )}
            </div>

            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-900" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
              {imageUrls.slice(0, 4).map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden h-16 sm:h-20 md:h-24 ${
                    index === currentImageIndex ? 'ring-2 ring-green-600' : ''
                  }`}
                >
                  <img src={url} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{property.title}</h1>

            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{property.city}, {property.region}</span>
            </div>

            <div className="flex items-center gap-8 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 flex-wrap">
              {!isCommercialPropertyType(property.property_general_type) && !isLandPropertyType(property.property_general_type, property.property_style) ? (
                <>
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{property.bedrooms}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {property.bathrooms}
                        {property.half_bathrooms && property.half_bathrooms > 0 ? `.${property.half_bathrooms}` : ''}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {property.half_bathrooms && property.half_bathrooms > 0
                          ? `${property.bathrooms} Full + ${property.half_bathrooms} Half`
                          : 'Bathrooms'}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
              {isCommercialPropertyType(property.property_general_type) && (
                <>
                  {property.total_floors && (
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{property.total_floors}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Floors</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!isLandPropertyType(property.property_general_type, property.property_style) && property.parking_spaces !== null && property.parking_spaces > 0 && (
                <div className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{property.parking_spaces}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parking Spaces</p>
                  </div>
                </div>
              )}
              {property.size_sqft && (
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{property.size_sqft.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sq Ft</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {!isLandPropertyType(property.property_general_type, property.property_style) && property.monthly_maintenance && property.monthly_maintenance > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Maintenance Cost
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Includes HOA/condo fees and regular maintenance
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(property.monthly_maintenance)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
                  </div>
                </div>
              </div>
            )}

            {(features.length > 0 || (property.amenities && property.amenities.length > 0)) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features & Amenities</h2>
                <div className="space-y-6">
                  {Object.entries(
                    [...features, ...(property.amenities || [])].reduce((acc, featureName) => {
                      const allFeatures = [...PROPERTY_FEATURES, ...COMMERCIAL_FEATURES];
                      const feature = allFeatures.find(f => f.name === featureName);
                      if (feature) {
                        if (!acc[feature.category]) {
                          acc[feature.category] = [];
                        }
                        acc[feature.category].push(feature);
                      } else {
                        if (!acc['other']) {
                          acc['other'] = [];
                        }
                        acc['other'].push({ name: featureName, icon: HomeIcon, category: 'other' as const });
                      }
                      return acc;
                    }, {} as Record<string, Array<{ name: string; icon: any; category: string }>>)
                  ).map(([category, categoryFeatures]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryFeatures.map((feature) => {
                          const Icon = feature.icon;
                          return (
                            <div key={feature.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                              <Icon className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feature.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Property Type</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatPropertyType(
                    property.property_category,
                    property.property_general_type,
                    property.property_style
                  )}
                </p>
              </div>
              {property.year_built && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Year Built</p>
                  <p className="font-medium text-gray-900 dark:text-white">{property.year_built}</p>
                </div>
              )}
              {property.lot_size_sqft && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lot Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">{property.lot_size_sqft.toLocaleString()} sqft</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{property.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
            <div className="mb-6">
              <div className="mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(property.price)}</p>
            </div>

            <div className="space-y-3 mb-6">
              {property.listing_type === 'sale' && (
                <button
                  onClick={() => navigate(`/mortgage-calculator/${property.id}`)}
                  className="w-full bg-[#158EC5] hover:bg-[#1178a3] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Apply For A Mortgage
                </button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsContactDrawerOpen(true)}
              >
                Contact Agent
              </Button>
              <div className="flex gap-3">
                {user && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isFavorite
                          ? 'fill-red-500 text-red-500'
                          : 'text-green-600'
                      }`}
                    />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsShareDrawerOpen(true)}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {(agentInfo || agencyInfo) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Listed by</p>

                {agentInfo && (
                  <button
                    onClick={() => navigate(`/agents/${agentInfo.id}`)}
                    className="w-full flex items-center gap-3 p-3 mb-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      {agentInfo.avatar_url ? (
                        <img
                          src={agentInfo.avatar_url}
                          alt={agentInfo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {agentInfo.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                        {agentInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Agent</p>
                    </div>
                  </button>
                )}

                {agencyInfo && (
                  <button
                    onClick={() => navigate(`/agencies/${agencyInfo.id}`)}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-white rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center p-1">
                      {agencyInfo.logo_url ? (
                        <img
                          src={agencyInfo.logo_url}
                          alt={agencyInfo.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                        {agencyInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Agency</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Listed {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
              {property.view_count > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{property.view_count}</span> views
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {agentInfo && (
        <AgentContactDrawer
          isOpen={isContactDrawerOpen}
          onClose={() => setIsContactDrawerOpen(false)}
          agent={agentInfo}
          listingId={id}
        />
      )}

      {property && (
        <ShareDrawer
          isOpen={isShareDrawerOpen}
          onClose={() => setIsShareDrawerOpen(false)}
          property={{
            id: property.id,
            title: property.title,
            price: property.price,
            city: property.city,
            region: property.region,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            images: property.images,
            listing_type: property.listing_type
          }}
        />
      )}

      <ImageGalleryModal
        images={imageUrls}
        initialIndex={currentImageIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}
