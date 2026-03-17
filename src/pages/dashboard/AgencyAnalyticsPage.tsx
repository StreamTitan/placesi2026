import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAgencyAnalytics, type AgencyAnalytics } from '../../services/agencyAnalytics';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  ArrowLeft,
  TrendingUp,
  Building2,
  Eye,
  Phone,
  Heart,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Calendar,
  X,
} from 'lucide-react';

export function AgencyAnalyticsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AgencyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadAnalytics();
  }, [profile, timeRange]);

  const loadAnalytics = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (timeRange !== 'all') {
        const end = new Date();
        const start = new Date();

        switch (timeRange) {
          case '7d':
            start.setDate(end.getDate() - 7);
            break;
          case '30d':
            start.setDate(end.getDate() - 30);
            break;
          case '90d':
            start.setDate(end.getDate() - 90);
            break;
        }

        startDate = start.toISOString();
        endDate = end.toISOString();
      }

      if (customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start).toISOString();
        endDate = new Date(customDateRange.end).toISOString();
      }

      const data = await fetchAgencyAnalytics(profile.id, startDate, endDate);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);

      if (start > end) {
        alert('Start date must be before end date');
        return;
      }

      setTimeRange('all');
      setShowDateRangePicker(false);
      loadAnalytics();
    }
  };

  const handleClearDateRange = () => {
    setCustomDateRange({ start: '', end: '' });
    setShowDateRangePicker(false);
    setTimeRange('30d');
  };

  const filteredAgentPerformance = analytics?.agentPerformance || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Unable to load analytics</div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Properties',
      value: analytics.overview.totalProperties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: null,
    },
    {
      title: 'Total Views',
      value: analytics.overview.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      trend: null,
    },
    {
      title: 'Contact Requests',
      value: analytics.overview.totalContactRequests,
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: `${analytics.overview.conversionRate.toFixed(2)}% conversion`,
    },
    {
      title: 'Total Favorites',
      value: analytics.overview.totalFavorites,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      trend: null,
    },
  ];

  const maxTypeValue = Math.max(...analytics.listingsByType.map(item => item.count));
  const maxAgentValue = Math.max(...analytics.agentPerformance.map(agent => agent.totalViews));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Agency Analytics
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Comprehensive insights into your agency's performance
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    Date Range
                  </Button>
                  {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range && !customDateRange.start ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCustomDateRange({ start: '', end: '' });
                        setTimeRange(range);
                      }}
                    >
                      {range === '7d' ? '7D' : range === '30d' ? '30D' : range === '90d' ? '90D' : 'All Time'}
                    </Button>
                  ))}
                </div>
              </div>

              {!customDateRange.start && (
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Viewing:
                  </div>
                  <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === '90d' ? 'Last 90 Days' : 'All Time'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {showDateRangePicker && (
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApplyDateRange}
                      size="sm"
                      disabled={!customDateRange.start || !customDateRange.end}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearDateRange}
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {customDateRange.start && customDateRange.end && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span>
                  Showing data from {new Date(customDateRange.start).toLocaleDateString()} to{' '}
                  {new Date(customDateRange.end).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearDateRange}
                  className="ml-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card) => (
            <Card key={card.title} className="p-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white animate-count-up">
                    {card.value}
                  </p>
                  {card.trend && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {card.trend}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Listings by Property Type
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              {analytics.listingsByType.map((item, index) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.type}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.views.toLocaleString()} views
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out animate-bar-grow"
                      style={{
                        width: `${(item.count / maxTypeValue) * 100}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="h-full flex items-center justify-end pr-3">
                        <span className="text-xs font-medium text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Listing Status Distribution
                </h2>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {analytics.listingsByStatus.map((item, index) => {
                    const total = analytics.listingsByStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = (item.count / total) * 100;
                    const previousPercentage = analytics.listingsByStatus
                      .slice(0, index)
                      .reduce((sum, s) => sum + (s.count / total) * 100, 0);

                    const colors = {
                      active: '#10b981',
                      pending: '#f59e0b',
                      sold: '#3b82f6',
                      expired: '#ef4444',
                    };

                    return (
                      <circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[item.status as keyof typeof colors] || '#6b7280'}
                        strokeWidth="20"
                        strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                        strokeDashoffset={-previousPercentage * 2.51}
                        className="animate-pie-draw"
                        style={{ animationDelay: `${index * 200}ms` }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.listingsByStatus.reduce((sum, s) => sum + s.count, 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {analytics.listingsByStatus.map((item) => {
                const colors = {
                  active: 'bg-green-500',
                  pending: 'bg-yellow-500',
                  sold: 'bg-blue-500',
                  expired: 'bg-red-500',
                };
                return (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[item.status as keyof typeof colors] || 'bg-gray-500'}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {item.status}: <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Views Over Time
            </h2>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {analytics.viewsOverTime.map((item, index) => {
              const maxViews = Math.max(...analytics.viewsOverTime.map(v => v.views));
              const heightPercentage = (item.views / maxViews) * 100;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-sm hover:from-teal-700 hover:to-teal-500 transition-all duration-300 animate-bar-grow-up"
                      style={{
                        height: `${heightPercentage}%`,
                        animationDelay: `${index * 30}ms`,
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                        {item.views} views
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Agent Performance Rankings
                  </h2>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {filteredAgentPerformance.slice(0, 10).map((agent, index) => (
                <div key={agent.agentId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {agent.agentName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{agent.listingsCount} listings</span>
                          <span>•</span>
                          <span>{agent.contactRequests} contacts</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {agent.totalViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {agent.conversionRate.toFixed(1)}% conv.
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-bar-grow"
                      style={{
                        width: `${(agent.totalViews / maxAgentValue) * 100}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Contact Methods Breakdown
              </h2>
            </div>
            <div className="space-y-4">
              {analytics.contactMethodBreakdown.map((item, index) => {
                const total = analytics.contactMethodBreakdown.reduce((sum, m) => sum + m.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;

                const colors = {
                  phone: { bg: 'bg-green-500', text: 'text-green-600' },
                  whatsapp: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
                  email: { bg: 'bg-blue-500', text: 'text-blue-600' },
                };

                const color = colors[item.method as keyof typeof colors] || { bg: 'bg-gray-500', text: 'text-gray-600' };

                return (
                  <div key={item.method}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.method}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${color.bg} rounded-full flex items-center justify-end pr-3 animate-bar-grow`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${index * 150}ms`,
                        }}
                      >
                        <span className="text-xs font-medium text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Performing Listings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Property
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Price
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Views
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Favorites
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contacts
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.topPerformingListings.map((listing, index) => {
                  const score = listing.views + listing.favorites * 2 + listing.contactRequests * 5;
                  return (
                    <tr
                      key={listing.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/property/${listing.id}`, { state: { from: '/dashboard/analytics' } })}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {listing.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${listing.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4 text-teal-600" />
                          <span className="text-gray-900 dark:text-white">{listing.views}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-gray-900 dark:text-white">{listing.favorites}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Phone className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-900 dark:text-white">{listing.contactRequests}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bar-grow {
          from {
            width: 0;
          }
        }

        @keyframes bar-grow-up {
          from {
            height: 0;
          }
        }

        @keyframes pie-draw {
          from {
            stroke-dasharray: 0 251;
          }
        }

        @keyframes count-up {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bar-grow {
          animation: bar-grow 1s ease-out forwards;
        }

        .animate-bar-grow-up {
          animation: bar-grow-up 1s ease-out forwards;
        }

        .animate-pie-draw {
          animation: pie-draw 1s ease-out forwards;
        }

        .animate-count-up {
          animation: count-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
