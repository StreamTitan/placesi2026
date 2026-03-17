import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Briefcase, Eye, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Database } from '../../lib/database.types';
import { getContractorAnalyticsSummary } from '../../services/contractorManagement';

type Contractor = Database['public']['Tables']['contractors']['Row'];
type ContractorListing = Database['public']['Tables']['contractor_listings']['Row'];

interface DashboardStats {
  totalViews: number;
  totalClicks: number;
  profileComplete: boolean;
  daysRemaining: number;
  isTrialActive: boolean;
}

export function ContractorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [listing, setListing] = useState<ContractorListing | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalClicks: 0,
    profileComplete: false,
    daysRemaining: 0,
    isTrialActive: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile?.id]);

  const loadDashboardData = async () => {
    if (!profile?.id) return;

    try {
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (contractorData) {
        setContractor(contractorData);

        const { data: listingData } = await supabase
          .from('contractor_listings')
          .select('*')
          .eq('contractor_id', contractorData.id)
          .maybeSingle();

        if (listingData) {
          setListing(listingData);
        }

        const trialStartDate = new Date(contractorData.trial_start_date);
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isTrialActive = contractorData.subscription_status === 'trial' && daysRemaining > 0;

        const profileComplete = !!(
          contractorData.company_name &&
          contractorData.primary_category &&
          contractorData.phone &&
          contractorData.description &&
          contractorData.service_areas &&
          contractorData.service_areas.length > 0
        );

        const analyticsData = await getContractorAnalyticsSummary(contractorData.id);

        setStats({
          totalViews: analyticsData.total_views,
          totalClicks: analyticsData.total_clicks,
          profileComplete,
          daysRemaining,
          isTrialActive,
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
      title: 'Profile Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Contact Clicks',
      value: stats.totalClicks,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Trial Days Left',
      value: stats.daysRemaining,
      icon: Calendar,
      color: stats.daysRemaining > 7 ? 'text-green-600' : 'text-orange-600',
      bgColor: stats.daysRemaining > 7 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Profile Status',
      value: stats.profileComplete ? 'Complete' : 'Incomplete',
      icon: stats.profileComplete ? CheckCircle : XCircle,
      color: stats.profileComplete ? 'text-green-600' : 'text-red-600',
      bgColor: stats.profileComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Contractor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {contractor?.company_name || 'Contractor'}!
          </p>
        </div>

        {!stats.isTrialActive && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 dark:text-red-200 font-medium">
                Your trial has ended. Please upgrade to continue appearing in the directory.
              </p>
            </div>
          </div>
        )}

        {stats.isTrialActive && stats.daysRemaining <= 7 && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-600 mr-2" />
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                Your trial expires in {stats.daysRemaining} day{stats.daysRemaining !== 1 ? 's' : ''}. Upgrade to keep your listing active.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.isText ? stat.value : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/contractor-profile-edit')}
                variant="outline"
                className="w-full justify-start"
              >
                Edit Company Profile
              </Button>
              <Button
                onClick={() => navigate('/contractor-specials')}
                variant="outline"
                className="w-full justify-start"
              >
                Manage Specials
              </Button>
              <Button
                onClick={() => navigate(`/contractor/${contractor?.id}`)}
                variant="outline"
                className="w-full justify-start"
              >
                View Public Profile
              </Button>
              <Button
                onClick={() => navigate('/contractors')}
                variant="outline"
                className="w-full justify-start"
              >
                Browse Contractors Directory
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {contractor?.company_name || 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {contractor?.primary_category || 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Service Areas:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {contractor?.service_areas && contractor.service_areas.length > 0
                    ? contractor.service_areas.join(', ')
                    : 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {contractor?.phone || 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Years in Business:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {contractor?.years_in_business || 'Not set'}
                </span>
              </div>
              {!stats.profileComplete && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Complete your profile to improve visibility in search results!
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                1. Complete Your Profile
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Add your services, description, photos, and contact information to attract more clients.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                2. Get Discovered
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your profile is now live in the contractors directory. Clients can find and contact you directly.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                3. Track Your Performance
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Monitor your profile views and contact clicks to see how clients are engaging with your listing.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                4. Upgrade Your Plan
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                After your 30-day trial, upgrade to continue appearing in search results and receiving leads.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
