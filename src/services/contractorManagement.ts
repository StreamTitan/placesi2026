import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contractor = Database['public']['Tables']['contractors']['Row'];
type ContractorInsert = Database['public']['Tables']['contractors']['Insert'];
type ContractorUpdate = Database['public']['Tables']['contractors']['Update'];
type ContractorListing = Database['public']['Tables']['contractor_listings']['Row'];
type ContractorListingInsert = Database['public']['Tables']['contractor_listings']['Insert'];
type ContractorListingUpdate = Database['public']['Tables']['contractor_listings']['Update'];
type ContractorSpecial = Database['public']['Tables']['contractor_specials']['Row'];
type ContractorSpecialInsert = Database['public']['Tables']['contractor_specials']['Insert'];
type ContractorAnalytics = Database['public']['Tables']['contractor_analytics']['Row'];

export interface ContractorWithProfile extends Contractor {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  active_specials_count?: number;
  total_views?: number;
}

export interface ContractorSearchFilters {
  category?: string;
  serviceArea?: string;
  searchQuery?: string;
  verifiedOnly?: boolean;
  minYearsInBusiness?: number;
  hasCertifications?: boolean;
  employeeCountRange?: 'small' | 'medium' | 'large';
  averageJobSize?: string;
  residentialOrCommercial?: 'residential' | 'commercial' | 'both';
}

export async function createContractor(
  userId: string,
  contractorData: Omit<ContractorInsert, 'user_id' | 'trial_start_date' | 'subscription_status'>
): Promise<{ contractor: Contractor; listing: ContractorListing } | null> {
  try {
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .insert({
        user_id: userId,
        ...contractorData,
        trial_start_date: new Date().toISOString(),
        subscription_status: 'trial'
      })
      .select()
      .single();

    if (contractorError) throw contractorError;

    const { data: listing, error: listingError } = await supabase
      .from('contractor_listings')
      .insert({
        contractor_id: contractor.id,
        title: contractorData.company_name,
        description: contractorData.description || '',
        categories: [contractorData.primary_category],
        is_visible: true
      })
      .select()
      .single();

    if (listingError) throw listingError;

    return { contractor, listing };
  } catch (error) {
    console.error('Error creating contractor:', error);
    return null;
  }
}

export async function getContractorByUserId(userId: string): Promise<Contractor | null> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching contractor by user ID:', error);
    return null;
  }
}

export async function getContractorById(contractorId: string): Promise<ContractorWithProfile | null> {
  try {
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', contractorId)
      .maybeSingle();

    if (contractorError) throw contractorError;
    if (!contractor) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', contractor.user_id)
      .maybeSingle();

    const { data: specials } = await supabase
      .from('contractor_specials')
      .select('id')
      .eq('contractor_id', contractorId)
      .gte('end_date', new Date().toISOString().split('T')[0]);

    const { data: analytics } = await supabase
      .from('contractor_analytics')
      .select('views_count')
      .eq('contractor_id', contractorId);

    const totalViews = analytics?.reduce((sum, a) => sum + a.views_count, 0) || 0;

    return {
      ...contractor,
      full_name: profile?.full_name || undefined,
      avatar_url: profile?.avatar_url || undefined,
      active_specials_count: specials?.length || 0,
      total_views: totalViews
    };
  } catch (error) {
    console.error('Error fetching contractor:', error);
    return null;
  }
}

export async function updateContractor(
  contractorId: string,
  updates: ContractorUpdate
): Promise<Contractor | null> {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contractorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contractor:', error);
    return null;
  }
}

export async function searchContractors(
  filters: ContractorSearchFilters
): Promise<ContractorWithProfile[]> {
  try {
    let query = supabase
      .from('contractors')
      .select(`
        *,
        contractor_listings!inner(is_visible)
      `)
      .eq('contractor_listings.is_visible', true);

    if (filters.category) {
      query = query.or(`primary_category.eq.${filters.category},additional_categories.cs.{${filters.category}}`);
    }

    if (filters.serviceArea) {
      query = query.contains('service_areas', [filters.serviceArea]);
    }

    if (filters.searchQuery) {
      query = query.or(`company_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    if (filters.minYearsInBusiness !== undefined) {
      query = query.gte('years_in_business', filters.minYearsInBusiness);
    }

    if (filters.hasCertifications) {
      query = query.not('certifications', 'is', null);
    }

    if (filters.employeeCountRange) {
      if (filters.employeeCountRange === 'small') {
        query = query.lte('employees_count', 10);
      } else if (filters.employeeCountRange === 'medium') {
        query = query.gte('employees_count', 11).lte('employees_count', 50);
      } else if (filters.employeeCountRange === 'large') {
        query = query.gte('employees_count', 51);
      }
    }

    if (filters.averageJobSize) {
      query = query.eq('average_job_size', filters.averageJobSize);
    }

    if (filters.residentialOrCommercial && filters.residentialOrCommercial !== 'both') {
      query = query.eq('residential_or_commercial', filters.residentialOrCommercial);
    }

    const { data: contractors, error } = await query;

    if (error) throw error;

    if (!contractors || contractors.length === 0) return [];

    const userIds = contractors.map(c => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const contractorIds = contractors.map(c => c.id);
    const { data: specialsCounts } = await supabase
      .from('contractor_specials')
      .select('contractor_id')
      .in('contractor_id', contractorIds)
      .gte('end_date', new Date().toISOString().split('T')[0]);

    const specialsMap = specialsCounts?.reduce((acc, s) => {
      acc[s.contractor_id] = (acc[s.contractor_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const { data: analytics } = await supabase
      .from('contractor_analytics')
      .select('contractor_id, views_count')
      .in('contractor_id', contractorIds);

    const viewsMap = analytics?.reduce((acc, a) => {
      acc[a.contractor_id] = (acc[a.contractor_id] || 0) + a.views_count;
      return acc;
    }, {} as Record<string, number>) || {};

    const contractorsWithProfiles = contractors.map(contractor => {
      const profile = profiles?.find(p => p.id === contractor.user_id);
      const totalViews = viewsMap[contractor.id];
      return {
        ...contractor,
        full_name: profile?.full_name || undefined,
        avatar_url: profile?.avatar_url || undefined,
        active_specials_count: specialsMap[contractor.id] || 0,
        ...(totalViews && totalViews > 0 ? { total_views: totalViews } : {})
      };
    });

    return contractorsWithProfiles;
  } catch (error) {
    console.error('Error searching contractors:', error);
    return [];
  }
}

export async function getContractorListing(contractorId: string): Promise<ContractorListing | null> {
  try {
    const { data, error } = await supabase
      .from('contractor_listings')
      .select('*')
      .eq('contractor_id', contractorId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching contractor listing:', error);
    return null;
  }
}

export async function updateContractorListing(
  listingId: string,
  updates: ContractorListingUpdate
): Promise<ContractorListing | null> {
  try {
    const { data, error } = await supabase
      .from('contractor_listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contractor listing:', error);
    return null;
  }
}

export async function getContractorSpecials(contractorId: string): Promise<ContractorSpecial[]> {
  try {
    const { data, error } = await supabase
      .from('contractor_specials')
      .select('*')
      .eq('contractor_id', contractorId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contractor specials:', error);
    return [];
  }
}

export async function getActiveSpecials(contractorId: string): Promise<ContractorSpecial[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('contractor_specials')
      .select('*')
      .eq('contractor_id', contractorId)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active specials:', error);
    return [];
  }
}

export async function createContractorSpecial(
  specialData: ContractorSpecialInsert
): Promise<ContractorSpecial | null> {
  try {
    const { data, error } = await supabase
      .from('contractor_specials')
      .insert(specialData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating contractor special:', error);
    return null;
  }
}

export async function updateContractorSpecial(
  specialId: string,
  updates: Partial<ContractorSpecialInsert>
): Promise<ContractorSpecial | null> {
  try {
    const { data, error } = await supabase
      .from('contractor_specials')
      .update(updates)
      .eq('id', specialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contractor special:', error);
    return null;
  }
}

export async function deleteContractorSpecial(specialId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contractor_specials')
      .delete()
      .eq('id', specialId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting contractor special:', error);
    return false;
  }
}

export async function trackContractorView(contractorId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_contractor_views', {
      contractor_uuid: contractorId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking contractor view:', error);
  }
}

export async function trackContractorClick(
  contractorId: string,
  clickType: 'call' | 'whatsapp' | 'email' | 'website' | 'social'
): Promise<void> {
  try {
    const { error } = await supabase.rpc('track_contractor_click', {
      contractor_uuid: contractorId,
      click_type: clickType
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking contractor click:', error);
  }
}

export async function getContractorAnalytics(
  contractorId: string,
  startDate?: string,
  endDate?: string
): Promise<ContractorAnalytics[]> {
  try {
    let query = supabase
      .from('contractor_analytics')
      .select('*')
      .eq('contractor_id', contractorId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contractor analytics:', error);
    return [];
  }
}

export async function getContractorAnalyticsSummary(contractorId: string) {
  try {
    const { data, error } = await supabase
      .from('contractor_analytics')
      .select('*')
      .eq('contractor_id', contractorId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_views: 0,
        total_calls: 0,
        total_whatsapp: 0,
        total_email: 0,
        total_website: 0,
        total_social: 0,
        total_clicks: 0
      };
    }

    const summary = data.reduce(
      (acc, analytics) => ({
        total_views: acc.total_views + analytics.views_count,
        total_calls: acc.total_calls + analytics.clicks_call,
        total_whatsapp: acc.total_whatsapp + analytics.clicks_whatsapp,
        total_email: acc.total_email + analytics.clicks_email,
        total_website: acc.total_website + analytics.clicks_website,
        total_social: acc.total_social + analytics.clicks_social,
        total_clicks:
          acc.total_clicks +
          analytics.clicks_call +
          analytics.clicks_whatsapp +
          analytics.clicks_email +
          analytics.clicks_website +
          analytics.clicks_social
      }),
      {
        total_views: 0,
        total_calls: 0,
        total_whatsapp: 0,
        total_email: 0,
        total_website: 0,
        total_social: 0,
        total_clicks: 0
      }
    );

    return summary;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return {
      total_views: 0,
      total_calls: 0,
      total_whatsapp: 0,
      total_email: 0,
      total_website: 0,
      total_social: 0,
      total_clicks: 0
    };
  }
}

export async function uploadContractorLogo(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('contractor-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contractor-logos')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading contractor logo:', error);
    return null;
  }
}

export async function uploadPortfolioImage(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/portfolio-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('contractor-portfolios')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contractor-portfolios')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading portfolio image:', error);
    return null;
  }
}

export async function uploadBannerImage(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/banner-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('contractor-banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contractor-banners')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading banner image:', error);
    return null;
  }
}
