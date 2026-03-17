import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Star,
  Building2,
  Phone,
  Mail,
  Award,
  Calendar,
  MessageCircle,
  Target,
  Languages,
  Trophy,
  Heart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPhoneNumber } from '../../lib/formatters';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { AgentContactDrawer } from '../../components/property/AgentContactDrawer';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface AgentDetails {
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
  license_number: string | null;
  agency_id: string | null;
  agency_name: string | null;
  agency_logo: string | null;
  agency_phone: string | null;
  agency_email: string | null;
  about: string | null;
  mission: string | null;
  languages_spoken: string[] | null;
  certifications: string[] | null;
  awards: string[] | null;
  areas_served: string[] | null;
}

export function AgentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'listings'>('about');
  const [listingFilter, setListingFilter] = useState<'all' | 'buy' | 'rent'>('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadAgentDetails();
      loadAgentProperties();
      loadFavoriteCount();
      if (user) {
        checkFavoriteStatus();
      }
    }
  }, [id, user]);

  const loadAgentDetails = async () => {
    try {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, role')
        .eq('id', id)
        .eq('role', 'agent')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        navigate('/agents');
        return;
      }

      const { data: agentProfile, error: agentError } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (agentError) throw agentError;

      let agencyData = null;
      if (agentProfile?.agency_id) {
        const { data, error } = await supabase
          .from('agencies')
          .select('id, name, logo_url, phone, email')
          .eq('id', agentProfile.agency_id)
          .maybeSingle();

        if (!error) agencyData = data;
      }

      setAgent({
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
        license_number: agentProfile?.license_number || null,
        agency_id: agentProfile?.agency_id || null,
        agency_name: agencyData?.name || null,
        agency_logo: agencyData?.logo_url || null,
        agency_phone: agencyData?.phone || null,
        agency_email: agencyData?.email || null,
        about: agentProfile?.about || null,
        mission: agentProfile?.mission || null,
        languages_spoken: agentProfile?.languages_spoken || null,
        certifications: agentProfile?.certifications || null,
        awards: agentProfile?.awards || null,
        areas_served: agentProfile?.areas_served || null,
      });
    } catch (error) {
      console.error('Error loading agent details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listed_by', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading agent properties:', error);
    }
  };

  const loadFavoriteCount = async () => {
    if (!id) return;
    try {
      const { count, error } = await supabase
        .from('agent_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', id);

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
        .from('agent_favorites')
        .select('agent_id')
        .eq('user_id', user.id)
        .eq('agent_id', id)
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
          .from('agent_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_id', id);

        if (error) throw error;
        setIsFavorite(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('agent_favorites')
          .insert({ user_id: user.id, agent_id: id });

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

  if (!agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Agent not found
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
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {agent.avatar_url ? (
                    <img
                      src={agent.avatar_url}
                      alt={agent.full_name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                      {agent.full_name.charAt(0)}
                    </div>
                  )}
                  {agent.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Favorite Button */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {agent.full_name}
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
                {agent.license_number && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    License: {agent.license_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                {agent.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
                    {agent.full_name.charAt(0)}
                  </div>
                )}
                {agent.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {agent.full_name}
                  </h1>
                  {agent.license_number && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      License: {agent.license_number}
                    </p>
                  )}
                </div>
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

              {agent.agency_name && agent.agency_id && (
                <button
                  onClick={() => navigate(`/agencies/${agent.agency_id}`)}
                  className="flex items-center gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 w-full text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md"
                >
                  {agent.agency_logo && (
                    <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg bg-white dark:bg-white p-2 sm:p-1.5 flex-shrink-0 shadow-sm">
                      <img
                        src={agent.agency_logo}
                        alt={agent.agency_name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-medium">Agency</span>
                    </div>
                    <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white leading-tight truncate">
                      {agent.agency_name}
                    </p>
                  </div>
                </button>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {agent.years_experience !== null && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span><strong>{agent.years_experience}</strong> years experience</span>
                  </div>
                )}
                {properties.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span><strong>{properties.length}</strong> active listings</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span><strong>{favoriteCount}</strong> {favoriteCount === 1 ? 'favorite' : 'favorites'}</span>
                </div>
              </div>

              {agent.specializations && agent.specializations.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specializations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Agent
                  </a>
                )}
                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Shared Content - Shows below mobile header or within desktop layout */}
          <div className="md:hidden">
            {agent.agency_name && agent.agency_id && (
              <button
                onClick={() => navigate(`/agencies/${agent.agency_id}`)}
                className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 w-full text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md"
              >
                {agent.agency_logo && (
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-white p-1.5 flex-shrink-0 shadow-sm">
                    <img
                      src={agent.agency_logo}
                      alt={agent.agency_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">Agency</span>
                  </div>
                  <p className="font-semibold text-base text-gray-900 dark:text-white leading-tight truncate">
                    {agent.agency_name}
                  </p>
                </div>
              </button>
            )}

            <div className="flex flex-wrap gap-3 text-sm mb-4">
              {agent.years_experience !== null && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span><strong>{agent.years_experience}</strong> years experience</span>
                </div>
              )}
              {properties.length > 0 && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span><strong>{properties.length}</strong> active listings</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Heart className="w-4 h-4 text-red-500" />
                <span><strong>{favoriteCount}</strong> {favoriteCount === 1 ? 'favorite' : 'favorites'}</span>
              </div>
            </div>

            {agent.specializations && agent.specializations.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsContactDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Contact Agent
              </button>
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
          {!agent.about && !agent.mission && !agent.bio &&
           (!agent.languages_spoken || agent.languages_spoken.length === 0) &&
           (!agent.certifications || agent.certifications.length === 0) &&
           (!agent.awards || agent.awards.length === 0) &&
           (!agent.areas_served || agent.areas_served.length === 0) ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No About Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This agent hasn't added their about information yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {agent.mission && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Mission
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
                    {agent.mission}
                  </p>
                </div>
              )}

              {agent.about && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    About
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {agent.about}
                  </p>
                </div>
              )}

              {agent.bio && !agent.about && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Biography
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {agent.bio}
                  </p>
                </div>
              )}

              {agent.languages_spoken && agent.languages_spoken.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Languages Spoken
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {agent.languages_spoken.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.certifications && agent.certifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Certifications
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {agent.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.awards && agent.awards.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Awards & Recognition
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {agent.awards.map((award, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium"
                      >
                        {award}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.areas_served && agent.areas_served.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Areas Served
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {agent.areas_served.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.agency_name && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Agency Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {agent.agency_name}
                        </p>
                      </div>
                    </div>
                    {agent.agency_phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                        <a
                          href={`tel:${agent.agency_phone}`}
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          {formatPhoneNumber(agent.agency_phone)}
                        </a>
                      </div>
                    )}
                    {agent.agency_email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                        <a
                          href={`mailto:${agent.agency_email}`}
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          {agent.agency_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setListingFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  listingFilter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({properties.length})
              </button>
              <button
                onClick={() => setListingFilter('buy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  listingFilter === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                For Sale ({properties.filter(p => p.property_category === 'buy').length})
              </button>
              <button
                onClick={() => setListingFilter('rent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  listingFilter === 'rent'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                For Rent ({properties.filter(p => p.property_category === 'rent').length})
              </button>
            </div>
          </div>
          {properties.filter(p => listingFilter === 'all' || p.property_category === listingFilter).length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No {listingFilter === 'all' ? 'Active' : listingFilter === 'buy' ? 'For Sale' : 'For Rent'} Listings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This agent doesn't have any {listingFilter === 'all' ? 'active' : listingFilter === 'buy' ? 'for sale' : 'for rent'} listings at the moment.
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3">
                {properties
                  .filter(p => listingFilter === 'all' || p.property_category === listingFilter)
                  .map(property => (
                    <PropertyRowCard key={property.id} property={property} />
                  ))}
              </div>
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties
                  .filter(p => listingFilter === 'all' || p.property_category === listingFilter)
                  .map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      <AgentContactDrawer
        isOpen={isContactDrawerOpen}
        onClose={() => setIsContactDrawerOpen(false)}
        agent={{
          id: agent.id,
          name: agent.full_name,
          phone: agent.phone || undefined,
          email: agent.email || undefined,
          whatsapp: agent.whatsapp || undefined,
        }}
      />
    </div>
  );
}
