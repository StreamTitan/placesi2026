import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getContactStats } from '../../services/contactTracking';
import {
  Building2,
  TrendingUp,
  Eye,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  DollarSign,
  Home,
  Phone,
  ArrowLeft,
  Info,
  Heart,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalViews: number;
  totalInquiries: number;
  avgViewsPerListing: number;
  conversionRate: number;
  totalFavorites: number;
  totalContactRequests: number;
}

interface RecentActivity {
  id: string;
  type: 'view' | 'inquiry' | 'listing';
  propertyTitle: string;
  timestamp: string;
  description: string;
}

interface TopProperty {
  id: string;
  title: string;
  price: number;
  views: number;
  inquiries: number;
  image: string | null;
}

export function AgentPanelPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    avgViewsPerListing: 0,
    conversionRate: 0,
    totalFavorites: 0,
    totalContactRequests: 0,
  });
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('listed_by', user.id);

      if (propertiesError) throw propertiesError;

      const { data: inquiries, error: inquiriesError } = await supabase
        .from('property_inquiries')
        .select('*, properties!inner(listed_by)')
        .eq('properties.listed_by', user.id);

      if (inquiriesError) throw inquiriesError;

      // Get count of favorites for agent's properties
      const propertyIds = properties?.map(p => p.id) || [];
      let favoritesCount = 0;

      if (propertyIds.length > 0) {
        const { count, error: favoritesError } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds);

        if (favoritesError) throw favoritesError;
        favoritesCount = count || 0;
      }

      const contactStats = await getContactStats(user.id);

      const totalListings = properties?.length || 0;
      const activeListings = properties?.filter((p) => p.status === 'active').length || 0;
      const pendingListings = properties?.filter((p) => p.status === 'pending').length || 0;
      const soldListings = properties?.filter((p) => p.status === 'sold').length || 0;
      const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const totalInquiries = inquiries?.length || 0;
      const avgViewsPerListing = totalListings > 0 ? Math.round(totalViews / totalListings) : 0;

      const inquiryConversionRate = totalViews > 0 ? Math.round((totalInquiries / totalViews) * 100) : 0;
      const salesConversionRate = totalInquiries > 0 ? Math.round((soldListings / totalInquiries) * 100) : 0;
      const conversionRate = salesConversionRate > 0 ? salesConversionRate : inquiryConversionRate;

      setStats({
        totalListings,
        activeListings,
        pendingListings,
        soldListings,
        totalViews,
        totalInquiries,
        avgViewsPerListing,
        conversionRate,
        totalFavorites: favoritesCount,
        totalContactRequests: contactStats.total,
      });

      const top = properties
        ?.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          views: p.view_count || 0,
          inquiries: inquiries?.filter((i) => i.property_id === p.id).length || 0,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
        }))
        .sort((a, b) => b.views + b.inquiries * 5 - (a.views + a.inquiries * 5))
        .slice(0, 3);

      setTopProperties(top || []);

      const activities: RecentActivity[] = [];

      inquiries?.slice(0, 5).forEach((inq) => {
        activities.push({
          id: inq.id,
          type: 'inquiry',
          propertyTitle: 'Property Inquiry',
          timestamp: inq.created_at,
          description: `New inquiry: ${inq.message.substring(0, 50)}...`,
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: null,
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: null,
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      trend: `${stats.avgViewsPerListing} avg per listing`,
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: `${stats.conversionRate}% to sale`,
    },
  ];

  const statusCards = [
    {
      title: 'Pending',
      value: stats.pendingListings,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Sold',
      value: stats.soldListings,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Favorites',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Contact Requests',
      value: stats.totalContactRequests,
      icon: Phone,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agent Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back, {profile?.full_name || 'Agent'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/my-listings/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.trend && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{stat.trend}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statusCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Performing Properties
            </h2>
            {topProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No properties to display yet</p>
                <Button
                  onClick={() => navigate('/my-listings/new')}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/property/${property.id}`, { state: { from: '/agent-panel' } })}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {property.title}
                        </h3>
                      </div>
                      <p className="text-sm font-bold text-green-600 mt-1">
                        ${property.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {property.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {property.inquiries} inquiries
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/agent-panel/about')}
                variant="outline"
                className="w-full justify-start"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button
                onClick={() => navigate('/my-listings/new')}
                className="w-full justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
              <Button
                onClick={() => navigate('/my-listings')}
                variant="outline"
                className="w-full justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                View All Listings
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="w-full justify-start"
              >
                <Eye className="w-4 h-4 mr-2" />
                Manage Profile
              </Button>
              <Button
                onClick={() => navigate('/contact-requests')}
                variant="outline"
                className="w-full justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Requests
              </Button>
              <Button
                onClick={() => navigate('/analytics')}
                variant="outline"
                className="w-full justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity to display</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'inquiry'
                        ? 'bg-orange-50 dark:bg-orange-900/20'
                        : activity.type === 'view'
                        ? 'bg-violet-50 dark:bg-violet-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                    }`}
                  >
                    {activity.type === 'inquiry' ? (
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                    ) : activity.type === 'view' ? (
                      <Eye className="w-5 h-5 text-violet-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
