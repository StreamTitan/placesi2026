import { Building2, MapPin, Users, Home, Award, Heart, Phone, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';

interface AgencyCardProps {
  agency: {
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
  };
  showFavoriteButton?: boolean;
  onFavoriteChange?: () => void;
}

export function AgencyCard({ agency, showFavoriteButton = false, onFavoriteChange }: AgencyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => {
    loadAgencyStats();
    if (user && showFavoriteButton) {
      checkFavoriteStatus();
    }
  }, [agency.id, user, showFavoriteButton]);

  const loadAgencyStats = async () => {
    try {
      const { count: agents } = await supabase
        .from('agent_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agency.id);

      setAgentCount(agents || 0);

      const { data: agentProfiles } = await supabase
        .from('agent_profiles')
        .select('user_id')
        .eq('agency_id', agency.id);

      const agentIds = agentProfiles?.map(ap => ap.user_id) || [];

      if (agentIds.length > 0) {
        const { count: listings } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .in('listed_by', agentIds)
          .eq('status', 'active');

        setListingCount(listings || 0);
      }
    } catch (error) {
      console.error('Error loading agency stats:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('agency_favorites')
        .select('agency_id')
        .eq('user_id', user.id)
        .eq('agency_id', agency.id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('agency_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('agency_id', agency.id);

        if (error) throw error;
        setIsFavorite(false);
        if (onFavoriteChange) onFavoriteChange();
      } else {
        const { error } = await supabase
          .from('agency_favorites')
          .insert({ user_id: user.id, agency_id: agency.id });

        if (error) throw error;
        setIsFavorite(true);
        if (onFavoriteChange) onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleClick = () => {
    navigate(`/agencies/${agency.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
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
            {agency.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Award className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {agency.name}
                </h3>
                {agency.registration_number && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Reg: {agency.registration_number}
                  </p>
                )}
              </div>
              {showFavoriteButton && (
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="ml-2 flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                </button>
              )}
            </div>

            {agency.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {agency.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4 text-green-600" />
                <span className="font-semibold">{agentCount}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {agentCount === 1 ? 'agent' : 'agents'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <Home className="w-4 h-4 text-green-600" />
                <span className="font-semibold">{listingCount}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {listingCount === 1 ? 'listing' : 'listings'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              {agency.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <a
                    href={`tel:${agency.phone}`}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {agency.phone}
                  </a>
                </div>
              )}
              {agency.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <a
                    href={`mailto:${agency.email}`}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {agency.email}
                  </a>
                </div>
              )}
              {agency.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${agency.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
