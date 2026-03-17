import { ArrowLeft, Calculator, TrendingUp, CheckCircle, AlertCircle, DollarSign, FileText, Brain, BarChart3, Home, Users, CreditCard, Briefcase, Clock, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { ParameterEditor } from '../../components/mortgage/ParameterEditor';

export function MortgageDecisionInfoPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showEditor, setShowEditor] = useState(false);

  const isMortgageInstitution = profile?.role === 'mortgage_institution';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80')",
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Mortgage Calculation & Decision Making Guide
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Understanding our automated mortgage approval system, calculation methodologies, and decision criteria
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isMortgageInstitution && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-[#158EC5]/10 to-blue-600/10 border-2 border-[#158EC5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#158EC5]" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parameter Control Panel</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize your institution's calculation parameters</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="px-4 py-2 bg-[#158EC5] hover:bg-[#1178a3] text-white rounded-lg font-medium transition-colors"
              >
                {showEditor ? 'Hide Editor' : 'Edit Parameters'}
              </button>
            </div>
          </Card>
        )}

        {isMortgageInstitution && showEditor && profile?.id && (
          <div className="mb-8">
            <ParameterEditor
              institutionId={profile.id}
              onParametersUpdated={() => {
                console.log('Parameters updated');
              }}
            />
          </div>
        )}

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => scrollToSection('overview')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">System Overview</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">How our system works</p>
            </button>
            <button
              onClick={() => scrollToSection('gds')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">GDS Ratio</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gross Debt Service calculation</p>
            </button>
            <button
              onClick={() => scrollToSection('tds')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">TDS Ratio</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Debt Service calculation</p>
            </button>
            <button
              onClick={() => scrollToSection('qualification')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">Qualification Score</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">How we score applications</p>
            </button>
            <button
              onClick={() => scrollToSection('financing')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">Financing Options</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interest rates and terms</p>
            </button>
            <button
              onClick={() => scrollToSection('decision')}
              className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <p className="font-semibold text-[#158EC5]">Decision Process</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automated approval workflow</p>
            </button>
          </div>
        </Card>

        <section id="overview" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Automated Assessment</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our mortgage approval system uses advanced algorithms to analyze applications based on established financial principles and lending standards. The system evaluates multiple factors to provide instant preliminary assessments.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Real-time calculation of debt service ratios</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Comprehensive qualification scoring</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Transparent criteria based on industry standards</p>
                </div>
              </div>
            </Card>
            <div
              className="rounded-xl bg-cover bg-center min-h-[300px]"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80')",
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-gray-900/80 to-transparent rounded-xl flex items-end p-6">
                <p className="text-white font-semibold text-lg">Data-Driven Decision Making</p>
              </div>
            </div>
          </div>
        </section>

        <section id="gds" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gross Debt Service (GDS) Ratio</h2>
          </div>
          <Card className="p-8 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What is GDS?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The Gross Debt Service ratio measures the percentage of your monthly income that goes toward housing costs. This includes your mortgage payment, property taxes, and heating costs.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Formula:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    GDS = (Monthly Payment + Property Tax + Heating) / Monthly Income × 100
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤28%: Excellent</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤32%: Good (Standard threshold)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤35%: Fair</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">&gt;35%: High Risk</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Calculation</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Mortgage Payment:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$3,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Property Tax (monthly):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Heating (estimated):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$150</span>
                  </div>
                  <div className="border-t border-green-300 dark:border-green-700 pt-2 flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Housing Costs:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$3,900</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Income:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$12,500</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">GDS Ratio:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">31.2%</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Within acceptable range</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div
            className="rounded-xl bg-cover bg-center h-64"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80')",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-gray-900/90 to-transparent rounded-xl flex items-center p-8">
              <div className="max-w-md">
                <h4 className="text-white text-xl font-bold mb-2">Housing Affordability</h4>
                <p className="text-gray-200 text-sm">GDS ensures borrowers can comfortably afford their housing expenses without financial strain.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="tds" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Total Debt Service (TDS) Ratio</h2>
          </div>
          <Card className="p-8 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What is TDS?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The Total Debt Service ratio measures the percentage of your monthly income that goes toward all debt obligations, including housing costs plus other debts like credit cards, car loans, and student loans.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Formula:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    TDS = (Housing Costs + All Other Debts) / Monthly Income × 100
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤35%: Excellent</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤40%: Good (Standard threshold)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">≤44%: Fair</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">&gt;44%: High Risk</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Calculation</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Housing Costs:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$3,900</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Credit Card Payments:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Car Loan:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Student Loan:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$300</span>
                  </div>
                  <div className="border-t border-blue-300 dark:border-blue-700 pt-2 flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Obligations:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$4,850</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Income:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$12,500</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">TDS Ratio:</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">38.8%</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">✓ Within acceptable range</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Why TDS Matters</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  TDS provides a comprehensive view of an applicant's debt burden. Even if housing costs are manageable, high overall debt can indicate financial stress and increased default risk. Lenders use this to ensure borrowers have adequate disposable income.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section id="qualification" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Qualification Score System</h2>
          </div>
          <Card className="p-8 mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our qualification score is a comprehensive assessment ranging from 0-100 that evaluates multiple financial factors. Higher scores indicate stronger applications with better approval likelihood.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">GDS Component</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Up to 20 points</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">≤28%: 20 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≤32%: 15 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≤35%: 10 points</p>
                  <p className="text-gray-700 dark:text-gray-300">&gt;35%: 5 points</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">TDS Component</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Up to 20 points</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">≤35%: 20 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≤40%: 15 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≤44%: 10 points</p>
                  <p className="text-gray-700 dark:text-gray-300">&gt;44%: 5 points</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Down Payment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Up to 25 points</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">≥20%: 25 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≥15%: 20 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≥10%: 15 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≥5%: 10 points</p>
                  <p className="text-gray-700 dark:text-gray-300">&lt;5%: 5 points</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <Briefcase className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Employment History</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Up to 20 points</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">≥5 years: 20 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≥3 years: 15 points</p>
                  <p className="text-gray-700 dark:text-gray-300">≥1 year: 10 points</p>
                  <p className="text-gray-700 dark:text-gray-300">&lt;1 year: 5 points</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
                <Users className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Income to Loan Ratio</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Up to 15 points</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">Loan/Income &lt;3: 15 pts</p>
                  <p className="text-gray-700 dark:text-gray-300">Loan/Income &lt;4: 10 pts</p>
                  <p className="text-gray-700 dark:text-gray-300">Loan/Income &lt;5: 5 pts</p>
                  <p className="text-gray-700 dark:text-gray-300">Loan/Income ≥5: 0 pts</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Score Categories</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Final Rating</p>
                <div className="space-y-1 text-xs">
                  <p className="text-green-700 dark:text-green-300">80-100: Excellent</p>
                  <p className="text-blue-700 dark:text-blue-300">65-79: Good</p>
                  <p className="text-yellow-700 dark:text-yellow-300">50-64: Fair</p>
                  <p className="text-red-700 dark:text-red-300">&lt;50: Poor</p>
                </div>
              </div>
            </div>
          </Card>
          <div
            className="rounded-xl bg-cover bg-center h-64"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80')",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-gray-900/90 to-transparent rounded-xl flex items-center p-8">
              <div className="max-w-md">
                <h4 className="text-white text-xl font-bold mb-2">Comprehensive Assessment</h4>
                <p className="text-gray-200 text-sm">Multiple factors ensure fair evaluation of each applicant's financial situation and ability to repay.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="financing" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financing Options & Interest Rates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">≤80% Financing</h3>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">4.5%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Down Payment: 20% or more</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">Lowest interest rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">No mortgage insurance required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">Better approval odds</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">80-95% Financing</h3>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">5.0%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Down Payment: 10-20%</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Moderate interest rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Mortgage insurance may apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Popular choice for buyers</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">95-99% Financing</h3>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">5.5%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Down Payment: 5-10%</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 dark:text-gray-300">Higher interest rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 dark:text-gray-300">Mortgage insurance required</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 dark:text-gray-300">Stricter qualification</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">100% Financing</h3>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">6.0%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Down Payment: 0% (No down payment)</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">Highest interest rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">Significant insurance costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">Most stringent approval</span>
                </div>
              </div>
            </Card>
          </div>
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-4">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Loan Terms Available</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  We offer flexible loan terms to suit your financial situation: 5, 10, 15, 20, 25, 30, and 35 years. Shorter terms mean higher monthly payments but less total interest paid. Longer terms reduce monthly payments but increase total interest costs.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section id="decision" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-[#158EC5]" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Automated Decision Process</h2>
          </div>
          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#158EC5] text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Application Submission</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Applicant completes the mortgage application form with personal information, employment details, income, debts, and uploads required documentation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#158EC5] text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Automated Calculation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The system instantly calculates GDS ratio, TDS ratio, LTV ratio, and generates a comprehensive qualification score based on all submitted financial data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#158EC5] text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Assessment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The algorithm evaluates risk factors including debt ratios, employment stability, income adequacy, and down payment percentage to determine approval likelihood.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#158EC5] text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Preliminary Classification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Applications are automatically classified as Strong (score ≥80), Good (65-79), Fair (50-64), or Needs Review (&lt;50) based on the qualification score.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#158EC5] text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Human Review</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All applications undergo review by mortgage specialists who verify documentation, assess special circumstances, and make final approval decisions. The automated assessment serves as guidance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Final Decision</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Applicants receive notification of approval status (Approved, Conditional, or Declined) with detailed explanation. Approved loans proceed to closing process.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <div
            className="rounded-xl bg-cover bg-center h-64"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80')",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-gray-900/90 to-transparent rounded-xl flex items-center p-8">
              <div className="max-w-md">
                <h4 className="text-white text-xl font-bold mb-2">Speed Meets Accuracy</h4>
                <p className="text-gray-200 text-sm">Our automated system provides instant preliminary assessments while maintaining thorough human oversight for final decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="p-8 bg-gradient-to-br from-[#158EC5]/10 to-blue-600/10 border-2 border-[#158EC5]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Additional Considerations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#158EC5]" />
                Property Tax Estimation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The system estimates property tax at 1.25% of property value annually (divided by 12 for monthly). Actual taxes may vary by location and property type.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#158EC5]" />
                Heating Costs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A standard estimate of $150/month is used for heating costs in all calculations. This is an industry-standard assumption for GDS calculations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#158EC5]" />
                Co-Applicants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adding a co-applicant combines both incomes and debts in calculations. This can significantly improve ratios and qualification scores when both applicants have stable income.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#158EC5]" />
                Required Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All applications must include proof of income, ID documents, job letters, and bank statements. Missing documentation delays processing and approval.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#158EC5] hover:bg-[#1178a3] text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
