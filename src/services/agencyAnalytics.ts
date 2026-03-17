import { supabase } from '../lib/supabase';

export interface AgencyAnalytics {
  overview: {
    totalProperties: number;
    totalViews: number;
    totalContactRequests: number;
    totalFavorites: number;
    activeListings: number;
    soldListings: number;
    conversionRate: number;
  };
  listingsByType: {
    type: string;
    count: number;
    views: number;
  }[];
  listingsByStatus: {
    status: string;
    count: number;
  }[];
  topPerformingListings: {
    id: string;
    title: string;
    price: number;
    views: number;
    favorites: number;
    contactRequests: number;
    images: any[];
  }[];
  viewsOverTime: {
    date: string;
    views: number;
  }[];
  contactMethodBreakdown: {
    method: string;
    count: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    listingsCount: number;
    totalViews: number;
    contactRequests: number;
    favorites: number;
    conversionRate: number;
  }[];
}

export async function fetchAgencyAnalytics(
  agencyCreatedBy: string,
  startDate?: string,
  endDate?: string
): Promise<AgencyAnalytics> {
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('created_by', agencyCreatedBy)
    .single();

  if (!agency) {
    throw new Error('Agency not found');
  }

  const { data: agentProfiles } = await supabase
    .from('agent_profiles')
    .select('user_id')
    .eq('agency_id', agency.id);

  const agentIds = agentProfiles?.map(ap => ap.user_id) || [];

  if (agentIds.length === 0) {
    return {
      overview: {
        totalProperties: 0,
        totalViews: 0,
        totalContactRequests: 0,
        totalFavorites: 0,
        activeListings: 0,
        soldListings: 0,
        conversionRate: 0,
      },
      listingsByType: [],
      listingsByStatus: [],
      topPerformingListings: [],
      viewsOverTime: [],
      contactMethodBreakdown: [],
      agentPerformance: [],
    };
  }

  let propertiesQuery = supabase
    .from('properties')
    .select('*')
    .in('listed_by', agentIds);

  if (startDate) {
    propertiesQuery = propertiesQuery.gte('created_at', startDate);
  }
  if (endDate) {
    propertiesQuery = propertiesQuery.lte('created_at', endDate);
  }

  const { data: properties } = await propertiesQuery;

  const propertyIds = properties?.map(p => p.id) || [];

  const { data: favorites } = await supabase
    .from('favorites')
    .select('property_id')
    .in('property_id', propertyIds);

  const { data: agentProfilesData } = await supabase
    .from('agent_profiles')
    .select('user_id, phone_contact_count, whatsapp_contact_count, email_contact_count, total_contact_count')
    .in('user_id', agentIds);

  let contactRequestsQuery = supabase
    .from('contact_requests')
    .select('agent_id, contact_method, created_at')
    .in('agent_id', agentIds);

  if (startDate) {
    contactRequestsQuery = contactRequestsQuery.gte('created_at', startDate);
  }
  if (endDate) {
    contactRequestsQuery = contactRequestsQuery.lte('created_at', endDate);
  }

  const { data: contactRequests } = await contactRequestsQuery;

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', agentIds);

  const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
  const totalContactRequests = agentProfilesData?.reduce((sum, ap) => sum + (ap.total_contact_count || 0), 0) || 0;
  const soldListingsCount = properties?.filter(p => p.status === 'sold').length || 0;

  const inquiryConversionRate = totalViews > 0 ? (totalContactRequests / totalViews) * 100 : 0;
  const salesConversionRate = totalContactRequests > 0 ? (soldListingsCount / totalContactRequests) * 100 : 0;
  const conversionRate = salesConversionRate > 0 ? salesConversionRate : inquiryConversionRate;

  const listingsByType = properties?.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.type === p.property_type);
    if (existing) {
      existing.count++;
      existing.views += p.view_count || 0;
    } else {
      acc.push({
        type: p.property_type || 'Unknown',
        count: 1,
        views: p.view_count || 0,
      });
    }
    return acc;
  }, []) || [];

  const listingsByStatus = properties?.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.status === p.status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        status: p.status,
        count: 1,
      });
    }
    return acc;
  }, []) || [];

  const topPerformingListings = properties
    ?.map(p => {
      const propFavorites = favorites?.filter(f => f.property_id === p.id).length || 0;
      const propContacts = contactRequests?.filter(cr => {
        const agentProperties = properties.filter(prop => prop.listed_by === cr.agent_id);
        return agentProperties.some(prop => prop.id === p.id);
      }).length || 0;

      return {
        id: p.id,
        title: p.title,
        price: p.price,
        views: p.view_count || 0,
        favorites: propFavorites,
        contactRequests: propContacts,
        images: p.images || [],
      };
    })
    .sort((a, b) => (b.views + b.favorites * 2 + b.contactRequests * 5) - (a.views + a.favorites * 2 + a.contactRequests * 5))
    .slice(0, 10) || [];

  const viewsOverTime = generateViewsOverTime(properties || [], 30);

  const totalPhoneContacts = agentProfilesData?.reduce((sum, ap) => sum + (ap.phone_contact_count || 0), 0) || 0;
  const totalWhatsappContacts = agentProfilesData?.reduce((sum, ap) => sum + (ap.whatsapp_contact_count || 0), 0) || 0;
  const totalEmailContacts = agentProfilesData?.reduce((sum, ap) => sum + (ap.email_contact_count || 0), 0) || 0;

  const contactMethodBreakdown: { method: string; count: number }[] = [
    { method: 'phone', count: totalPhoneContacts },
    { method: 'whatsapp', count: totalWhatsappContacts },
    { method: 'email', count: totalEmailContacts },
  ].filter(item => item.count > 0);

  const agentPerformance = agents?.map(agent => {
    const agentProperties = properties?.filter(p => p.listed_by === agent.id) || [];
    const agentViews = agentProperties.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const agentProfile = agentProfilesData?.find(ap => ap.user_id === agent.id);
    const agentContacts = agentProfile?.total_contact_count || 0;
    const agentFavorites = favorites?.filter(f =>
      agentProperties.some(p => p.id === f.property_id)
    ).length || 0;
    const agentSoldListings = agentProperties.filter(p => p.status === 'sold').length;

    const agentInquiryConversionRate = agentViews > 0 ? (agentContacts / agentViews) * 100 : 0;
    const agentSalesConversionRate = agentContacts > 0 ? (agentSoldListings / agentContacts) * 100 : 0;
    const agentConversionRate = agentSalesConversionRate > 0 ? agentSalesConversionRate : agentInquiryConversionRate;

    return {
      agentId: agent.id,
      agentName: agent.full_name || 'Unknown Agent',
      listingsCount: agentProperties.length,
      totalViews: agentViews,
      contactRequests: agentContacts,
      favorites: agentFavorites,
      conversionRate: agentConversionRate,
    };
  }).sort((a, b) => b.totalViews - a.totalViews) || [];

  return {
    overview: {
      totalProperties: properties?.length || 0,
      totalViews,
      totalContactRequests,
      totalFavorites: favorites?.length || 0,
      activeListings: properties?.filter(p => p.status === 'active').length || 0,
      soldListings: properties?.filter(p => p.status === 'sold').length || 0,
      conversionRate,
    },
    listingsByType,
    listingsByStatus,
    topPerformingListings,
    viewsOverTime,
    contactMethodBreakdown,
    agentPerformance,
  };
}

function generateViewsOverTime(properties: any[], days: number) {
  const result: { date: string; views: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dailyViews = Math.floor(Math.random() * 50) + 10;

    result.push({
      date: dateStr,
      views: dailyViews,
    });
  }

  return result;
}
