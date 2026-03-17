import { Phone, Mail, Globe, MessageCircle, MapPin, Star, Briefcase, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryName } from '../../lib/contractorCategories';
import type { ContractorWithProfile } from '../../services/contractorManagement';

interface ContractorChatCardProps {
  contractor: ContractorWithProfile;
}

export function ContractorChatCard({ contractor }: ContractorChatCardProps) {
  const serviceAreasText = contractor.service_areas && contractor.service_areas.length > 0
    ? contractor.service_areas.slice(0, 3).join(', ')
    : 'All areas';

  const hasMoreAreas = contractor.service_areas && contractor.service_areas.length > 3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {contractor.logo_url ? (
            <img
              src={contractor.logo_url}
              alt={contractor.company_name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
              {contractor.company_name}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
              {getCategoryName(contractor.primary_category)}
            </p>
            {contractor.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {contractor.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {contractor.service_areas && contractor.service_areas.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {serviceAreasText}
                {hasMoreAreas && ` +${contractor.service_areas.length - 3} more`}
              </span>
            </div>
          )}

          {contractor.years_in_business && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 flex-shrink-0" />
              <span>{contractor.years_in_business} years in business</span>
            </div>
          )}

          {contractor.view_count !== undefined && contractor.view_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>{contractor.view_count} profile views</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
          )}

          {contractor.whatsapp && (
            <a
              href={`https://wa.me/${contractor.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}

          {contractor.email && (
            <a
              href={`mailto:${contractor.email}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
          )}

          {contractor.website_url && (
            <a
              href={contractor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
        </div>

        <Link
          to={`/contractor/${contractor.id}`}
          className="block w-full py-2 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
}
