import { Link } from 'react-router-dom';
import { Building2, Calendar, Home, Award } from 'lucide-react';

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

interface AgentRowCardProps {
  agent: Agent;
}

export function AgentRowCard({ agent }: AgentRowCardProps) {
  return (
    <Link to={`/agents/${agent.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 p-3">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
            {agent.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                {agent.full_name.charAt(0)}
              </div>
            )}
            {agent.is_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                <Award className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                {agent.full_name}
              </h3>

              {agent.agency_name && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-xs truncate">{agent.agency_name}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700 dark:text-gray-300 gap-3 mb-1">
                {agent.years_experience !== null && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="text-xs font-medium">{agent.years_experience} yrs</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Home className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-xs font-medium">{agent.listing_count} listings</span>
                </div>
              </div>
            </div>

            {agent.specializations && agent.specializations.length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {agent.specializations.slice(0, 2).map((spec, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-medium"
                  >
                    {spec}
                  </span>
                ))}
                {agent.specializations.length > 2 && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    +{agent.specializations.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
