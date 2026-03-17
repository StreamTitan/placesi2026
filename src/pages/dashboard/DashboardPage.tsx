import { useAuth } from '../../contexts/AuthContext';
import { AgentDashboard } from './AgentDashboard';
import { AgencyDashboard } from './AgencyDashboard';
import { MortgageInstitutionDashboard } from './MortgageInstitutionDashboard';
import { ContractorDashboard } from './ContractorDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" />;
  }

  switch (profile.role) {
    case 'agent':
      return <AgentDashboard />;
    case 'agency':
      return <AgencyDashboard />;
    case 'mortgage_institution':
      return <MortgageInstitutionDashboard />;
    case 'contractor':
      return <ContractorDashboard />;
    default:
      return <Navigate to="/" />;
  }
}
