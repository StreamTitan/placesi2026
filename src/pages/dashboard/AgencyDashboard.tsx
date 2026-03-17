import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getAgencyContactStats } from '../../services/contactTracking';
import { Building2, Users, TrendingUp, Eye, Phone, Info, Heart, BarChart3, MessageCircle, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Database } from '../../lib/database.types';

type Agency = Database['public']['Tables']['agencies']['Row'];

interface DashboardStats {
  totalAgents: number;
  totalListings: number;
  activeListings: number;
  totalViews: number;
  agencyFavorites: number;
  agentFavorites: number;
  totalContactRequests: number;
  phoneContacts: number;
  whatsappContacts: number;
  emailContacts: number;
}

export function AgencyDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    agencyFavorites: 0,
    agentFavorites: 0,
    totalContactRequests: 0,
    phoneContacts: 0,
    whatsappContacts: 0,
    emailContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState<Agency | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('*')
        .eq('created_by', profile?.id)
        .single();

      setAgency(agencyData);

      const { data: agentProfilesData } = await supabase
        .from('agent_profiles')
        .select('user_id')
        .eq('agency_id', agencyData?.id);

      const agentIds = agentProfilesData?.map(a => a.user_id) || [];

      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .in('listed_by', agentIds);

      const { count: agencyFavCount } = await supabase
        .from('agency_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agencyData?.id);

      const { count: agentFavCount } = await supabase
        .from('agent_favorites')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', agentIds);

      const contactStats = await getAgencyContactStats(profile?.id || '');

      if (propertiesData) {
        setStats({
          totalAgents: agentProfilesData?.length || 0,
          totalListings: propertiesData.length,
          activeListings: propertiesData.filter(p => p.status === 'active').length,
          totalViews: propertiesData.reduce((sum, p) => sum + (p.views || 0), 0),
          agencyFavorites: agencyFavCount || 0,
          agentFavorites: agentFavCount || 0,
          totalContactRequests: contactStats.total,
          phoneContacts: contactStats.byPhone,
          whatsappContacts: contactStats.byWhatsApp,
          emailContacts: contactStats.byEmail,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Agents',
      value: stats.totalAgents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Total Contact Requests',
      value: stats.totalContactRequests,
      icon: Phone,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      title: 'Phone Contacts',
      value: stats.phoneContacts,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'WhatsApp Contacts',
      value: stats.whatsappContacts,
      icon: MessageCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Email Contacts',
      value: stats.emailContacts,
      icon: Mail,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    },
    {
      title: 'Agency Favorites',
      value: stats.agencyFavorites,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Agent Favorites',
      value: stats.agentFavorites,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {agency?.logo_url ? (
              <img
                src={agency.logo_url}
                alt={profile?.agency_name || 'Agency'}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 dark:bg-white p-1"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile?.agency_name} Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage your agency and track performance
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Performing Agents
            </h2>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No data available yet
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard/about')}
                variant="outline"
                className="w-full justify-start"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button
                onClick={() => navigate('/dashboard/agents')}
                variant="outline"
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Agents
              </Button>
              <Button
                onClick={() => navigate('/dashboard/listings')}
                variant="outline"
                className="w-full justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                View All Listings
              </Button>
              <Button
                onClick={() => navigate('/dashboard/analytics')}
                variant="outline"
                className="w-full justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                onClick={() => navigate('/contact-requests')}
                variant="outline"
                className="w-full justify-start"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Requests
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
