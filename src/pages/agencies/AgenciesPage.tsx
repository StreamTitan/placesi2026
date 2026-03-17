import { useState, useEffect } from 'react';
import { Search, Filter, X, Building2, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import { PaginationDropdown } from '../../components/ui/PaginationDropdown';
import { formatPhoneNumber } from '../../lib/formatters';

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
  agent_count: number;
  listing_count: number;
}

export function AgenciesPage() {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadAgencies();
  }, []);

  useEffect(() => {
    filterAgencies();
    setCurrentPage(1);
  }, [agencies, searchQuery, verifiedOnly]);

  const loadAgencies = async () => {
    try {
      setLoading(true);

      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('*')
        .order('name');

      if (agenciesError) throw agenciesError;

      const { data: agentProfiles, error: agentError } = await supabase
        .from('agent_profiles')
        .select('agency_id, user_id');

      if (agentError) throw agentError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'agent');

      if (profilesError) throw profilesError;

      const agentIds = profiles?.map(p => p.id) || [];

      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('listed_by')
        .in('listed_by', agentIds);

      if (propertiesError) throw propertiesError;

      const agentCountByAgency = (agentProfiles || []).reduce((acc, ap) => {
        if (ap.agency_id) {
          acc[ap.agency_id] = (acc[ap.agency_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const agentsByAgency = (agentProfiles || []).reduce((acc, ap) => {
        if (ap.agency_id) {
          if (!acc[ap.agency_id]) acc[ap.agency_id] = [];
          acc[ap.agency_id].push(ap);
        }
        return acc;
      }, {} as Record<string, any[]>);

      const listingCountByAgency: Record<string, number> = {};
      Object.entries(agentsByAgency).forEach(([agencyId, agentsList]) => {
        const agentUserIds = agentsList.map(a => a.user_id);
        const count = (properties || []).filter(p => agentUserIds.includes(p.listed_by)).length;
        listingCountByAgency[agencyId] = count;
      });

      const enrichedAgencies: Agency[] = (agenciesData || []).map(agency => ({
        ...agency,
        agent_count: agentCountByAgency[agency.id] || 0,
        listing_count: listingCountByAgency[agency.id] || 0,
      }));

      setAgencies(enrichedAgencies);
      setFilteredAgencies(enrichedAgencies);
    } catch (error) {
      console.error('Error loading agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgencies = () => {
    let filtered = [...agencies];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        agency =>
          agency.name.toLowerCase().includes(query) ||
          agency.address?.toLowerCase().includes(query) ||
          agency.description?.toLowerCase().includes(query) ||
          agency.email.toLowerCase().includes(query)
      );
    }

    if (verifiedOnly) {
      filtered = filtered.filter(agency => agency.is_verified);
    }

    setFilteredAgencies(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setVerifiedOnly(false);
  };

  const hasActiveFilters = verifiedOnly;

  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-8 items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Real Estate Agencies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse verified agencies and their listings
          </p>
        </div>

        <div className="lg:w-[400px] flex-shrink-0">
          <AdBanner className="mb-0" />
        </div>
      </div>

      {!loading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAgencies.length === 0 ? 'No agencies found' :
             filteredAgencies.length === 1 ? 'Showing 1 agency' :
             `Showing ${filteredAgencies.length} agencies`}
          </p>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agencies by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                {[verifiedOnly].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Agencies
              </h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verified agencies only
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Building2 className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No agencies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgencies.map(agency => (
              <Card
                key={agency.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate(`/agencies/${agency.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {agency.logo_url ? (
                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-white p-2 border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={agency.logo_url}
                            alt={agency.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                          {agency.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {agency.name}
                        </h3>
                        {agency.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {agency.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{formatPhoneNumber(agency.phone)}</span>
                          </div>
                        )}
                        {agency.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{agency.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {agency.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {agency.description}
                    </p>
                  )}

                  {agency.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{agency.address}</span>
                    </p>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {agency.agent_count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agency.agent_count === 1 ? 'Agent' : 'Agents'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {agency.listing_count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agency.listing_count === 1 ? 'Listing' : 'Listings'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <PaginationDropdown
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAgencies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
