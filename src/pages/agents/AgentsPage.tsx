import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentRowCard } from '../../components/agents/AgentRowCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import { PaginationDropdown } from '../../components/ui/PaginationDropdown';

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

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [agencies, setAgencies] = useState<Array<{ id: string; name: string }>>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadAgents();
    loadAgencies();
  }, []);

  useEffect(() => {
    filterAgents();
    setCurrentPage(1);
  }, [agents, searchQuery, selectedSpecialization, selectedAgency, minExperience, verifiedOnly]);

  const loadAgents = async () => {
    try {
      setLoading(true);

      const { data: agentProfiles, error: agentError } = await supabase
        .from('agent_profiles')
        .select(`
          user_id,
          agency_id,
          bio,
          years_experience,
          specializations,
          is_verified,
          email,
          whatsapp
        `);

      if (agentError) throw agentError;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, role')
        .eq('role', 'agent');

      if (profileError) throw profileError;

      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, name, logo_url');

      if (agenciesError) throw agenciesError;

      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('listed_by')
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      const listingCounts = properties.reduce((acc, prop) => {
        acc[prop.listed_by] = (acc[prop.listed_by] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const agentsMap = new Map(agentProfiles?.map(ap => [ap.user_id, ap]) || []);
      const agenciesMap = new Map(agenciesData?.map(a => [a.id, a]) || []);

      const combinedAgents: Agent[] = (profiles || []).map(profile => {
        const agentProfile = agentsMap.get(profile.id);
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

      const allSpecs = new Set<string>();
      combinedAgents.forEach(agent => {
        agent.specializations?.forEach(spec => allSpecs.add(spec));
      });
      setSpecializations(Array.from(allSpecs).sort());

      // Sort agents by listing count (descending), then alphabetically by name
      const sortedAgents = combinedAgents.sort((a, b) => {
        if (b.listing_count !== a.listing_count) {
          return b.listing_count - a.listing_count;
        }
        return a.full_name.localeCompare(b.full_name);
      });

      setAgents(sortedAgents);
      setFilteredAgents(sortedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        agent =>
          agent.full_name.toLowerCase().includes(query) ||
          agent.agency_name?.toLowerCase().includes(query) ||
          agent.bio?.toLowerCase().includes(query) ||
          agent.specializations?.some(spec => spec.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(agent =>
        agent.specializations?.includes(selectedSpecialization)
      );
    }

    if (selectedAgency) {
      filtered = filtered.filter(agent =>
        agent.agency_name === agencies.find(a => a.id === selectedAgency)?.name
      );
    }

    if (minExperience) {
      const minExp = parseInt(minExperience);
      filtered = filtered.filter(agent =>
        agent.years_experience !== null && agent.years_experience >= minExp
      );
    }

    if (verifiedOnly) {
      filtered = filtered.filter(agent => agent.is_verified);
    }

    setFilteredAgents(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedAgency('');
    setMinExperience('');
    setVerifiedOnly(false);
  };

  const hasActiveFilters = selectedSpecialization || selectedAgency || minExperience || verifiedOnly;

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-8 items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Perfect Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with experienced real estate professionals
          </p>
        </div>

        <div className="lg:w-[400px] flex-shrink-0">
          <AdBanner className="mb-0" />
        </div>
      </div>

      {!loading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAgents.length === 0 ? 'No agents found' :
             filteredAgents.length === 1 ? 'Showing 1 agent' :
             `Showing ${filteredAgents.length} agents`}
          </p>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Agent Name..."
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
                {[selectedSpecialization, selectedAgency, minExperience, verifiedOnly].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Agents
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialization
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agency
                </label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Agencies</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min. Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
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
                  Verified agents only
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
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No agents found
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
          <div className="md:hidden space-y-3">
            {paginatedAgents.map(agent => (
              <AgentRowCard key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          <PaginationDropdown
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAgents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
