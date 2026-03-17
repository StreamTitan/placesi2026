import { Link } from 'react-router-dom';
import { Building2, FileText, CheckCircle2, CreditCard, TrendingUp, Shield, Clock, Users, Calculator, Home as HomeIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function MortgagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Your Path to Homeownership
            </h1>
            <p className="text-xl text-green-50 max-w-3xl mx-auto mb-8">
              Simplifying mortgage applications with cutting-edge technology and trusted financial partners.
              Get pre-qualified in minutes and find your dream home with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <Button size="lg" className="bg-white dark:bg-white text-green-600 dark:text-green-600 hover:bg-gray-50 dark:hover:bg-gray-100">
                  <Calculator className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
              </Link>
              <Link to="/agents">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Users className="w-5 h-5 mr-2" />
                  Find an Agent
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How Our Mortgage Process Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We've streamlined the mortgage application process to make your homeownership journey as smooth as possible
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 dark:border-gray-700 h-full">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl mb-4">
                  <HomeIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Find Your Property
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Browse our extensive property listings and use our advanced search filters to find your perfect home.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 dark:border-gray-700 h-full">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                  <Calculator className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Calculate Affordability
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Use our intelligent mortgage calculator to determine your monthly payments and affordability range.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 dark:border-gray-700 h-full">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4">
                  <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Submit Application
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Complete a simple application form and upload required documents securely through our platform.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 dark:border-gray-700 h-full">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  4
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Get Approved
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our partner institutions review your application and provide quick pre-approval decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Placesi for Your Mortgage?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We partner with leading financial institutions to offer you the best mortgage solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Fast Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get pre-qualified in minutes with our streamlined digital application process
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Secure & Confidential
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your financial information is encrypted and protected with bank-level security
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Competitive Rates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access exclusive rates from multiple lenders to find your best deal
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-4">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Expert Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our real estate agents guide you through every step of the mortgage process
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mb-4">
                <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Flexible Options
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from various mortgage products tailored to your financial situation
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4">
                <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Trusted Partners
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Work with reputable mortgage institutions with proven track records
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Mortgage Journey?
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Browse properties, calculate your affordability, and connect with our trusted mortgage partners today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-white dark:bg-white text-green-600 dark:text-green-600 hover:bg-gray-50 dark:hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Link to="/agents">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact an Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
