import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ContractorCard } from '../../components/contractors/ContractorCard';
import { ContractorRowCard } from '../../components/contractors/ContractorRowCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import { PaginationDropdown } from '../../components/ui/PaginationDropdown';
import { searchContractors } from '../../services/contractorManagement';
import { CONTRACTOR_CATEGORIES } from '../../lib/contractorCategories';
import { getAllAreas, REGIONS, getAreasForRegion } from '../../lib/locations';
import type { ContractorWithProfile } from '../../services/contractorManagement';

type SortOption = 'newest' | 'most_viewed' | 'alphabetical' | 'years_experience';

const ITEMS_PER_PAGE = 20;

export function ContractorsDirectoryPage() {
  const [contractors, setContractors] = useState<ContractorWithProfile[]>([]);
  const [allContractors, setAllContractors] = useState<ContractorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
    loadContractors();
  }, [selectedCategory, selectedArea, selectedRegion, sortBy]);

  useEffect(() => {
    paginateContractors();
  }, [currentPage, allContractors]);

  const loadContractors = async () => {
    setLoading(true);
    try {
      const results = await searchContractors({
        category: selectedCategory || undefined,
        serviceArea: selectedArea || undefined,
        searchQuery: searchQuery || undefined
      });

      let filteredResults = results;
      if (selectedRegion) {
        const regionAreas = getAreasForRegion(selectedRegion);
        filteredResults = results.filter(contractor =>
          contractor.service_areas?.some(area => regionAreas.includes(area))
        );
      }

      const sortedResults = sortContractors(filteredResults, sortBy);
      setAllContractors(sortedResults);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const paginateContractors = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setContractors(allContractors.slice(startIndex, endIndex));
  };

  const sortContractors = (contractors: ContractorWithProfile[], sortOption: SortOption) => {
    const sorted = [...contractors];

    switch (sortOption) {
      case 'alphabetical':
      default:
        return sorted.sort((a, b) => a.company_name.localeCompare(b.company_name));
      case 'years_experience':
        return sorted.sort((a, b) => (b.years_in_business || 0) - (a.years_in_business || 0));
      case 'most_viewed':
        return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      case 'newest':
        return sorted.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await loadContractors();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedArea('');
    setSelectedRegion('');
    setSearchQuery('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalPages = Math.ceil(allContractors.length / ITEMS_PER_PAGE);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedArea('');
  };

  const hasActiveFilters = selectedCategory || selectedArea || selectedRegion || searchQuery;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:hidden mb-6">
          <AdBanner className="mb-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-8 items-start">
          <div>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Find Professional Contractors
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with verified service providers across Trinidad & Tobago
              </p>
            </div>
          </div>

          <div className="hidden lg:block lg:w-[400px] flex-shrink-0">
            <AdBanner className="mb-0" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 lg:p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1 lg:flex-none">
                  <Search className="w-5 h-5 lg:mr-2" />
                  <span className="lg:inline">Search</span>
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:w-auto">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {CONTRACTOR_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Region
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Regions</option>
                      {REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specific Area
                    </label>
                    <select
                      value={selectedArea}
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        setSelectedRegion('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Areas</option>
                      {getAllAreas().map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contractors...</p>
          </div>
        ) : contractors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No contractors found matching your criteria.</p>
          </div>
        ) : (
          <div ref={resultsRef}>
            <PaginationDropdown
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={allContractors.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              loading={loading}
            />
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {contractors.length} contractor{contractors.length !== 1 ? 's' : ''}
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="alphabetical">Alphabetical A-Z</option>
                  <option value="years_experience">Most Experienced</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="hidden lg:grid lg:grid-cols-2 gap-6 mb-8">
              {contractors.map((contractor) => (
                <ContractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
            <div className="lg:hidden space-y-3 mb-8">
              {contractors.map((contractor) => (
                <ContractorRowCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
            <PaginationDropdown
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={allContractors.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
