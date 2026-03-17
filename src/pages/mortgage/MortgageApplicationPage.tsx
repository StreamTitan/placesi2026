import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { DocumentUpload } from '../../components/mortgage/DocumentUpload';
import { ConfettiSuccessModal } from '../../components/ui/ConfettiSuccessModal';
import { MortgageCalculation } from '../../components/mortgage/MortgageCalculator';
import { LoanDetailsPanel } from '../../components/mortgage/LoanDetailsPanel';
import { FinancialAssessmentPanel } from '../../components/mortgage/FinancialAssessmentPanel';
import { ApplicantFormPanels, type ApplicantData } from '../../components/mortgage/ApplicantFormPanels';
import { calculateDebtServiceRatios, calculateQualificationScore } from '../../utils/mortgageCalculations';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export function MortgageApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const calculation = location.state?.calculation as MortgageCalculation | undefined;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);

  const [applicant, setApplicant] = useState<ApplicantData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: profile?.phone || '',
    dateOfBirth: '',
    employmentStatus: 'employed',
    employerName: '',
    occupation: '',
    yearsEmployed: '',
    grossAnnualIncome: '',
    grossMonthlyIncome: '',
    otherIncome: '0',
    creditCardPayments: '0',
    carLoanPayments: '0',
    studentLoanPayments: '0',
    otherDebtPayments: '0',
  });

  const [coApplicant, setCoApplicant] = useState<ApplicantData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    employmentStatus: 'employed',
    employerName: '',
    occupation: '',
    yearsEmployed: '',
    grossAnnualIncome: '',
    grossMonthlyIncome: '',
    otherIncome: '0',
    creditCardPayments: '0',
    carLoanPayments: '0',
    studentLoanPayments: '0',
    otherDebtPayments: '0',
  });

  const [documents, setDocuments] = useState<{
    proofOfIncome: File | null;
    idDocument: File | null;
    jobLetter: File | null;
    bankStatement: File | null;
  }>({
    proofOfIncome: null,
    idDocument: null,
    jobLetter: null,
    bankStatement: null,
  });

  const [gdsRatio, setGdsRatio] = useState<number | null>(null);
  const [tdsRatio, setTdsRatio] = useState<number | null>(null);
  const [qualificationScore, setQualificationScore] = useState<number | null>(null);
  const [estimatedPropertyTax, setEstimatedPropertyTax] = useState<number>(0);
  const [estimatedHeating] = useState<number>(150);

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/mortgage-calculator/${id}`,
          message: 'Please log in to apply for a mortgage'
        }
      });
      return;
    }

    if (profile && (profile.role === 'agency' || profile.role === 'mortgage_institution')) {
      navigate('/');
      return;
    }

    if (!calculation) {
      navigate(`/mortgage-calculator/${id}`);
      return;
    }

    if (id) {
      fetchProperty(id);
    }
  }, [id, user, profile, calculation]);

  useEffect(() => {
    if (profile && user) {
      const nameParts = (profile.full_name || '').split(' ');
      setApplicant(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    calculateRatios();
  }, [applicant, coApplicant, calculation, hasCoApplicant]);

  const fetchProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRatios = () => {
    if (!calculation) return;

    const applicantIncome = parseFloat(applicant.grossMonthlyIncome) || 0;
    const applicantOtherIncome = parseFloat(applicant.otherIncome) || 0;
    const applicantDebts = {
      creditCardPayments: parseFloat(applicant.creditCardPayments) || 0,
      carLoanPayments: parseFloat(applicant.carLoanPayments) || 0,
      studentLoanPayments: parseFloat(applicant.studentLoanPayments) || 0,
      otherDebtPayments: parseFloat(applicant.otherDebtPayments) || 0,
    };

    if (applicantIncome === 0) {
      setGdsRatio(null);
      setTdsRatio(null);
      setQualificationScore(null);
      return;
    }

    const applicantFinancials = {
      grossMonthlyIncome: applicantIncome,
      otherIncome: applicantOtherIncome,
      ...applicantDebts,
    };

    const coApplicantFinancials = hasCoApplicant && parseFloat(coApplicant.grossMonthlyIncome) > 0 ? {
      grossMonthlyIncome: parseFloat(coApplicant.grossMonthlyIncome) || 0,
      otherIncome: parseFloat(coApplicant.otherIncome) || 0,
      creditCardPayments: parseFloat(coApplicant.creditCardPayments) || 0,
      carLoanPayments: parseFloat(coApplicant.carLoanPayments) || 0,
      studentLoanPayments: parseFloat(coApplicant.studentLoanPayments) || 0,
      otherDebtPayments: parseFloat(coApplicant.otherDebtPayments) || 0,
    } : undefined;

    const loanParams = {
      loanAmount: calculation.loanAmount,
      propertyPrice: calculation.propertyPrice,
      downPayment: calculation.downPayment,
      downPaymentPercent: (calculation.downPayment / calculation.propertyPrice) * 100,
      monthlyPayment: calculation.monthlyPayment,
      interestRate: calculation.interestRate,
      loanTermYears: calculation.loanTermYears,
    };

    const dsrResults = calculateDebtServiceRatios(applicantFinancials, loanParams, coApplicantFinancials);
    setGdsRatio(dsrResults.gdsRatio);
    setTdsRatio(dsrResults.tdsRatio);
    setEstimatedPropertyTax(dsrResults.estimatedPropertyTax);

    const totalGrossAnnualIncome = (parseFloat(applicant.grossAnnualIncome) || 0) +
                                   (hasCoApplicant ? (parseFloat(coApplicant.grossAnnualIncome) || 0) : 0);
    const yearsEmployed = parseFloat(applicant.yearsEmployed) || 0;

    const scoreBreakdown = calculateQualificationScore(
      dsrResults,
      loanParams.downPaymentPercent,
      yearsEmployed,
      totalGrossAnnualIncome,
      calculation.loanAmount
    );

    setQualificationScore(scoreBreakdown.totalScore);
  };

  const uploadDocument = async (file: File, applicationId: string, documentType: string): Promise<{ url: string; verified: boolean }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}/${documentType}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload ${documentType}: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    const { data: files } = await supabase.storage
      .from('property-images')
      .list(applicationId);

    const fileExists = files?.some(f => f.name.includes(documentType));

    return { url: publicUrl, verified: fileExists || false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !property || !calculation) {
      setError('Missing required information');
      return;
    }

    if (!documents.proofOfIncome || !documents.idDocument || !documents.jobLetter || !documents.bankStatement) {
      setError('Please upload all required documents (Proof of Income, ID Document, Job Letter, and Bank Statement)');
      return;
    }

    setSubmitting(true);

    try {
      const { data: application, error: appError } = await supabase
        .from('mortgage_applications')
        .insert({
          user_id: user.id,
          property_id: property.id,
          first_name: applicant.firstName,
          last_name: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
          date_of_birth: applicant.dateOfBirth || null,
          employment_status: applicant.employmentStatus,
          employer_name: applicant.employerName,
          occupation: applicant.occupation,
          years_employed: parseFloat(applicant.yearsEmployed) || 0,
          gross_annual_income: parseFloat(applicant.grossAnnualIncome) || 0,
          gross_monthly_income: parseFloat(applicant.grossMonthlyIncome) || 0,
          other_income: parseFloat(applicant.otherIncome) || 0,
          credit_card_payments: parseFloat(applicant.creditCardPayments) || 0,
          car_loan_payments: parseFloat(applicant.carLoanPayments) || 0,
          student_loan_payments: parseFloat(applicant.studentLoanPayments) || 0,
          other_debt_payments: parseFloat(applicant.otherDebtPayments) || 0,
          total_monthly_debts: totalMonthlyDebts,
          loan_amount: calculation.loanAmount,
          down_payment: calculation.downPayment,
          down_payment_percent: (calculation.downPayment / calculation.propertyPrice) * 100,
          monthly_payment: calculation.monthlyPayment,
          interest_rate: calculation.interestRate,
          loan_term_years: calculation.loanTermYears,
          total_interest: calculation.totalInterest,
          total_payable: calculation.totalPayment,
          financing_option: calculation.financingOption,
          property_address: `${property.city}, ${property.region}`,
          property_price: calculation.propertyPrice,
          property_type: property.property_type,
          gds_ratio: gdsRatio,
          tds_ratio: tdsRatio,
          ltv_ratio: (calculation.loanAmount / calculation.propertyPrice) * 100,
          qualification_score: qualificationScore,
          annual_income: parseFloat(applicant.grossAnnualIncome) || 0,
          monthly_debts: totalMonthlyDebts,
          status: 'submitted',
        })
        .select()
        .single();

      if (appError) throw appError;

      if (hasCoApplicant && coApplicant.firstName && coApplicant.lastName) {
        const coApplicantTotalDebts =
          (parseFloat(coApplicant.creditCardPayments) || 0) +
          (parseFloat(coApplicant.carLoanPayments) || 0) +
          (parseFloat(coApplicant.studentLoanPayments) || 0) +
          (parseFloat(coApplicant.otherDebtPayments) || 0);

        await supabase
          .from('co_applicants')
          .insert({
            application_id: application.id,
            first_name: coApplicant.firstName,
            last_name: coApplicant.lastName,
            email: coApplicant.email,
            phone: coApplicant.phone,
            date_of_birth: coApplicant.dateOfBirth || null,
            employment_status: coApplicant.employmentStatus,
            employer_name: coApplicant.employerName,
            occupation: coApplicant.occupation,
            years_employed: parseFloat(coApplicant.yearsEmployed) || 0,
            gross_annual_income: parseFloat(coApplicant.grossAnnualIncome) || 0,
            gross_monthly_income: parseFloat(coApplicant.grossMonthlyIncome) || 0,
            other_income: parseFloat(coApplicant.otherIncome) || 0,
            credit_card_payments: parseFloat(coApplicant.creditCardPayments) || 0,
            car_loan_payments: parseFloat(coApplicant.carLoanPayments) || 0,
            student_loan_payments: parseFloat(coApplicant.studentLoanPayments) || 0,
            other_debt_payments: parseFloat(coApplicant.otherDebtPayments) || 0,
            total_monthly_debts: coApplicantTotalDebts,
          });
      }

      const documentsToUpload = [];
      const verificationRecords = [];

      if (documents.proofOfIncome) {
        const { url, verified } = await uploadDocument(documents.proofOfIncome, application.id, 'proof_of_income');
        documentsToUpload.push({
          application_id: application.id,
          document_type: 'proof_of_income' as const,
          file_url: url,
          file_name: documents.proofOfIncome.name,
          file_size: documents.proofOfIncome.size,
          upload_status: 'verified' as const,
          verified_at: new Date().toISOString(),
        });
        verificationRecords.push({
          application_id: application.id,
          document_type: 'proof_of_income',
          upload_status: verified ? 'verified' : 'failed',
          file_url: url,
          file_name: documents.proofOfIncome.name,
          file_size: documents.proofOfIncome.size,
          verified_at: verified ? new Date().toISOString() : null,
        });
      }
      if (documents.idDocument) {
        const { url, verified } = await uploadDocument(documents.idDocument, application.id, 'id_document');
        documentsToUpload.push({
          application_id: application.id,
          document_type: 'id_document' as const,
          file_url: url,
          file_name: documents.idDocument.name,
          file_size: documents.idDocument.size,
          upload_status: 'verified' as const,
          verified_at: new Date().toISOString(),
        });
        verificationRecords.push({
          application_id: application.id,
          document_type: 'id_document',
          upload_status: verified ? 'verified' : 'failed',
          file_url: url,
          file_name: documents.idDocument.name,
          file_size: documents.idDocument.size,
          verified_at: verified ? new Date().toISOString() : null,
        });
      }
      if (documents.jobLetter) {
        const { url, verified } = await uploadDocument(documents.jobLetter, application.id, 'job_letter');
        documentsToUpload.push({
          application_id: application.id,
          document_type: 'job_letter' as const,
          file_url: url,
          file_name: documents.jobLetter.name,
          file_size: documents.jobLetter.size,
          upload_status: 'verified' as const,
          verified_at: new Date().toISOString(),
        });
        verificationRecords.push({
          application_id: application.id,
          document_type: 'job_letter',
          upload_status: verified ? 'verified' : 'failed',
          file_url: url,
          file_name: documents.jobLetter.name,
          file_size: documents.jobLetter.size,
          verified_at: verified ? new Date().toISOString() : null,
        });
      }
      if (documents.bankStatement) {
        const { url, verified } = await uploadDocument(documents.bankStatement, application.id, 'bank_statement');
        documentsToUpload.push({
          application_id: application.id,
          document_type: 'bank_statement' as const,
          file_url: url,
          file_name: documents.bankStatement.name,
          file_size: documents.bankStatement.size,
          upload_status: 'verified' as const,
          verified_at: new Date().toISOString(),
        });
        verificationRecords.push({
          application_id: application.id,
          document_type: 'bank_statement',
          upload_status: verified ? 'verified' : 'failed',
          file_url: url,
          file_name: documents.bankStatement.name,
          file_size: documents.bankStatement.size,
          verified_at: verified ? new Date().toISOString() : null,
        });
      }

      if (documentsToUpload.length > 0) {
        await supabase.from('application_documents').insert(documentsToUpload);
      }

      if (verificationRecords.length > 0) {
        await supabase.from('document_verification').insert(verificationRecords);
      }

      await supabase
        .from('mortgage_applications')
        .update({ documents_verified: true })
        .eq('id', application.id);

      setApplicationId(application.id);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#158EC5] border-t-transparent"></div>
      </div>
    );
  }

  if (!property || !calculation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Request</h2>
          <p className="text-gray-600 dark:text-gray-400">Please use the mortgage calculator first.</p>
        </div>
      </div>
    );
  }


  const totalMonthlyDebts =
    (parseFloat(applicant.creditCardPayments) || 0) +
    (parseFloat(applicant.carLoanPayments) || 0) +
    (parseFloat(applicant.studentLoanPayments) || 0) +
    (parseFloat(applicant.otherDebtPayments) || 0) +
    (hasCoApplicant ? (
      (parseFloat(coApplicant.creditCardPayments) || 0) +
      (parseFloat(coApplicant.carLoanPayments) || 0) +
      (parseFloat(coApplicant.studentLoanPayments) || 0) +
      (parseFloat(coApplicant.otherDebtPayments) || 0)
    ) : 0);

  const totalMonthlyIncome =
    (parseFloat(applicant.grossMonthlyIncome) || 0) +
    (parseFloat(applicant.otherIncome) || 0) +
    (hasCoApplicant ? (
      (parseFloat(coApplicant.grossMonthlyIncome) || 0) +
      (parseFloat(coApplicant.otherIncome) || 0)
    ) : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/mortgage-calculator/${id}`)}
          className="flex items-center text-gray-600 dark:text-green-500 hover:text-[#158EC5] dark:hover:text-green-400 mb-4 sm:mb-6 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Calculator
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Mortgage Application</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Complete the form below to apply for your mortgage
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <LoanDetailsPanel
            property={{
              title: property.title,
              city: property.city,
              region: property.region,
              property_category: property.property_category,
              property_general_type: property.property_general_type,
              property_style: property.property_style
            }}
            calculation={calculation}
          />

          <FinancialAssessmentPanel
            gdsRatio={gdsRatio}
            tdsRatio={tdsRatio}
            qualificationScore={qualificationScore}
            monthlyIncome={totalMonthlyIncome}
            monthlyPayment={calculation.monthlyPayment}
            estimatedPropertyTax={estimatedPropertyTax}
            estimatedHeating={estimatedHeating}
            totalMonthlyDebts={totalMonthlyDebts}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-1">
            <div className="bg-gradient-to-r from-[#158EC5] to-blue-600 text-white px-4 sm:px-6 py-3 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold">Primary Applicant Information</h2>
            </div>
            <div className="p-3 sm:p-5">
              <ApplicantFormPanels data={applicant} setData={setApplicant} isCoApplicant={false} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1">Co-Applicant (Optional)</h3>
              <button
                type="button"
                onClick={() => setHasCoApplicant(!hasCoApplicant)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors w-full sm:w-auto justify-center min-h-[44px] ${
                  hasCoApplicant
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'
                }`}
              >
                {hasCoApplicant ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Co-Applicant
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Co-Applicant
                  </>
                )}
              </button>
            </div>
            {!hasCoApplicant && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Adding a co-applicant with additional income can improve your qualification score and debt service ratios, potentially qualifying you for better terms.
                </p>
              </div>
            )}
          </div>

          {hasCoApplicant && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-1">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3 rounded-t-lg">
                <h2 className="text-lg sm:text-xl font-bold">Co-Applicant Information</h2>
              </div>
              <div className="p-3 sm:p-5">
                <ApplicantFormPanels data={coApplicant} setData={setCoApplicant} isCoApplicant={true} />
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Required Documents</h3>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Upload clear, readable copies of your documents. Accepted formats: PDF, JPG, PNG (max 10MB each).
              </p>
            </div>

            <DocumentUpload
              label="Proof of Income (Required)"
              required
              file={documents.proofOfIncome}
              onFileSelect={(file) => setDocuments({ ...documents, proofOfIncome: file })}
            />

            <DocumentUpload
              label="ID Document (Required)"
              required
              file={documents.idDocument}
              onFileSelect={(file) => setDocuments({ ...documents, idDocument: file })}
            />

            <DocumentUpload
              label="Job Letter (Required)"
              required
              file={documents.jobLetter}
              onFileSelect={(file) => setDocuments({ ...documents, jobLetter: file })}
            />

            <DocumentUpload
              label="Bank Statement (Required)"
              required
              file={documents.bankStatement}
              onFileSelect={(file) => setDocuments({ ...documents, bankStatement: file })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/mortgage-calculator/${id}`)}
              className="flex-1 min-h-[48px] text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !documents.proofOfIncome || !documents.idDocument || !documents.jobLetter || !documents.bankStatement}
              className="flex-1 bg-[#158EC5] hover:bg-[#1178a3] min-h-[48px] text-sm sm:text-base"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>

      <ConfettiSuccessModal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          navigate('/my-mortgage-applications');
        }}
        title="Application Successfully Submitted!"
        message="Your mortgage application has been submitted and is now under review. A mortgage specialist will review your information and contact you with updates."
        applicationId={applicationId?.slice(0, 8)}
      />
    </div>
  );
}
