import { Link } from 'react-router-dom';
import { MapPin, Calendar, BadgeCheck } from 'lucide-react';
import { getCategoryName } from '../../lib/contractorCategories';

interface ContractorRowCardProps {
  contractor: {
    id: string;
    user_id: string;
    company_name: string;
    logo_url: string | null;
    description: string | null;
    primary_category: string;
    service_areas: string[] | null;
    years_in_business: number | null;
    subscription_status: string;
    active_specials_count?: number;
  };
}

export function ContractorRowCard({ contractor }: ContractorRowCardProps) {
  return (
    <Link to={`/contractor/${contractor.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 p-3">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            {contractor.logo_url ? (
              <img
                src={contractor.logo_url}
                alt={contractor.company_name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">
                  {contractor.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-1 left-1 bg-green-600/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {getCategoryName(contractor.primary_category).split(' ')[0]}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-2 mb-1">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 flex-1">
                  {contractor.company_name}
                </h3>
                {contractor.subscription_status === 'active' && (
                  <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="mb-1.5">
                <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-[10px] px-2 py-0.5 rounded">
                  {getCategoryName(contractor.primary_category)}
                </span>
              </div>

              {contractor.service_areas && contractor.service_areas.length > 0 && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-xs truncate">
                    {contractor.service_areas.slice(0, 2).join(', ')}
                    {contractor.service_areas.length > 2 && ` +${contractor.service_areas.length - 2}`}
                  </span>
                </div>
              )}

              {contractor.years_in_business && contractor.years_in_business > 0 && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-xs font-medium">{contractor.years_in_business} years</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
