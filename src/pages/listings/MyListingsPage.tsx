import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteConfirmation } from '../../contexts/DeleteConfirmationContext';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Eye, Trash2, ArrowLeft, CheckCircle, Home, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkAsSoldRentedModal } from '../../components/property/MarkAsSoldRentedModal';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type StatusFilter = 'all' | 'sold' | 'rented';

export function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showDeleteConfirmation } = useDeleteConfirmation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [markAsMode, setMarkAsMode] = useState<'sold' | 'rented' | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listed_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, propertyTitle: string) => {
    showDeleteConfirmation({
      title: 'Delete Property Listing',
      message: 'Are you sure you want to delete this property listing? This action cannot be undone.',
      itemName: propertyTitle,
      confirmText: 'Delete Listing',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
          console.error('Error deleting property:', error);
          alert('Failed to delete listing. Please try again.');
        }
      },
    });
  };

  const handleMarkAs = (property: Property, mode: 'sold' | 'rented') => {
    setSelectedProperty(property);
    setMarkAsMode(mode);
  };

  const handleConfirmMarkAs = async (finalPrice: number) => {
    if (!selectedProperty || !markAsMode) return;

    const updateData: any = {
      status: 'sold',
      sold_price: finalPrice,
      updated_at: new Date().toISOString(),
    };

    if (markAsMode === 'sold') {
      updateData.sold_at = new Date().toISOString();
    } else {
      updateData.rented_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', selectedProperty.id);

    if (error) {
      throw error;
    }

    setProperties(
      properties.map((p) =>
        p.id === selectedProperty.id
          ? { ...p, ...updateData }
          : p
      )
    );
  };

  const getFilteredProperties = () => {
    if (statusFilter === 'all') {
      return properties;
    } else if (statusFilter === 'sold') {
      return properties.filter(p => p.status === 'sold' && p.sold_at && !p.rented_at);
    } else if (statusFilter === 'rented') {
      return properties.filter(p => p.status === 'sold' && p.rented_at);
    }
    return properties;
  };

  const filteredProperties = getFilteredProperties();

  const getEmptyStateMessage = () => {
    if (statusFilter === 'sold') {
      return {
        title: 'No sold properties yet',
        description: 'Properties marked as sold will appear here'
      };
    } else if (statusFilter === 'rented') {
      return {
        title: 'No rented properties yet',
        description: 'Properties marked as rented will appear here'
      };
    }
    return {
      title: 'No listings yet',
      description: 'Start by creating your first property listing'
    };
  };

  const emptyState = getEmptyStateMessage();

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
        <Button
          variant="outline"
          onClick={() => navigate('/agent-panel')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Listings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your property listings
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none cursor-pointer font-medium"
                style={{ minWidth: '160px' }}
              >
                <option value="all">All Listings</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <Button
              onClick={() => navigate('/my-listings/new')}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Listing
            </Button>
          </div>
        </div>

        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your first property listing
            </p>
            <Button onClick={() => navigate('/my-listings/new')}>
              Create Your First Listing
            </Button>
          </Card>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {emptyState.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {emptyState.description}
            </p>
            <Button onClick={() => setStatusFilter('all')} variant="outline">
              View All Listings
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        property.status === 'active'
                          ? 'bg-green-500 text-white'
                          : property.status === 'sold'
                          ? 'bg-blue-500 text-white'
                          : property.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {property.title}
                  </h3>
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-green-600">
                      ${property.price.toLocaleString()}
                    </p>
                    {property.sold_price && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Final: ${property.sold_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/property/${property.id}`, { state: { from: '/my-listings' } })}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {property.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/my-listings/edit/${property.id}`)}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id, property.title)}
                        className="flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {property.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAs(property, property.listing_type === 'rent' ? 'rented' : 'sold')}
                          className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as {property.listing_type === 'rent' ? 'Rented' : 'Sold'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProperty && markAsMode && (
        <MarkAsSoldRentedModal
          isOpen={true}
          onClose={() => {
            setSelectedProperty(null);
            setMarkAsMode(null);
          }}
          onConfirm={handleConfirmMarkAs}
          propertyTitle={selectedProperty.title}
          askingPrice={selectedProperty.price}
          mode={markAsMode}
        />
      )}
    </div>
  );
}
