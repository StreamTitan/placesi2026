import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import { PaginationDropdown } from '../../components/ui/PaginationDropdown';
import { FilterSidebar, type FilterOptions } from '../../components/home/FilterSidebar';
import type { Database } from '../../lib/database.types';
import { type PropertyCategory } from '../../lib/propertyTypes';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyWithFavorites = Property & { favorites_count?: number };
type SortOption = 'newest' | 'most_viewed' | 'most_liked' | 'oldest';

const ITEMS_PER_PAGE = 20;

export function SearchPage() {
  const [properties, setProperties] = useState<PropertyWithFavorites[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    propertyCategory: 'buy',
    propertyGeneralType: '',
    propertyStyle: '',
    city: '',
    region: '',
    area: '',
    areas: [],
    listingType: '',
    features: [],
  });

  useEffect(() => {
    setCurrentPage(1);
    loadProperties();
  }, [filters.propertyCategory, sortBy]);

  useEffect(() => {
    loadProperties();
  }, [currentPage]);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      // Get total count
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('property_category', filters.propertyCategory || 'buy');

      setTotalCount(count || 0);

      let query;
      if (sortBy === 'most_liked') {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            favorites_count:favorites(count)
          `)
          .eq('status', 'active')
          .eq('property_category', filters.propertyCategory || 'buy')
          .range(startIndex, endIndex);

        if (error) throw error;

        const propertiesWithCounts = (data || []).map(prop => ({
          ...prop,
          favorites_count: prop.favorites_count?.[0]?.count || 0
        }));

        propertiesWithCounts.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        setProperties(propertiesWithCounts);
      } else {
        query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .eq('property_category', filters.propertyCategory || 'buy');

        switch (sortBy) {
          case 'most_viewed':
            query = query.order('view_count', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        query = query.range(startIndex, endIndex);
        const { data, error } = await query;

        if (error) throw error;
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);

      const startIndex = 0;
      const endIndex = ITEMS_PER_PAGE - 1;

      let countQuery = supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('property_category', filters.propertyCategory || 'buy');

      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('property_category', filters.propertyCategory || 'buy');

      if (searchTerm) {
        const searchCondition = `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`;
        query = query.or(searchCondition);
        countQuery = countQuery.or(searchCondition);
      }

      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
        countQuery = countQuery.gte('price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
        countQuery = countQuery.lte('price', parseFloat(filters.maxPrice));
      }

      if (filters.bedrooms) {
        query = query.eq('bedrooms', parseInt(filters.bedrooms));
        countQuery = countQuery.eq('bedrooms', parseInt(filters.bedrooms));
      }

      if (filters.bathrooms) {
        query = query.gte('bathrooms', parseFloat(filters.bathrooms));
        countQuery = countQuery.gte('bathrooms', parseFloat(filters.bathrooms));
      }

      if (filters.propertyGeneralType) {
        query = query.eq('property_general_type', filters.propertyGeneralType);
        countQuery = countQuery.eq('property_general_type', filters.propertyGeneralType);
      }

      if (filters.propertyStyle) {
        query = query.eq('property_style', filters.propertyStyle);
        countQuery = countQuery.eq('property_style', filters.propertyStyle);
      }

      if (filters.propertyType) {
        query = query.ilike('property_type', `%${filters.propertyType}%`);
        countQuery = countQuery.ilike('property_type', `%${filters.propertyType}%`);
      }

      if (filters.region) {
        query = query.ilike('region', `%${filters.region}%`);
        countQuery = countQuery.ilike('region', `%${filters.region}%`);
      }

      if (filters.areas && filters.areas.length > 0) {
        const areaConditions = filters.areas.map(area => `city.ilike.%${area}%`).join(',');
        query = query.or(areaConditions);
        countQuery = countQuery.or(areaConditions);
      } else if (filters.area) {
        query = query.ilike('city', `%${filters.area}%`);
        countQuery = countQuery.ilike('city', `%${filters.area}%`);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
        countQuery = countQuery.ilike('city', `%${filters.city}%`);
      }

      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
        countQuery = countQuery.eq('listing_type', filters.listingType);
      }

      if (filters.features && filters.features.length > 0) {
        query = query.contains('features', filters.features);
        countQuery = countQuery.contains('features', filters.features);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      let finalQuery;
      if (sortBy === 'most_liked') {
        const { data, error } = await query.range(startIndex, endIndex);
        if (error) throw error;

        const propertyIds = data?.map(p => p.id) || [];
        if (propertyIds.length === 0) {
          setProperties([]);
          return;
        }

        const { data: withCounts, error: countError } = await supabase
          .from('properties')
          .select(`
            *,
            favorites_count:favorites(count)
          `)
          .in('id', propertyIds);

        if (countError) throw countError;

        const propertiesWithCounts = (withCounts || []).map(prop => ({
          ...prop,
          favorites_count: prop.favorites_count?.[0]?.count || 0
        }));

        propertiesWithCounts.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        setProperties(propertiesWithCounts);
      } else {
        switch (sortBy) {
          case 'most_viewed':
            finalQuery = query.order('view_count', { ascending: false });
            break;
          case 'oldest':
            finalQuery = query.order('created_at', { ascending: true });
            break;
          case 'newest':
          default:
            finalQuery = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error } = await finalQuery.range(startIndex, endIndex);
        if (error) throw error;
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      propertyCategory: 'buy',
      propertyGeneralType: '',
      propertyStyle: '',
      city: '',
      region: '',
      area: '',
      areas: [],
      listingType: '',
      features: [],
    });
    loadProperties();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);


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
              Search Properties
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find your perfect property in Trinidad & Tobago
            </p>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border-2 border-gray-200 dark:border-gray-700 relative">
              <div
                className={`absolute top-1.5 h-[calc(100%-12px)] bg-gray-900 dark:bg-green-600 rounded-full transition-all duration-300 ease-out shadow-md ${
                  filters.propertyCategory === 'buy' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setFilters({ ...filters, propertyCategory: 'buy' })}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  filters.propertyCategory === 'buy'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, propertyCategory: 'rent' })}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  filters.propertyCategory === 'rent'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                For Rent
              </button>
            </div>
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
                placeholder="Search by location, property type, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 lg:flex-none">
                <Search className="w-5 h-5 lg:mr-2" />
                <span className="lg:inline">Search</span>
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(true)} className="lg:w-auto">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={setFilters}
        onApply={() => {
          handleSearch();
          setShowFilters(false);
        }}
        onReset={() => {
          handleReset();
          setShowFilters(false);
        }}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div ref={resultsRef}>
          <PaginationDropdown
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
          />
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {properties.length} properties
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="most_liked">Most Liked</option>
                <option value="oldest">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="hidden lg:grid lg:grid-cols-2 gap-6 mb-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="lg:hidden space-y-3 mb-8">
            {properties.map((property) => (
              <PropertyRowCard key={property.id} property={property} />
            ))}
          </div>
          <PaginationDropdown
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
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
