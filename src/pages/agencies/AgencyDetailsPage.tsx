import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Home,
  Calendar,
  Globe,
  Target,
  Heart,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPhoneNumber } from '../../lib/formatters';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentRowCard } from '../../components/agents/AgentRowCard';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface Agency {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  about: string | null;
  mission: string | null;
  founded_year: number | null;
  team_size: number | null;
  website: string | null;
}

interface Agent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  years_experience: number | null;
  specializations: string[] | null;
  is_verified: boolean;
  email: string | null;
  whatsapp: string | null;
  agency_name: string | null;
  agency_logo: string | null;
  listing_count: number;
}

export function AgencyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'agents' | 'listings'>('about');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (id) {
      loadAgencyDetails();
      loadFavoriteCount();
      if (user) {
        checkFavoriteStatus();
      }
    }
  }, [id, user]);

  const loadAgencyDetails = async () => {
    try {
      setLoading(true);

      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (agencyError) throw agencyError;
      if (!agencyData) {
        navigate('/agencies');
        return;
      }

      setAgency(agencyData);

      const { data: agentProfiles, error: agentError } = await supabase
        .from('agent_profiles')
        .select(`
          user_id,
          bio,
          years_experience,
          specializations,
          is_verified,
          email,
          whatsapp
        `)
        .eq('agency_id', id);

      if (agentError) throw agentError;

      const agentUserIds = agentProfiles?.map(ap => ap.user_id) || [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, role')
        .in('id', agentUserIds)
        .eq('role', 'agent');

      if (profileError) throw profileError;

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('listed_by', agentUserIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      const listingCounts = (propertiesData || []).reduce((acc, prop) => {
        acc[prop.listed_by] = (acc[prop.listed_by] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const agentsMap = new Map(agentProfiles?.map(ap => [ap.user_id, ap]) || []);

      const combinedAgents: Agent[] = (profiles || []).map(profile => {
        const agentProfile = agentsMap.get(profile.id);

        return {
          id: profile.id,
          full_name: profile.full_name || 'Unknown Agent',
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          bio: agentProfile?.bio || null,
          years_experience: agentProfile?.years_experience || null,
          specializations: agentProfile?.specializations || null,
          is_verified: agentProfile?.is_verified || false,
          email: agentProfile?.email || null,
          whatsapp: agentProfile?.whatsapp || null,
          agency_name: agencyData.name,
          agency_logo: agencyData.logo_url,
          listing_count: listingCounts[profile.id] || 0,
        };
      });

      setAgents(combinedAgents);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error loading agency details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteCount = async () => {
    if (!id) return;
    try {
      const { count, error } = await supabase
        .from('agency_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', id);

      if (error) throw error;
      setFavoriteCount(count || 0);
    } catch (error) {
      console.error('Error loading favorite count:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('agency_favorites')
        .select('agency_id')
        .eq('user_id', user.id)
        .eq('agency_id', id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('agency_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('agency_id', id);

        if (error) throw error;
        setIsFavorite(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('agency_favorites')
          .insert({ user_id: user.id, agency_id: id });

        if (error) throw error;
        setIsFavorite(true);
        setFavoriteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Agency not found
          </h2>
          <Button onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-0 pb-8 md:py-8">
      <AdBanner className="h-[150px] mb-0" />

      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mt-3 mb-4 md:mt-6 md:mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-4 sm:p-8">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                {agency.logo_url ? (
                  <div className="w-20 h-20 rounded-lg bg-white dark:bg-white p-2 border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={agency.logo_url}
                      alt={agency.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                    {agency.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {agency.name}
                  </h1>
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className="flex-shrink-0 p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                    />
                  </button>
                </div>
                {agency.registration_number && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Registration: {agency.registration_number}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4 text-green-600" />
                <span><strong>{agents.length}</strong> {agents.length === 1 ? 'Agent' : 'Agents'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Home className="w-4 h-4 text-green-600" />
                <span><strong>{properties.length}</strong> Active {properties.length === 1 ? 'Listing' : 'Listings'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Heart className="w-4 h-4 text-red-500" />
                <span><strong>{favoriteCount}</strong> {favoriteCount === 1 ? 'favorite' : 'favorites'}</span>
              </div>
            </div>

            {agency.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {agency.description}
              </p>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              {agency.logo_url ? (
                <div className="w-32 h-32 rounded-lg bg-white dark:bg-white p-3 border-4 border-gray-200 dark:border-gray-700">
                  <img
                    src={agency.logo_url}
                    alt={agency.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
                  {agency.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {agency.name}
                  </h1>
                  {agency.registration_number && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Registration: {agency.registration_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {agency.is_verified && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isFavorite ? 'Favorited' : 'Favorite'}
                    </span>
                  </button>
                </div>
              </div>

              {agency.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {agency.description}
                </p>
              )}

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="w-5 h-5 text-green-600" />
                  <span><strong>{agents.length}</strong> {agents.length === 1 ? 'Agent' : 'Agents'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Home className="w-5 h-5 text-green-600" />
                  <span><strong>{properties.length}</strong> Active {properties.length === 1 ? 'Listing' : 'Listings'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span><strong>{favoriteCount}</strong> {favoriteCount === 1 ? 'favorite' : 'favorites'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {agency.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{agency.address}</span>
                  </div>
                )}
                {agency.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <a
                      href={`tel:${agency.phone}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {formatPhoneNumber(agency.phone)}
                    </a>
                  </div>
                )}
                {agency.whatsapp && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <a
                      href={`https://wa.me/${agency.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      WhatsApp: {formatPhoneNumber(agency.whatsapp)}
                    </a>
                  </div>
                )}
                {agency.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <a
                      href={`mailto:${agency.email}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {agency.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'about'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'agents'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Agents ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'listings'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Listings ({properties.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'about' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {!agency.about && !agency.mission && !agency.founded_year && !agency.team_size && !agency.website ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No About Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This agency hasn't added their about information yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {agency.mission && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
                    {agency.mission}
                  </p>
                </div>
              )}

              {agency.about && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    About Us
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {agency.about}
                  </p>
                </div>
              )}

              {(agency.founded_year || agency.team_size || agency.website) && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Agency Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agency.founded_year && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Founded</p>
                          <p className="text-gray-900 dark:text-white">{agency.founded_year}</p>
                        </div>
                      </div>
                    )}
                    {agency.team_size && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Size</p>
                          <p className="text-gray-900 dark:text-white">{agency.team_size} employees</p>
                        </div>
                      </div>
                    )}
                    {agency.website && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Globe className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</p>
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline"
                          >
                            {agency.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'agents' ? (
        <div>
          {agents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Agents
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This agency doesn't have any agents registered yet.
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {agents.map(agent => (
                  <AgentRowCard key={agent.id} agent={agent} />
                ))}
              </div>
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {properties.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Active Listings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This agency doesn't have any active property listings at the moment.
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {properties.map(property => (
                  <PropertyRowCard key={property.id} property={property} />
                ))}
              </div>
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
