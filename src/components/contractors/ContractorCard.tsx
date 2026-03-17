import { MapPin, Calendar, BadgeCheck, Users, Briefcase, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryName } from '../../lib/contractorCategories';

const formatJobSize = (jobSize: string): string => {
  const jobSizeMap: Record<string, string> = {
    'under_5000': 'Under $5K',
    '5000_15000': '$5K - $15K',
    '15000_50000': '$15K - $50K',
    'over_50000': 'Over $50K'
  };
  return jobSizeMap[jobSize] || jobSize;
};

interface ContractorCardProps {
  contractor: {
    id: string;
    user_id: string;
    company_name: string;
    logo_url: string | null;
    description: string | null;
    primary_category: string;
    service_areas: string[] | null;
    years_in_business: number | null;
    employees_count: number | null;
    average_job_size: string | null;
    subscription_status: string;
    active_specials_count?: number;
    total_views?: number;
  };
}

export function ContractorCard({ contractor }: ContractorCardProps) {
  return (
    <Link to={`/contractor/${contractor.id}`} className="block h-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 flex h-full">
        <div className="relative w-48 h-full flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {contractor.logo_url ? (
            <img
              src={contractor.logo_url}
              alt={contractor.company_name}
              className="w-full h-full object-contain p-6 transform hover:scale-110 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-300 dark:text-gray-600">
                {contractor.company_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {contractor.active_specials_count != null && contractor.active_specials_count > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg">
              <Star className="w-3 h-3 fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white flex-1 line-clamp-2 leading-tight">
                {contractor.company_name}
              </h3>
              {contractor.subscription_status === 'active' && (
                <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            <div className="mb-2">
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-1 rounded">
                {getCategoryName(contractor.primary_category)}
              </span>
            </div>

            {contractor.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {contractor.description}
              </p>
            )}

            {contractor.service_areas && contractor.service_areas.length > 0 && (
              <div className="flex items-start text-gray-600 dark:text-gray-400 gap-2 mb-1.5">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-xs line-clamp-1">
                  {contractor.service_areas.slice(0, 3).join(', ')}
                  {contractor.service_areas.length > 3 && ` +${contractor.service_areas.length - 3} more`}
                </span>
              </div>
            )}

            <div className="flex items-center text-gray-600 dark:text-gray-400 flex-wrap gap-3 mb-2">
              {contractor.years_in_business && contractor.years_in_business > 0 && (
                <div className="flex items-center">
                  <Calendar className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">{contractor.years_in_business} years</span>
                </div>
              )}
              {contractor.employees_count && contractor.employees_count > 0 && (
                <div className="flex items-center">
                  <Users className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">{contractor.employees_count} employees</span>
                </div>
              )}
              {contractor.average_job_size && (
                <div className="flex items-center">
                  <Briefcase className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">{formatJobSize(contractor.average_job_size)}</span>
                </div>
              )}
              {contractor.total_views !== undefined && contractor.total_views > 0 && (
                <div className="flex items-center">
                  <Eye className="mr-1 flex-shrink-0 w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">{contractor.total_views} views</span>
                </div>
              )}
            </div>

            {contractor.active_specials_count != null && contractor.active_specials_count > 0 && (
              <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    {contractor.active_specials_count} Special Offer{contractor.active_specials_count > 1 ? 's' : ''} Available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
