import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  BadgeCheck,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AdBanner } from '../../components/ui/AdBanner';
import {
  getContractorById,
  getContractorListing,
  getActiveSpecials,
  trackContractorView,
  trackContractorClick
} from '../../services/contractorManagement';
import { getCategoryName } from '../../lib/contractorCategories';
import { ContractorContactDrawer } from '../../components/contractors/ContractorContactDrawer';
import type { ContractorWithProfile } from '../../services/contractorManagement';
import type { Database } from '../../lib/database.types';

type ContractorListing = Database['public']['Tables']['contractor_listings']['Row'];
type ContractorSpecial = Database['public']['Tables']['contractor_specials']['Row'];

const formatJobSize = (jobSize: string): string => {
  const jobSizeMap: Record<string, string> = {
    'under_5000': 'Under $5,000',
    '5000_15000': '$5,000 - $15,000',
    '15000_50000': '$15,000 - $50,000',
    'over_50000': 'Over $50,000'
  };
  return jobSizeMap[jobSize] || jobSize;
};

export function ContractorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<ContractorWithProfile | null>(null);
  const [listing, setListing] = useState<ContractorListing | null>(null);
  const [specials, setSpecials] = useState<ContractorSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceAreas, setShowServiceAreas] = useState(false);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadContractorData(id);
    }
  }, [id]);

  const loadContractorData = async (contractorId: string) => {
    setLoading(true);
    try {
      const [contractorData, listingData, specialsData] = await Promise.all([
        getContractorById(contractorId),
        getContractorListing(contractorId),
        getActiveSpecials(contractorId)
      ]);

      setContractor(contractorData);
      setListing(listingData);
      setSpecials(specialsData);

      if (contractorData) {
        await trackContractorView(contractorId);
      }
    } catch (error) {
      console.error('Error loading contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (type: 'call' | 'whatsapp' | 'email' | 'website' | 'social') => {
    if (id) {
      await trackContractorClick(id, type);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Contractor not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The contractor you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 pt-0 pb-8 md:py-8">
        <AdBanner className="h-[150px] mb-0" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 mt-3 mb-4 md:mt-6 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  {contractor.logo_url ? (
                    <img
                      src={contractor.logo_url}
                      alt={contractor.company_name}
                      className="w-48 h-48 object-contain bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-xl"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-white/90 dark:bg-gray-800/90 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-6xl font-bold text-gray-400 dark:text-gray-600">
                        {contractor.company_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {contractor.company_name}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm px-3 py-1 rounded-full font-medium">
                        {getCategoryName(contractor.primary_category)}
                      </span>
                      {contractor.subscription_status === 'active' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm px-3 py-1 rounded-full font-medium">
                          <BadgeCheck className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                      {contractor.subscription_status === 'trial' && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm px-3 py-1 rounded-full">
                          Trial Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {contractor.years_in_business && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{contractor.years_in_business} years</p>
                      </div>
                    </div>
                  )}
                  {contractor.employees_count && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{contractor.employees_count} employees</p>
                      </div>
                    </div>
                  )}
                  {contractor.average_job_size && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatJobSize(contractor.average_job_size)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Offers */}
            {specials.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  Special Offers
                </h2>
                <div className="space-y-4">
                  {specials.map((special) => (
                    <div
                      key={special.id}
                      className="border-2 border-yellow-200 dark:border-yellow-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {special.banner_image_url && (
                        <img
                          src={special.banner_image_url}
                          alt={special.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">
                          {special.title}
                        </h3>
                        {special.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{special.description}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Valid until {new Date(special.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {contractor.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Us</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                  {contractor.description}
                </p>
              </div>
            )}

            {/* Portfolio */}
            {listing && listing.portfolio_images && listing.portfolio_images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Work</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.portfolio_images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas - Collapsible */}
            {contractor.service_areas && contractor.service_areas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <button
                  onClick={() => setShowServiceAreas(!showServiceAreas)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Service Areas
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({contractor.service_areas.length} areas)
                    </span>
                  </h2>
                  {showServiceAreas ? (
                    <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                  )}
                </button>

                {showServiceAreas && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {contractor.service_areas.map((area) => (
                        <span
                          key={area}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1.5 rounded-lg"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {contractor.certifications && contractor.certifications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Certifications & Qualifications
                </h2>
                <ul className="space-y-3">
                  {contractor.certifications.map((cert, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <BadgeCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Operating Hours */}
            {contractor.operating_hours && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Operating Hours
                </h2>
                <div className="space-y-2">
                  {Object.entries(contractor.operating_hours as any).map(([day, info]: [string, any]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {day}
                      </span>
                      <span className={`${info.open ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'} font-medium`}>
                        {info.open ? `${info.start} - ${info.end}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {contractor.phone && (
                    <a
                      href={`tel:${contractor.phone}`}
                      onClick={() => handleContactClick('call')}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contractor.phone}</p>
                      </div>
                    </a>
                  )}
                  {(contractor.whatsapp || contractor.phone) && (
                    <a
                      href={`https://wa.me/${(contractor.whatsapp || contractor.phone)!.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleContactClick('whatsapp')}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contractor.whatsapp || contractor.phone}</p>
                      </div>
                    </a>
                  )}
                  {contractor.email && (
                    <a
                      href={`mailto:${contractor.email}`}
                      onClick={() => handleContactClick('email')}
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contractor.email}</p>
                      </div>
                    </a>
                  )}
                  {contractor.website_url && (
                    <a
                      href={contractor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleContactClick('website')}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-700 dark:bg-gray-600 rounded-full">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Visit Website</p>
                      </div>
                    </a>
                  )}
                  {contractor.address && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-600 dark:bg-gray-500 rounded-full flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{contractor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(contractor.facebook_url || contractor.instagram_url || contractor.linkedin_url) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="space-y-3">
                    {contractor.facebook_url && (
                      <a
                        href={contractor.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('social')}
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Facebook className="w-6 h-6" />
                        <span className="font-medium">Facebook</span>
                      </a>
                    )}
                    {contractor.instagram_url && (
                      <a
                        href={contractor.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('social')}
                        className="flex items-center gap-3 text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                      >
                        <Instagram className="w-6 h-6" />
                        <span className="font-medium">Instagram</span>
                      </a>
                    )}
                    {contractor.linkedin_url && (
                      <a
                        href={contractor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('social')}
                        className="flex items-center gap-3 text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Linkedin className="w-6 h-6" />
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contact Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <Button
          onClick={() => setIsContactDrawerOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg"
        >
          Contact Contractor
        </Button>
      </div>

      {/* Contact Drawer */}
      <ContractorContactDrawer
        isOpen={isContactDrawerOpen}
        onClose={() => setIsContactDrawerOpen(false)}
        contractor={{
          id: contractor.id,
          company_name: contractor.company_name,
          logo_url: contractor.logo_url,
          phone: contractor.phone || undefined,
          whatsapp: contractor.whatsapp || undefined,
          email: contractor.email || undefined,
          website_url: contractor.website_url || undefined,
        }}
      />
    </div>
  );
}
