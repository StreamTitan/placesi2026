import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Building2 } from 'lucide-react';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export function AgencyListingsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id')
        .eq('created_by', profile?.id)
        .single();

      if (!agencyData) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data: agentProfilesData } = await supabase
        .from('agent_profiles')
        .select('user_id')
        .eq('agency_id', agencyData.id);

      const agentIds = agentProfilesData?.map(ap => ap.user_id) || [];

      if (agentIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('listed_by', agentIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Listings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all property listings from your agents
          </p>
        </div>

        {properties.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No properties listed yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your agents haven't created any listings yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <PropertyRowCard
                key={property.id}
                property={property}
                onClick={() => navigate(`/property/${property.id}`, { state: { from: '/dashboard/listings' } })}
              />
            ))}
          </div>
        )}

        {properties.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
          </div>
        )}
      </div>
    </div>
  );
}
