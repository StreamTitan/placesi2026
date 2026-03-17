import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getContactStats, getAgencyContactStats, type ContactStats } from '../../services/contactTracking';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Phone, Mail, MessageCircle, TrendingUp, User, ArrowLeft, Home, ExternalLink, Search, Calendar, X, Download, Filter } from 'lucide-react';
import { exportContactRequestsToPDF } from '../../utils/pdfExport';

interface ContactRequest {
  id: string;
  contact_method: string;
  created_at: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  agent_name: string | null;
  is_registered: boolean;
  listing_title: string | null;
  listing_id: string | null;
}

export function ContactRequestsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    byPhone: 0,
    byWhatsApp: 0,
    byEmail: 0,
  });
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const role = profile.role === 'agent' ? 'agent' : 'agency';
      loadContactRequests(profile.id, role, searchQuery, startDate, endDate);
    }
  }, [searchQuery, startDate, endDate]);

  useEffect(() => {
    handleDatePresetChange(datePreset);
  }, [datePreset]);

  const handleDatePresetChange = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        setStartDate(last7.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        setStartDate(last30.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'all':
        setStartDate('');
        setEndDate('');
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
    setFilter('all');
  };

  const loadData = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      let contactStats: ContactStats;
      if (profile.role === 'agent') {
        contactStats = await getContactStats(profile.id);
        await loadContactRequests(profile.id, 'agent', searchQuery, startDate, endDate);
      } else if (profile.role === 'agency') {
        contactStats = await getAgencyContactStats(profile.id);
        await loadContactRequests(profile.id, 'agency', searchQuery, startDate, endDate);
      } else {
        contactStats = { total: 0, byPhone: 0, byWhatsApp: 0, byEmail: 0 };
      }

      setStats(contactStats);
    } catch (error) {
      console.error('Error loading contact stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContactRequests = async (
    userId: string,
    role: string,
    search: string = '',
    dateStart: string = '',
    dateEnd: string = ''
  ) => {
    try {
      let agentIdsToQuery: string[] = [];

      if (role === 'agent') {
        agentIdsToQuery = [userId];
      } else if (role === 'agency') {
        const { data: agency, error: agencyError } = await supabase
          .from('agencies')
          .select('id')
          .eq('created_by', userId)
          .maybeSingle();

        if (agencyError) {
          console.error('Error fetching agency:', agencyError);
          return;
        }

        if (agency) {
          const { data: agentProfiles, error: agentError } = await supabase
            .from('agent_profiles')
            .select('user_id')
            .eq('agency_id', agency.id);

          if (agentError) {
            console.error('Error fetching agent profiles:', agentError);
            return;
          }

          agentIdsToQuery = agentProfiles?.map(ap => ap.user_id) || [];
        }
      }

      if (agentIdsToQuery.length === 0) {
        setContactRequests([]);
        return;
      }

      let query = supabase
        .from('contact_requests')
        .select(`
          id,
          contact_method,
          created_at,
          is_registered,
          agent_name,
          visitor_id,
          visitor_name,
          visitor_phone,
          visitor_email,
          listing_id
        `)
        .in('agent_id', agentIdsToQuery);

      if (dateStart) {
        const startDateTime = new Date(dateStart);
        startDateTime.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startDateTime.toISOString());
      }

      if (dateEnd) {
        const endDateTime = new Date(dateEnd);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      query = query.order('created_at', { ascending: false }).limit(1000);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contact requests:', error);
        throw error;
      }

      const visitorIds = [...new Set(data?.filter(r => r.visitor_id).map(r => r.visitor_id) || [])];
      const listingIds = [...new Set(data?.filter(r => r.listing_id).map(r => r.listing_id) || [])];

      let visitorsMap = new Map();
      let listingsMap = new Map();

      if (visitorIds.length > 0) {
        const { data: visitors, error: visitorsError } = await supabase
          .from('user_contacts')
          .select('id, full_name, phone, email')
          .in('id', visitorIds);

        if (visitorsError) {
          console.error('Error fetching visitors:', visitorsError);
        }

        visitors?.forEach(v => visitorsMap.set(v.id, v));
      }

      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', listingIds);

        listings?.forEach(l => listingsMap.set(l.id, l));
      }

      let formattedRequests: ContactRequest[] = (data || []).map((req: any) => {
        const visitor = req.visitor_id ? visitorsMap.get(req.visitor_id) : null;
        const listing = req.listing_id ? listingsMap.get(req.listing_id) : null;

        return {
          id: req.id,
          contact_method: req.contact_method,
          created_at: req.created_at,
          is_registered: req.is_registered,
          visitor_name: visitor?.full_name || req.visitor_name || null,
          visitor_phone: visitor?.phone || req.visitor_phone || null,
          visitor_email: visitor?.email || req.visitor_email || null,
          agent_name: req.agent_name || null,
          listing_title: listing?.title || null,
          listing_id: req.listing_id || null,
        };
      });

      if (search) {
        const searchLower = search.toLowerCase();
        formattedRequests = formattedRequests.filter(req => {
          const visitorMatch = req.visitor_name?.toLowerCase().includes(searchLower);
          const propertyMatch = req.listing_title?.toLowerCase().includes(searchLower);
          return visitorMatch || propertyMatch;
        });
      }

      setContactRequests(formattedRequests);
    } catch (error) {
      console.error('Error loading contact requests:', error);
    }
  };

  const filteredRequests = useMemo(() => {
    return contactRequests.filter(req => {
      if (filter === 'registered') return req.is_registered;
      if (filter === 'unregistered') return !req.is_registered;
      return true;
    });
  }, [contactRequests, filter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (startDate || endDate) count++;
    if (filter !== 'all') count++;
    return count;
  }, [searchQuery, startDate, endDate, filter]);

  const handleExportPDF = async () => {
    if (filteredRequests.length === 0) return;

    setExportingPDF(true);
    try {
      await exportContactRequestsToPDF({
        contactRequests: filteredRequests,
        stats,
        userRole: profile?.role || 'agent',
        searchQuery: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        registrationFilter: filter,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Contact Requests',
      value: stats.total,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'by Phone',
      value: stats.byPhone,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'by WhatsApp',
      value: stats.byWhatsApp,
      icon: MessageCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'by Email',
      value: stats.byEmail,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contact Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track how potential clients are reaching out to you
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by visitor or property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 items-center">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {datePreset === 'custom' && (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'registered' | 'unregistered')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Users</option>
                  <option value="registered">Registered</option>
                  <option value="unregistered">Unregistered</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="whitespace-nowrap"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear ({activeFilterCount})
                </Button>
              )}

              <Button
                onClick={handleExportPDF}
                disabled={filteredRequests.length === 0 || exportingPDF}
                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
              >
                {exportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {(searchQuery || startDate || endDate) && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredRequests.length} of {contactRequests.length} contact requests
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Contact Requests
            </h2>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                {activeFilterCount > 0
                  ? 'No contact requests match your filters'
                  : 'No contact requests yet'}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Visitor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact Info
                    </th>
                    {profile?.role === 'agency' && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Agent
                      </th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Property
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const methodIcons = {
                      phone: <Phone className="w-4 h-4" />,
                      whatsapp: <MessageCircle className="w-4 h-4" />,
                      email: <Mail className="w-4 h-4" />,
                    };

                    const methodColors = {
                      phone: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                      whatsapp: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                      email: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                    };

                    return (
                      <tr
                        key={request.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(request.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(request.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {request.is_registered && request.visitor_name ? (
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.visitor_name}
                              </div>
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                Registered
                              </span>
                            </div>
                          ) : request.visitor_name ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.visitor_name}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900 dark:text-white">
                                Unregistered User
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                Anonymous
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {request.visitor_phone || request.visitor_email ? (
                            <div className="flex flex-col gap-1">
                              {request.visitor_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {request.visitor_phone}
                                  </span>
                                </div>
                              )}
                              {request.visitor_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                                    {request.visitor_email}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Not provided
                            </span>
                          )}
                        </td>
                        {profile?.role === 'agency' && (
                          <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                            {request.agent_name || 'N/A'}
                          </td>
                        )}
                        <td className="py-4 px-4">
                          {request.listing_id && request.listing_title ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/property/${request.listing_id}`, { state: { from: '/contact-requests' } });
                              }}
                              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors group"
                            >
                              <Home className="w-4 h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{request.listing_title}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded">
                                <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                                General Inquiry
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              methodColors[request.contact_method as keyof typeof methodColors]
                            }`}
                          >
                            {methodIcons[request.contact_method as keyof typeof methodIcons]}
                            {request.contact_method.charAt(0).toUpperCase() + request.contact_method.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
