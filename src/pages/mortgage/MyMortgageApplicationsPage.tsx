import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Eye, Calendar, DollarSign, Home, Bell, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Database } from '../../lib/database.types';

type MortgageApplication = Database['public']['Tables']['mortgage_applications']['Row'];
type UserNotification = Database['public']['Tables']['user_notifications']['Row'];

interface ApplicationWithDetails extends MortgageApplication {
  property: {
    title: string;
    city: string;
    region: string;
    images: string[];
  } | null;
  unread_notifications: number;
}

export function MyMortgageApplicationsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/my-mortgage-applications' } });
      return;
    }
    if (profile && (profile.role === 'agency' || profile.role === 'mortgage_institution')) {
      navigate('/');
      return;
    }
    loadApplications();
    loadNotifications();
  }, [user, profile]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          property:properties(title, city, region, images)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const appsWithNotifications = await Promise.all(
        (data || []).map(async (app) => {
          const { count } = await supabase
            .from('user_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('application_id', app.id)
            .eq('status', 'unread');

          return {
            ...app,
            unread_notifications: count || 0,
          } as ApplicationWithDetails;
        })
      );

      setApplications(appsWithNotifications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', notificationId);

      await loadNotifications();
      await loadApplications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewApplication = async (application: ApplicationWithDetails) => {
    await supabase
      .from('mortgage_applications')
      .update({ last_viewed_by_user_at: new Date().toISOString() })
      .eq('id', application.id);

    const unreadNotifications = notifications.filter(
      n => n.application_id === application.id && n.status === 'unread'
    );

    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }

    navigate(`/my-mortgage-applications/${application.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-full flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Under Review
          </span>
        );
      case 'conditional':
        return (
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Conditional
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Declined
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-TT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#158EC5] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Mortgage Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your mortgage applications and view notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {notifications.filter(n => n.status === 'unread').slice(0, 3).map(notification => (
                    <div key={notification.id} className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>{notification.title}</strong> - {notification.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'all'
                ? 'bg-[#158EC5] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All Applications ({applications.length})
          </button>
          <button
            onClick={() => setSelectedStatus('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'submitted'
                ? 'bg-[#158EC5] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Submitted ({applications.filter(a => a.status === 'submitted').length})
          </button>
          <button
            onClick={() => setSelectedStatus('under_review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'under_review'
                ? 'bg-[#158EC5] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Under Review ({applications.filter(a => a.status === 'under_review').length})
          </button>
          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'approved'
                ? 'bg-[#158EC5] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
        </div>

        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Applications Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedStatus === 'all'
                ? "You haven't submitted any mortgage applications yet."
                : `You don't have any ${selectedStatus.replace('_', ' ')} applications.`}
            </p>
            <Button
              onClick={() => navigate('/search')}
              className="bg-[#158EC5] hover:bg-[#1178a3]"
            >
              Browse Properties
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewApplication(application)}
              >
                <div className="flex items-start gap-6">
                  {application.property?.images && application.property.images.length > 0 && (
                    <img
                      src={application.property.images[0]}
                      alt={application.property.title}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                          <Home className="w-5 h-5 flex-shrink-0" />
                          {application.property?.title || application.property_address || 'Property Application'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {application.property?.city}, {application.property?.region}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {application.unread_notifications > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                            <Bell className="w-3 h-3" />
                            {application.unread_notifications}
                          </span>
                        )}
                        {getStatusBadge(application.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loan Amount</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(Number(application.loan_amount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Payment</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(Number(application.monthly_payment))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(application.submitted_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Application ID</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {application.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {application.qualification_score && (
                          <span>
                            Qualification Score: <strong className="text-gray-900 dark:text-white">{application.qualification_score.toFixed(0)}/100</strong>
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(application);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
