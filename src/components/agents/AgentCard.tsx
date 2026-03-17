import { MapPin, Star, Building2, Phone, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { formatPhoneNumber } from '../../lib/formatters';
import { trackContactRequest } from '../../services/contactTracking';

interface AgentCardProps {
  agent: {
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
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agents/${agent.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {agent.full_name}
                </h3>
                {agent.agency_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{agent.agency_name}</span>
                  </div>
                )}
              </div>
            </div>

            {agent.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {agent.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mb-3">
              {agent.years_experience !== null && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{agent.years_experience}</span> years exp.
                </div>
              )}
              {agent.listing_count > 0 && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{agent.listing_count}</span> listings
                </div>
              )}
            </div>

            {agent.specializations && agent.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {agent.specializations.slice(0, 3).map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
                {agent.specializations.length > 3 && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full">
                    +{agent.specializations.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackContactRequest({
                      agentId: agent.id,
                      agentName: agent.full_name,
                      contactMethod: 'phone',
                    });
                  }}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{formatPhoneNumber(agent.phone)}</span>
                </a>
              )}
              {agent.whatsapp && (
                <a
                  href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackContactRequest({
                      agentId: agent.id,
                      agentName: agent.full_name,
                      contactMethod: 'whatsapp',
                    });
                  }}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formatPhoneNumber(agent.whatsapp)}</span>
                </a>
              )}
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackContactRequest({
                      agentId: agent.id,
                      agentName: agent.full_name,
                      contactMethod: 'email',
                    });
                  }}
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
