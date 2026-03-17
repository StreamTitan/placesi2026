import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DeleteConfirmationProvider } from './contexts/DeleteConfirmationContext';
import { MainLayout } from './components/layout/MainLayout';
import { Header } from './components/layout/Header';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ChatPage } from './pages/chat/ChatPage';
import { SearchPage } from './pages/search/SearchPage';
import { PropertyDetailsPage } from './pages/property/PropertyDetailsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FavoritesPage } from './pages/favorites/FavoritesPage';
import { AgencyAgentsPage } from './pages/dashboard/AgencyAgentsPage';
import { AddAgentPage } from './pages/dashboard/AddAgentPage';
import { AgencyListingsPage } from './pages/dashboard/AgencyListingsPage';
import { AgencyAboutPage } from './pages/dashboard/AgencyAboutPage';
import { AgencyAnalyticsPage } from './pages/dashboard/AgencyAnalyticsPage';
import { AgentAboutPage } from './pages/dashboard/AgentAboutPage';
import { AgentsPage } from './pages/agents/AgentsPage';
import { AgentDetailsPage } from './pages/agents/AgentDetailsPage';
import { AgenciesPage } from './pages/agencies/AgenciesPage';
import { AgencyDetailsPage } from './pages/agencies/AgencyDetailsPage';
import { MyListingsPage } from './pages/listings/MyListingsPage';
import { AddListingPage } from './pages/listings/AddListingPage';
import { EditListingPage } from './pages/listings/EditListingPage';
import { AgentPanelPage } from './pages/dashboard/AgentPanelPage';
import { MortgageCalculatorPage } from './pages/mortgage/MortgageCalculatorPage';
import { MortgageApplicationPage } from './pages/mortgage/MortgageApplicationPage';
import { MortgagePage } from './pages/mortgage/MortgagePage';
import { MortgageDecisionInfoPage } from './pages/mortgage/MortgageDecisionInfoPage';
import { MyMortgageApplicationsPage } from './pages/mortgage/MyMortgageApplicationsPage';
import { MyMortgageApplicationDetailPage } from './pages/mortgage/MyMortgageApplicationDetailPage';
import { ContactRequestsPage } from './pages/dashboard/ContactRequestsPage';
import { MortgageApplicationDetailPage } from './pages/dashboard/MortgageApplicationDetailPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/legal/TermsOfServicePage';
import { ContractorsDirectoryPage } from './pages/contractors/ContractorsDirectoryPage';
import { ContractorProfilePage } from './pages/contractors/ContractorProfilePage';
import { ContractorProfileEditPage } from './pages/contractors/ContractorProfileEditPage';
import { ContractorSpecialsPage } from './pages/contractors/ContractorSpecialsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/chat"
          element={
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
              <Header />
              <ChatPage />
            </div>
          }
        />

        <Route
          path="/search"
          element={
            <MainLayout>
              <SearchPage />
            </MainLayout>
          }
        />

        <Route
          path="/property/:id"
          element={
            <MainLayout>
              <PropertyDetailsPage />
            </MainLayout>
          }
        />

        <Route
          path="/agents"
          element={
            <MainLayout>
              <AgentsPage />
            </MainLayout>
          }
        />

        <Route
          path="/agents/:id"
          element={
            <MainLayout>
              <AgentDetailsPage />
            </MainLayout>
          }
        />

        <Route
          path="/agencies"
          element={
            <MainLayout>
              <AgenciesPage />
            </MainLayout>
          }
        />

        <Route
          path="/agencies/:id"
          element={
            <MainLayout>
              <AgencyDetailsPage />
            </MainLayout>
          }
        />

        <Route
          path="/mortgage"
          element={
            <MainLayout>
              <MortgagePage />
            </MainLayout>
          }
        />

        <Route
          path="/mortgage-decision-info"
          element={
            <MainLayout>
              <MortgageDecisionInfoPage />
            </MainLayout>
          }
        />

        <Route
          path="/mortgage-calculator/:id"
          element={
            <MainLayout>
              <MortgageCalculatorPage />
            </MainLayout>
          }
        />

        <Route
          path="/mortgage-application/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MortgageApplicationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-mortgage-applications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyMortgageApplicationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-mortgage-applications/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyMortgageApplicationDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyListingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddListingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings/edit/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditListingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                  <p className="text-gray-600 mt-4">Analytics and insights coming soon...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">Admin Panel</h1>
                  <p className="text-gray-600 mt-4">Admin controls coming soon...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-panel"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgentPanelPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-panel/about"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgentAboutPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/agents"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgencyAgentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/agents/add"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddAgentPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/listings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgencyListingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/about"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgencyAboutPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AgencyAnalyticsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FavoritesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact-requests"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContactRequestsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/mortgage-applications/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MortgageApplicationDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/privacy"
          element={
            <MainLayout>
              <PrivacyPolicyPage />
            </MainLayout>
          }
        />

        <Route
          path="/terms"
          element={
            <MainLayout>
              <TermsOfServicePage />
            </MainLayout>
          }
        />

        <Route
          path="/contractors"
          element={
            <MainLayout>
              <ContractorsDirectoryPage />
            </MainLayout>
          }
        />

        <Route
          path="/contractor/:id"
          element={
            <MainLayout>
              <ContractorProfilePage />
            </MainLayout>
          }
        />

        <Route
          path="/contractor-profile-edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContractorProfileEditPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contractor-specials"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContractorSpecialsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <DeleteConfirmationProvider>
        <AppRoutes />
      </DeleteConfirmationProvider>
    </AuthProvider>
  );
}

export default App;
