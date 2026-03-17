import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Briefcase,
  DollarSign,
  Home,
  Download,
  Calendar,
  Mail,
  Phone,
  Building,
  TrendingUp,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { formatPhoneNumber } from '../../lib/formatters';
import { formatCurrency, getDSRStatus } from '../../utils/mortgageCalculations';
import type { Database } from '../../lib/database.types';

type MortgageApplication = Database['public']['Tables']['mortgage_applications']['Row'];
type ApplicationDocument = Database['public']['Tables']['application_documents']['Row'];
type UserNotification = Database['public']['Tables']['user_notifications']['Row'];

interface ApplicationWithRelations extends MortgageApplication {
  property: {
    title: string;
    city: string;
    region: string;
    property_type: string;
    images: string[];
  } | null;
}

export function MyMortgageApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/my-mortgage-applications/${id}` } });
      return;
    }
    if (profile && (profile.role === 'agency' || profile.role === 'mortgage_institution')) {
      navigate('/');
      return;
    }
    if (id) {
      loadApplicationData(id);
    }
  }, [id, user, profile]);

  const loadApplicationData = async (applicationId: string) => {
    try {
      const { data: appData, error: appError } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          property:properties(title, city, region, property_type, images)
        `)
        .eq('id', applicationId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (appError) throw appError;
      if (!appData) {
        navigate('/my-mortgage-applications');
        return;
      }

      setApplication(appData as ApplicationWithRelations);

      await supabase
        .from('mortgage_applications')
        .update({ last_viewed_by_user_at: new Date().toISOString() })
        .eq('id', applicationId);

      const { data: docsData } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });

      if (docsData) setDocuments(docsData);

      const { data: notificationsData } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (notificationsData) {
        setNotifications(notificationsData);

        const unreadIds = notificationsData
          .filter(n => n.status === 'unread')
          .map(n => n.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('user_notifications')
            .update({ status: 'read', read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
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
            Conditional Approval
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

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-TT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#158EC5] border-t-transparent"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Application Not Found</h2>
            <button
              onClick={() => navigate('/my-mortgage-applications')}
              className="text-[#158EC5] hover:underline mt-4 inline-block"
            >
              Back to My Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-[#158EC5] dark:hover:text-[#158EC5] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              {application.property?.images && application.property.images.length > 0 && (
                <img
                  src={application.property.images[0]}
                  alt={application.property.title}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {application.property?.title || 'Mortgage Application'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Application ID: {application.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Updates
            </h3>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loan Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(application.loan_amount))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(application.monthly_payment))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(application.submitted_at)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Property</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {application.property?.title || application.property_address}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {application.property?.city}, {application.property?.region}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Property Type</p>
                <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                  {application.property?.property_type || application.property_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Property Price</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {formatCurrency(Number(application.property_price))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Loan Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{application.interest_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loan Term</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{application.loan_term_years} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Down Payment</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {application.down_payment_percent?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Down Payment Amount</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(Number(application.down_payment))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {(application.gds_ratio || application.tds_ratio) && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {application.gds_ratio && (
                <div className={`p-6 rounded-xl ${getDSRStatus(application.gds_ratio).bg}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">GDS Ratio</p>
                  <p className={`text-3xl font-bold ${getDSRStatus(application.gds_ratio).color}`}>
                    {application.gds_ratio.toFixed(1)}%
                  </p>
                  <p className={`text-sm mt-1 ${getDSRStatus(application.gds_ratio).color}`}>
                    {getDSRStatus(application.gds_ratio).label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: ≤ 32%</p>
                </div>
              )}

              {application.tds_ratio && (
                <div className={`p-6 rounded-xl ${getDSRStatus(application.tds_ratio).bg}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">TDS Ratio</p>
                  <p className={`text-3xl font-bold ${getDSRStatus(application.tds_ratio).color}`}>
                    {application.tds_ratio.toFixed(1)}%
                  </p>
                  <p className={`text-sm mt-1 ${getDSRStatus(application.tds_ratio).color}`}>
                    {getDSRStatus(application.tds_ratio).label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: ≤ 40%</p>
                </div>
              )}

              {application.qualification_score && (
                <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Qualification Score</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {application.qualification_score.toFixed(0)}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">/100</p>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submitted Documents
          </h3>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1 capitalize">
                      {doc.document_type.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {doc.file_name}
                    </p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#158EC5] hover:underline"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No documents on file</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
