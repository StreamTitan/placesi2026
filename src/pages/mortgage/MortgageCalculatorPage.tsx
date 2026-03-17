import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MortgageCalculator, MortgageCalculation } from '../../components/mortgage/MortgageCalculator';
import type { Database } from '../../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export function MortgageCalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

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

  const handleApplyForMortgage = (calculation: MortgageCalculation) => {
    if (!user) {
      navigate('/login', {
        state: {
          returnTo: `/mortgage-calculator/${id}`,
          message: 'Please log in to apply for a mortgage'
        }
      });
      return;
    }

    navigate(`/mortgage-application/${id}`, {
      state: { calculation }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#158EC5] border-t-transparent"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-green-400 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2 dark:text-green-500" />
          Back
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-green-500 hover:text-[#158EC5] dark:hover:text-green-400 mb-4 sm:mb-6 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 mr-2 dark:text-green-500" />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {property.city}, {property.region}
          </p>
        </div>

        <MortgageCalculator
          propertyPrice={property.price}
          onApplyForMortgage={handleApplyForMortgage}
        />
      </div>
    </div>
  );
}
