import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, DollarSign, TrendingUp, FileText, Eye, Filter, X, Search, Info } from 'lucide-react';
import { formatPhoneNumber } from '../../lib/formatters';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Database } from '../../lib/database.types';

type MortgageApplication = Database['public']['Tables']['mortgage_applications']['Row'];

interface ApplicationWithProfile extends MortgageApplication {
  profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
  property: {
    title: string;
    city: string;
    region: string;
  } | null;
}

interface DashboardStats {
  totalApplications: number;
  approvedLoans: number;
  pendingReview: number;
  totalLoanAmount: number;
}

interface Filters {
  status: string[];
  qualificationScore: { min: number; max: number };
  gdsRatio: { min: number; max: number };
  tdsRatio: { min: number; max: number };
  loanAmount: { min: number; max: number };
  dateRange: { start: string; end: string };
  searchQuery: string;
}

export function MortgageInstitutionDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    approvedLoans: 0,
    pendingReview: 0,
    totalLoanAmount: 0,
  });
  const [allApplications, setAllApplications] = useState<ApplicationWithProfile[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    qualificationScore: { min: 0, max: 100 },
    gdsRatio: { min: 0, max: 100 },
    tdsRatio: { min: 0, max: 100 },
    loanAmount: { min: 0, max: 10000000 },
    dateRange: { start: '', end: '' },
    searchQuery: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allApplications]);

  const loadDashboardData = async () => {
    try {
      const { data: applicationsData, error: appsError } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          profile:profiles!mortgage_applications_user_id_fkey(full_name, phone),
          property:properties(title, city, region)
        `)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      const apps = applicationsData as ApplicationWithProfile[];
      setAllApplications(apps);

      const totalApps = apps.length;
      const approved = apps.filter(app => app.status === 'approved').length;
      const pending = apps.filter(app => app.status === 'submitted' || app.status === 'under_review').length;
      const totalAmount = apps
        .filter(app => app.status === 'approved')
        .reduce((sum, app) => sum + Number(app.loan_amount), 0);

      setStats({
        totalApplications: totalApps,
        approvedLoans: approved,
        pendingReview: pending,
        totalLoanAmount: totalAmount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allApplications];

    if (filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status.includes(app.status));
    }

    if (filters.qualificationScore.min > 0 || filters.qualificationScore.max < 100) {
      filtered = filtered.filter(app => {
        const score = app.qualification_score || 0;
        return score >= filters.qualificationScore.min && score <= filters.qualificationScore.max;
      });
    }

    if (filters.gdsRatio.min > 0 || filters.gdsRatio.max < 100) {
      filtered = filtered.filter(app => {
        const gds = app.gds_ratio || 0;
        return gds >= filters.gdsRatio.min && gds <= filters.gdsRatio.max;
      });
    }

    if (filters.tdsRatio.min > 0 || filters.tdsRatio.max < 100) {
      filtered = filtered.filter(app => {
        const tds = app.tds_ratio || 0;
        return tds >= filters.tdsRatio.min && tds <= filters.tdsRatio.max;
      });
    }

    if (filters.loanAmount.min > 0 || filters.loanAmount.max < 10000000) {
      filtered = filtered.filter(app => {
        const amount = Number(app.loan_amount) || 0;
        return amount >= filters.loanAmount.min && amount <= filters.loanAmount.max;
      });
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(app => {
        if (!app.submitted_at) return false;
        return new Date(app.submitted_at) >= new Date(filters.dateRange.start);
      });
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(app => {
        if (!app.submitted_at) return false;
        return new Date(app.submitted_at) <= new Date(filters.dateRange.end);
      });
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app => {
        const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase();
        const propertyTitle = app.property?.title?.toLowerCase() || '';
        const propertyAddress = app.property_address?.toLowerCase() || '';
        return fullName.includes(query) || propertyTitle.includes(query) || propertyAddress.includes(query);
      });
    }

    setFilteredApplications(filtered);
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      qualificationScore: { min: 0, max: 100 },
      gdsRatio: { min: 0, max: 100 },
      tdsRatio: { min: 0, max: 100 },
      loanAmount: { min: 0, max: 10000000 },
      dateRange: { start: '', end: '' },
      searchQuery: '',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.qualificationScore.min > 0 || filters.qualificationScore.max < 100) count++;
    if (filters.gdsRatio.min > 0 || filters.gdsRatio.max < 100) count++;
    if (filters.tdsRatio.min > 0 || filters.tdsRatio.max < 100) count++;
    if (filters.loanAmount.min > 0 || filters.loanAmount.max < 10000000) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: 'TTD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDSRColor = (dsr: number | null) => {
    if (!dsr) return 'text-gray-600 dark:text-gray-400';
    if (dsr <= 35) return 'text-green-600 dark:text-green-400';
    if (dsr <= 43) return 'text-yellow-600 dark:text-yellow-400';
    if (dsr <= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDSRBg = (dsr: number | null) => {
    if (!dsr) return 'bg-gray-50 dark:bg-gray-900/20';
    if (dsr <= 35) return 'bg-green-50 dark:bg-green-900/20';
    if (dsr <= 43) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (dsr <= 50) return 'bg-orange-50 dark:bg-orange-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Submitted</span>;
      case 'under_review':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">Under Review</span>;
      case 'conditional':
        return <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">Conditional</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Approved Loans',
      value: stats.approvedLoans,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Total Loan Amount',
      value: `$${(stats.totalLoanAmount / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile?.institution_name} Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage mortgage applications and track lending activity
              </p>
            </div>
            <button
              onClick={() => navigate('/mortgage-decision-info')}
              className="flex-shrink-0 p-3 bg-[#158EC5] hover:bg-[#1178a3] text-white rounded-lg transition-colors group relative"
              title="Learn about mortgage calculations"
            >
              <Info className="w-6 h-6" />
              <span className="absolute right-0 top-full mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Learn about our mortgage calculation and decision-making process
              </span>
            </button>
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

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by applicant name or property..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#158EC5] focus:border-[#158EC5]"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#158EC5] text-white text-xs rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['submitted', 'under_review', 'conditional', 'approved', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.status.includes(status)
                          ? 'bg-[#158EC5] text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qualification Score
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.qualificationScore.min || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        qualificationScore: { ...filters.qualificationScore, min: Number(e.target.value) || 0 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.qualificationScore.max === 100 ? '' : filters.qualificationScore.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        qualificationScore: { ...filters.qualificationScore, max: Number(e.target.value) || 100 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GDS Ratio (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.gdsRatio.min || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        gdsRatio: { ...filters.gdsRatio, min: Number(e.target.value) || 0 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.gdsRatio.max === 100 ? '' : filters.gdsRatio.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        gdsRatio: { ...filters.gdsRatio, max: Number(e.target.value) || 100 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TDS Ratio (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.tdsRatio.min || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        tdsRatio: { ...filters.tdsRatio, min: Number(e.target.value) || 0 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.tdsRatio.max === 100 ? '' : filters.tdsRatio.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        tdsRatio: { ...filters.tdsRatio, max: Number(e.target.value) || 100 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Amount Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.loanAmount.min || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        loanAmount: { ...filters.loanAmount, min: Number(e.target.value) || 0 }
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.loanAmount.max === 10000000 ? '' : filters.loanAmount.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        loanAmount: { ...filters.loanAmount, max: Number(e.target.value) || 10000000 }
                      })}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range - Start
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range - End
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredApplications.length} of {allApplications.length} applications
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Mortgage Applications
          </h2>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {allApplications.length === 0 ? 'No applications to display' : 'No applications match your filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Applicant</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Property</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Loan Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Score</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">TDS</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {app.first_name} {app.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.phone ? formatPhoneNumber(app.phone) : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{app.property?.title || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.property?.city}, {app.property?.region}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(Number(app.loan_amount))}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {app.qualification_score?.toFixed(0) || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {app.tds_ratio ? (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full ${getDSRBg(app.tds_ratio)}`}>
                            <span className={`text-sm font-semibold ${getDSRColor(app.tds_ratio)}`}>
                              {app.tds_ratio.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/mortgage-applications/${app.id}`)}
                          className="p-2 text-[#158EC5] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
