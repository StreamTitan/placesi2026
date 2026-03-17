import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Building2, TrendingUp, Shield, Zap, Sparkles, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FilterSidebar, type FilterOptions } from '../../components/home/FilterSidebar';
import { MembersOnlyModal } from '../../components/ui/MembersOnlyModal';
import { useAuth } from '../../contexts/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [membersOnlyModalOpen, setMembersOnlyModalOpen] = useState(false);
  const [listingType, setListingType] = useState<'sale' | 'rent'>('rent');
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    propertyCategory: 'rent',
    city: '',
    region: '',
    area: '',
    listingType: 'rent',
    features: [],
    isNegotiable: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMembersOnlyModalOpen(true);
      return;
    }
    const updatedFilters = { ...filters, listingType };
    if (searchQuery.trim()) {
      navigate('/chat', { state: { initialQuery: searchQuery, filters: updatedFilters } });
    } else {
      navigate('/chat', { state: { filters: updatedFilters } });
    }
  };

  const handleApplyFilters = () => {
    if (!user) {
      setMembersOnlyModalOpen(true);
      return;
    }
    const updatedFilters = { ...filters, listingType };
    if (searchQuery.trim() || Object.values(updatedFilters).some(v => v)) {
      navigate('/chat', { state: { initialQuery: searchQuery, filters: updatedFilters } });
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!user) {
      e.preventDefault();
      e.target.blur();
      setMembersOnlyModalOpen(true);
    }
  };

  const handleFilterOpen = () => {
    if (!user) {
      setMembersOnlyModalOpen(true);
      return;
    }
    setFilterOpen(true);
  };

  const handleResetFilters = () => {
    setListingType('rent');
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      propertyCategory: 'rent',
      city: '',
      region: '',
      area: '',
      listingType: 'rent',
      features: [],
      isNegotiable: false
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2070&auto=format&fit=crop"
            alt="Trinidad and Tobago coastline"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 sm:py-16 md:py-20">

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            What will you <span className="text-green-600 dark:text-green-500">find</span> today?
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 md:mb-14 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Discover your dream property by chatting with AI.
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 sm:p-1.5 shadow-lg border-2 border-gray-200 dark:border-gray-700 relative">
                <div
                  className={`absolute top-1 sm:top-1.5 h-[calc(100%-8px)] sm:h-[calc(100%-12px)] bg-gray-900 dark:bg-green-600 rounded-full transition-all duration-300 ease-out shadow-md ${
                    listingType === 'sale' ? 'left-1 sm:left-1.5 w-[calc(50%-4px)] sm:w-[calc(50%-6px)]' : 'left-[calc(50%+2px)] sm:left-[calc(50%+3px)] w-[calc(50%-4px)] sm:w-[calc(50%-6px)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setListingType('sale');
                    setFilters({ ...filters, listingType: 'sale', propertyCategory: 'buy' });
                  }}
                  className={`relative z-10 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                    listingType === 'sale'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setListingType('rent');
                    setFilters({ ...filters, listingType: 'rent', propertyCategory: 'rent' });
                  }}
                  className={`relative z-10 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                    listingType === 'rent'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-1 sm:p-1.5 transition-all hover:shadow-green-500/20 hover:border-green-300 dark:hover:border-green-600">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-h-[40px]">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-[2px]" />
                  <textarea
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={handleInputFocus}
                    placeholder="Describe your dream property..."
                    rows={1}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm sm:text-base font-medium resize-none overflow-hidden min-h-[24px] max-h-[200px]"
                    style={{ height: 'auto' }}
                  />
                </div>
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <button
                    type="button"
                    onClick={handleFilterOpen}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 whitespace-nowrap"
                  >
                    <span className="hidden xs:inline">Search now</span>
                    <span className="xs:hidden">Search</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">
            Find listings from Trinidad and Tobago with natural language
          </div>
        </div>
      </div>

      <FilterSidebar
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <MembersOnlyModal
        isOpen={membersOnlyModalOpen}
        onClose={() => setMembersOnlyModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-3xl mb-10 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 leading-tight tracking-tight">
            Why Choose Placesi?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Experience the future of Caribbean real estate with intelligent property search and seamless transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  AI-Powered Search
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Chat naturally to find properties. Our AI understands your needs and preferences, delivering personalized results instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  Verified Listings
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  All properties listed by verified agents and agencies. List unlimited properties completely free.
                </p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  Mortgage Integration
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get pre-approved directly on the platform. Streamlined application process with real-time decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  Secure & Trusted
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your data is protected with enterprise-grade security. Verified agents and secure document handling.
                </p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  Fast & Simple
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Find properties in seconds. Contact agents instantly. Complete mortgage applications in minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 tracking-tight">
                  Market Insights
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Access real-time market data and comprehensive analytics. Make informed investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 text-white overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight tracking-tight">
              Are you a Real Estate Agent?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-gray-300 max-w-2xl leading-relaxed font-light">
              List unlimited properties for free. Connect with qualified buyers. Grow your business with AI-powered tools.
            </p>
            <Link to="/signup?role=agent">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all font-bold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg rounded-full w-full sm:w-auto">
                Register as an Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
