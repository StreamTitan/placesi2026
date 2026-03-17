import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Users,
  MessageSquare,
  Save
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPhoneNumber } from '../../lib/formatters';
import { formatCurrency, getDSRStatus, calculateQualificationScore, type QualificationScoreBreakdown } from '../../utils/mortgageCalculations';
import type { Database } from '../../lib/database.types';

type MortgageApplication = Database['public']['Tables']['mortgage_applications']['Row'];
type CoApplicant = Database['public']['Tables']['co_applicants']['Row'];
type ApplicationNote = Database['public']['Tables']['application_notes']['Row'];
type ApplicationDocument = Database['public']['Tables']['application_documents']['Row'];

interface ApplicationWithRelations extends MortgageApplication {
  profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
  property: {
    title: string;
    city: string;
    region: string;
    property_type: string;
    images: string[];
  } | null;
}

type TabType = 'overview' | 'applicant' | 'financial' | 'co-applicant' | 'documents' | 'notes';

export function MortgageApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [coApplicant, setCoApplicant] = useState<CoApplicant | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<QualificationScoreBreakdown | null>(null);

  useEffect(() => {
    if (profile?.role !== 'mortgage_institution') {
      navigate('/dashboard');
      return;
    }
    if (id) {
      loadApplicationData(id);
    }
  }, [id, profile]);

  const loadApplicationData = async (applicationId: string) => {
    try {
      const { data: appData, error: appError } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          profile:profiles!mortgage_applications_user_id_fkey(full_name, phone),
          property:properties(title, city, region, property_type, images)
        `)
        .eq('id', applicationId)
        .maybeSingle();

      if (appError) throw appError;
      if (!appData) {
        navigate('/dashboard');
        return;
      }

      setApplication(appData as ApplicationWithRelations);

      if (appData.qualification_score && appData.down_payment_percent && appData.years_employed) {
        const breakdown = calculateQualificationScore(
          {
            gdsRatio: appData.gds_ratio || 0,
            tdsRatio: appData.tds_ratio || 0,
            ltvRatio: appData.ltv_ratio || 0,
            monthlyHousingCosts: appData.monthly_payment || 0,
            totalMonthlyDebt: appData.total_monthly_debts || 0,
            qualifiesGDS: (appData.gds_ratio || 0) <= 32,
            qualifiesTDS: (appData.tds_ratio || 0) <= 40,
            estimatedPropertyTax: appData.estimated_property_tax || 0,
            estimatedHeating: appData.estimated_heating_costs || 150,
          },
          appData.down_payment_percent,
          appData.years_employed,
          appData.gross_annual_income || 0,
          appData.loan_amount || 0
        );
        setScoreBreakdown(breakdown);
      }

      const { data: coAppData } = await supabase
        .from('co_applicants')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (coAppData) setCoApplicant(coAppData);

      const { data: docsData } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });

      if (docsData) setDocuments(docsData);

      const { data: notesData } = await supabase
        .from('application_notes')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (notesData) setNotes(notesData);
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'under_review' | 'conditional') => {
    if (!application) return;

    try {
      const { error } = await supabase
        .from('mortgage_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      await loadApplicationData(application.id);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !application || !user || !profile) return;

    setSavingNote(true);
    try {
      const { error } = await supabase
        .from('application_notes')
        .insert({
          application_id: application.id,
          author_id: user.id,
          author_name: profile.full_name || 'Unknown',
          content: newNote.trim(),
        });

      if (error) throw error;

      setNewNote('');
      await loadApplicationData(application.id);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full flex items-center gap-2"><Clock className="w-4 h-4" />Submitted</span>;
      case 'under_review':
        return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-full flex items-center gap-2"><FileText className="w-4 h-4" />Under Review</span>;
      case 'conditional':
        return <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full flex items-center gap-2"><AlertCircle className="w-4 h-4" />Conditional</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full flex items-center gap-2"><CheckCircle className="w-4 h-4" />Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full flex items-center gap-2"><XCircle className="w-4 h-4" />Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">{status}</span>;
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

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Home },
    { id: 'applicant' as TabType, label: 'Applicant Details', icon: User },
    { id: 'financial' as TabType, label: 'Financial Analysis', icon: TrendingUp },
    { id: 'co-applicant' as TabType, label: 'Co-Applicant', icon: Users },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'notes' as TabType, label: 'Notes & Activity', icon: MessageSquare },
  ];

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
            <Link to="/dashboard" className="text-[#158EC5] hover:underline mt-4 inline-block">
              Back to Dashboard
            </Link>
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

          {application.status !== 'approved' && application.status !== 'rejected' && (
            <div className="flex gap-3 mb-6">
              <Button
                onClick={() => handleStatusUpdate('under_review')}
                variant="outline"
                className="flex items-center gap-2"
                disabled={application.status === 'under_review'}
              >
                <FileText className="w-4 h-4" />
                Mark Under Review
              </Button>
              <Button
                onClick={() => handleStatusUpdate('conditional')}
                variant="outline"
                className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <AlertCircle className="w-4 h-4" />
                Conditional Approval
              </Button>
              <Button
                onClick={() => handleStatusUpdate('approved')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate('rejected')}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#158EC5] text-[#158EC5]'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qualification Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {application.qualification_score?.toFixed(0) || 'N/A'}/100
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

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Loan Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.monthly_payment))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'applicant' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {application.first_name} {application.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date of Birth</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(application.date_of_birth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <a href={`mailto:${application.email}`} className="text-base font-medium text-[#158EC5] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {application.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                  <a href={`tel:${application.phone}`} className="text-base font-medium text-[#158EC5] hover:underline flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {application.phone ? formatPhoneNumber(application.phone) : 'N/A'}
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employment Status</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {application.employment_status?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Years Employed</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {application.years_employed} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employer</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {application.employer_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Occupation</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {application.occupation || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Income Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Annual Income</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.gross_annual_income))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Monthly Income</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.gross_monthly_income))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other Income</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.other_income))}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Debts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Credit Cards</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.credit_card_payments))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Car Loans</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.car_loan_payments))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Student Loans</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.student_loan_payments))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other Debts</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.other_debt_payments))}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly Debts</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(application.total_monthly_debts))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Debt Service Ratios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${getDSRStatus(application.gds_ratio || 0).bg}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">GDS Ratio</p>
                  <p className={`text-3xl font-bold ${getDSRStatus(application.gds_ratio || 0).color}`}>
                    {application.gds_ratio?.toFixed(1)}%
                  </p>
                  <p className={`text-sm mt-1 ${getDSRStatus(application.gds_ratio || 0).color}`}>
                    {getDSRStatus(application.gds_ratio || 0).label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: ≤ 32%</p>
                </div>

                <div className={`p-6 rounded-xl ${getDSRStatus(application.tds_ratio || 0).bg}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">TDS Ratio</p>
                  <p className={`text-3xl font-bold ${getDSRStatus(application.tds_ratio || 0).color}`}>
                    {application.tds_ratio?.toFixed(1)}%
                  </p>
                  <p className={`text-sm mt-1 ${getDSRStatus(application.tds_ratio || 0).color}`}>
                    {getDSRStatus(application.tds_ratio || 0).label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: ≤ 40%</p>
                </div>

                <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">LTV Ratio</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {application.ltv_ratio?.toFixed(1)}%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {(application.ltv_ratio || 0) <= 80 ? 'Good' : 'High'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: ≤ 80%</p>
                </div>
              </div>
            </Card>

            {scoreBreakdown && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualification Score Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GDS Score</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{scoreBreakdown.gdsScore}/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#158EC5] h-2 rounded-full transition-all"
                        style={{ width: `${(scoreBreakdown.gdsScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TDS Score</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{scoreBreakdown.tdsScore}/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#158EC5] h-2 rounded-full transition-all"
                        style={{ width: `${(scoreBreakdown.tdsScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Down Payment Score</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{scoreBreakdown.downPaymentScore}/25</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#158EC5] h-2 rounded-full transition-all"
                        style={{ width: `${(scoreBreakdown.downPaymentScore / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employment Score</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{scoreBreakdown.employmentScore}/20</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#158EC5] h-2 rounded-full transition-all"
                        style={{ width: `${(scoreBreakdown.employmentScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Income Score</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{scoreBreakdown.incomeScore}/15</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#158EC5] h-2 rounded-full transition-all"
                        style={{ width: `${(scoreBreakdown.incomeScore / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">Total Score</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-[#158EC5]">{scoreBreakdown.totalScore}</span>
                        <span className="text-lg text-gray-500 dark:text-gray-400">/100</span>
                        <p className={`text-sm font-medium ${
                          scoreBreakdown.category === 'Excellent' ? 'text-green-600' :
                          scoreBreakdown.category === 'Good' ? 'text-blue-600' :
                          scoreBreakdown.category === 'Fair' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {scoreBreakdown.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'co-applicant' && (
          <div className="space-y-6">
            {coApplicant ? (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Co-Applicant Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.first_name} {coApplicant.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date of Birth</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {formatDate(coApplicant.date_of_birth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.phone ? formatPhoneNumber(coApplicant.phone) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employment Status</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                        {coApplicant.employment_status?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Years Employed</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.years_employed} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employer</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.employer_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Occupation</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {coApplicant.occupation || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Annual Income</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.gross_annual_income))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Monthly Income</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.gross_monthly_income))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other Income</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.other_income))}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Monthly Debts</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Credit Cards</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.credit_card_payments))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Car Loans</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.car_loan_payments))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Student Loans</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.student_loan_payments))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other Debts</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.other_debt_payments))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly Debts</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(Number(coApplicant.total_monthly_debts))}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Combined Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Combined Annual Income</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(Number(application.gross_annual_income) + Number(coApplicant.gross_annual_income))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Combined Monthly Income</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(Number(application.gross_monthly_income) + Number(coApplicant.gross_monthly_income))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Combined Monthly Debts</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(Number(application.total_monthly_debts))}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No co-applicant for this application</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-6">
                    <div className="flex items-start gap-4">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Uploaded: {formatDate(doc.uploaded_at)}
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
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No documents uploaded</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Internal Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this application..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5] focus:border-[#158EC5] resize-none"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || savingNote}
                  className="flex items-center gap-2 bg-[#158EC5] hover:bg-[#1178a3]"
                >
                  <Save className="w-4 h-4" />
                  {savingNote ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes History</h3>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#158EC5] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {note.author_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{note.author_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.created_at).toLocaleString('en-TT', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No notes yet</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Application Submitted</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(application.submitted_at)}
                    </p>
                  </div>
                </div>
                {application.reviewed_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Application Reviewed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(application.reviewed_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
