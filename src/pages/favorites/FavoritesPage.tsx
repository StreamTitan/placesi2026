import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentRowCard } from '../../components/agents/AgentRowCard';
import { AgencyCard } from '../../components/agencies/AgencyCard';
import { Heart, Users, Building2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface Favorite {
  property_id: string;
  created_at: string;
  properties: Property;
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

interface AgentFavorite {
  agent_id: string;
  created_at: string;
}

interface Agency {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
}

interface AgencyFavorite {
  agency_id: string;
  created_at: string;
}

type TabType = 'listings' | 'agents' | 'agencies';

export function FavoritesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [agentFavorites, setAgentFavorites] = useState<Agent[]>([]);
  const [agencyFavorites, setAgencyFavorites] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAllFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        loadPropertyFavorites(),
        loadAgentFavorites(),
        loadAgencyFavorites()
      ]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          created_at,
          properties:property_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading property favorites:', error);
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading property favorites:', error);
    }
  };

  const loadAgentFavorites = async () => {
    if (!user) return;

    try {
      const { data: agentFavData, error: favError } = await supabase
        .from('agent_favorites')
        .select('agent_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) {
        console.error('Error loading agent favorites:', favError);
        return;
      }

      if (!agentFavData || agentFavData.length === 0) {
        setAgentFavorites([]);
        return;
      }

      const agentIds = agentFavData.map(fav => fav.agent_id);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', agentIds);

      if (profileError) throw profileError;

      const { data: agentProfiles, error: agentError } = await supabase
        .from('agent_profiles')
        .select('user_id, bio, years_experience, specializations, is_verified, email, whatsapp, agency_id')
        .in('user_id', agentIds);

      if (agentError) throw agentError;

      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('listed_by')
        .in('listed_by', agentIds)
        .eq('status', 'active');

      if (propError) throw propError;

      const listingCounts = (properties || []).reduce((acc, prop) => {
        acc[prop.listed_by] = (acc[prop.listed_by] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const agencyIds = agentProfiles?.map(ap => ap.agency_id).filter(Boolean) || [];
      let agenciesMap = new Map();

      if (agencyIds.length > 0) {
        const { data: agencies } = await supabase
          .from('agencies')
          .select('id, name, logo_url')
          .in('id', agencyIds);

        agenciesMap = new Map(agencies?.map(a => [a.id, a]) || []);
      }

      const agentProfilesMap = new Map(agentProfiles?.map(ap => [ap.user_id, ap]) || []);

      const agents: Agent[] = (profiles || []).map(profile => {
        const agentProfile = agentProfilesMap.get(profile.id);
        const agency = agentProfile?.agency_id ? agenciesMap.get(agentProfile.agency_id) : null;

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
          agency_name: agency?.name || null,
          agency_logo: agency?.logo_url || null,
          listing_count: listingCounts[profile.id] || 0,
        };
      });

      setAgentFavorites(agents);
    } catch (error) {
      console.error('Error loading agent favorites:', error);
    }
  };

  const loadAgencyFavorites = async () => {
    if (!user) return;

    try {
      const { data: agencyFavData, error: favError } = await supabase
        .from('agency_favorites')
        .select('agency_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) {
        console.error('Error loading agency favorites:', favError);
        return;
      }

      if (!agencyFavData || agencyFavData.length === 0) {
        setAgencyFavorites([]);
        return;
      }

      const agencyIds = agencyFavData.map(fav => fav.agency_id);

      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .in('id', agencyIds);

      if (agencyError) throw agencyError;

      setAgencyFavorites(agencies || []);
    } catch (error) {
      console.error('Error loading agency favorites:', error);
    }
  };

  const handlePropertyFavoriteRemoved = (propertyId: string) => {
    setFavorites(favorites.filter(fav => fav.property_id !== propertyId));
  };

  const handleAgentFavoriteRemoved = () => {
    loadAgentFavorites();
  };

  const handleAgencyFavoriteRemoved = () => {
    loadAgencyFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading favorites...</div>
      </div>
    );
  }

  const getTotalCount = () => {
    return favorites.length + agentFavorites.length + agencyFavorites.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Favorites
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved listings, agents, and agencies
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'listings'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">
                  <span className="hidden sm:inline">Listings </span>
                  ({favorites.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'agents'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">
                  <span className="hidden sm:inline">Agents </span>
                  ({agentFavorites.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('agencies')}
                className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'agencies'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">
                  <span className="hidden sm:inline">Agencies </span>
                  ({agencyFavorites.length})
                </span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'listings' && (
          favorites.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No favorite listings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start browsing properties and save your favorites to view them here
              </p>
              <a
                href="/search"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Properties
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </div>
              <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                {favorites.map((favorite) => (
                  <PropertyCard
                    key={favorite.property_id}
                    property={favorite.properties}
                    onFavoriteChange={() => handlePropertyFavoriteRemoved(favorite.property_id)}
                  />
                ))}
              </div>
              <div className="lg:hidden space-y-3">
                {favorites.map((favorite) => (
                  <PropertyRowCard
                    key={favorite.property_id}
                    property={favorite.properties}
                  />
                ))}
              </div>
            </>
          )
        )}

        {activeTab === 'agents' && (
          agentFavorites.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No favorite agents yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse agents and save your favorites to view them here
              </p>
              <a
                href="/agents"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Agents
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {agentFavorites.length} {agentFavorites.length === 1 ? 'agent' : 'agents'} saved
              </div>
              <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                {agentFavorites.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                  />
                ))}
              </div>
              <div className="lg:hidden space-y-3">
                {agentFavorites.map((agent) => (
                  <AgentRowCard
                    key={agent.id}
                    agent={agent}
                  />
                ))}
              </div>
            </>
          )
        )}

        {activeTab === 'agencies' && (
          agencyFavorites.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No favorite agencies yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse agencies and save your favorites to view them here
              </p>
              <a
                href="/agencies"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Agencies
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {agencyFavorites.length} {agencyFavorites.length === 1 ? 'agency' : 'agencies'} saved
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agencyFavorites.map((agency) => (
                  <AgencyCard
                    key={agency.id}
                    agency={agency}
                    showFavoriteButton={true}
                    onFavoriteChange={handleAgencyFavoriteRemoved}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
