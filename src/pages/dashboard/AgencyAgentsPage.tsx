import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteConfirmation } from '../../contexts/DeleteConfirmationContext';
import { fetchAgencyAgentsWithPerformance, removeAgentFromAgency, type AgentWithPerformance } from '../../services/agentManagement';
import { supabase } from '../../lib/supabase';
import { formatPhoneNumber } from '../../lib/formatters';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EditAgentModal } from '../../components/agents/EditAgentModal';
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  Eye,
  MessageSquare,
  Heart,
  CheckCircle,
  UserPlus,
  SortAsc,
  SortDesc,
} from 'lucide-react';

type SortField = 'name' | 'listings' | 'views' | 'contacts' | 'joinDate';
type SortDirection = 'asc' | 'desc';

export function AgencyAgentsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentWithPerformance[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentWithPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('joinDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingAgent, setEditingAgent] = useState<AgentWithPerformance | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const { showDeleteConfirmation } = useDeleteConfirmation();

  useEffect(() => {
    loadAgents();
  }, [profile]);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, sortField, sortDirection]);

  const loadAgents = async () => {
    if (!profile?.id) return;

    try {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id')
        .eq('created_by', profile.id)
        .single();

      if (agencyData) {
        setAgencyId(agencyData.id);
      }

      const agentsData = await fetchAgencyAgentsWithPerformance(profile.id);
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.full_name?.toLowerCase().includes(query) ||
        agent.phone?.toLowerCase().includes(query) ||
        agent.agentProfile?.email?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'listings':
          comparison = a.listingsCount - b.listingsCount;
          break;
        case 'views':
          comparison = a.totalViews - b.totalViews;
          break;
        case 'contacts':
          comparison = a.contactRequests - b.contactRequests;
          break;
        case 'joinDate':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredAgents(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEditClick = (agent: AgentWithPerformance) => {
    setEditingAgent(agent);
  };

  const handleDeleteClick = (agent: AgentWithPerformance) => {
    if (!agencyId) return;

    showDeleteConfirmation({
      title: 'Remove Agent from Agency',
      message: `Are you sure you want to remove ${agent.full_name} from your agency? This will disassociate them from your agency but will not delete their account or listings.`,
      itemName: agent.full_name || 'Agent',
      confirmText: 'Remove Agent',
      onConfirm: async () => {
        const success = await removeAgentFromAgency(agent.id, agencyId);
        if (success) {
          loadAgents();
        } else {
          alert('Failed to remove agent. Please try again.');
        }
      },
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="w-4 h-4 ml-1 inline" />
    ) : (
      <SortDesc className="w-4 h-4 ml-1 inline" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Agency Agents
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your team and track agent performance
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/agents/add')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Agent
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search agents by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {filteredAgents.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No agents found' : 'No agents yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search criteria' : 'Invite your first agent to get started with your agency.'}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      Agent <SortIcon field="name" />
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th
                      className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('listings')}
                    >
                      Listings <SortIcon field="listings" />
                    </th>
                    <th
                      className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('views')}
                    >
                      Total Views <SortIcon field="views" />
                    </th>
                    <th
                      className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('contacts')}
                    >
                      Contacts <SortIcon field="contacts" />
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Performance
                    </th>
                    <th
                      className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('joinDate')}
                    >
                      Joined <SortIcon field="joinDate" />
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.full_name || 'Agent'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <span className="text-sm font-semibold text-green-600">
                                {agent.full_name?.charAt(0) || 'A'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {agent.full_name || 'Unnamed Agent'}
                              </p>
                              {agent.is_verified && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            {agent.agentProfile?.years_experience && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {agent.agentProfile.years_experience} years exp.
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {agent.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3 mr-2" />
                              {formatPhoneNumber(agent.phone)}
                            </div>
                          )}
                          {agent.agentProfile?.email && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3 mr-2" />
                              {agent.agentProfile.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {agent.listingsCount}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-green-600" />
                              {agent.activeListings}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-blue-600" />
                              {agent.soldListings}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
                          <Eye className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold">{agent.totalViews.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
                          <MessageSquare className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold">{agent.contactRequests}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Heart className="w-3 h-3 text-red-500" />
                            {agent.favorites}
                          </div>
                          {agent.totalViews > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {((agent.contactRequests / agent.totalViews) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(agent.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(agent)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(agent)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredAgents.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {editingAgent && (
        <EditAgentModal
          isOpen={true}
          onClose={() => setEditingAgent(null)}
          agent={editingAgent}
          onSuccess={loadAgents}
        />
      )}
    </div>
  );
}
