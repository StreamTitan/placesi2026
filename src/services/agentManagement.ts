import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Agent = Database['public']['Tables']['profiles']['Row'];
type AgentProfile = Database['public']['Tables']['agent_profiles']['Row'];

export interface AgentWithPerformance extends Agent {
  agentProfile: AgentProfile | null;
  listingsCount: number;
  totalViews: number;
  contactRequests: number;
  favorites: number;
  activeListings: number;
  soldListings: number;
}

export interface ComprehensiveAgentUpdate {
  profile: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
  agentProfile: {
    email?: string;
    whatsapp?: string;
    license_number?: string;
    bio?: string;
    years_experience?: number;
    specializations?: string[];
    about?: string;
    mission?: string;
    languages_spoken?: string[];
    certifications?: string[];
    awards?: string[];
    areas_served?: string[];
  };
}

export async function updateComprehensiveAgentInfo(
  agentId: string,
  updates: ComprehensiveAgentUpdate
): Promise<boolean> {
  try {
    if (Object.keys(updates.profile).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates.profile)
        .eq('id', agentId);

      if (profileError) throw profileError;
    }

    if (Object.keys(updates.agentProfile).length > 0) {
      const { error: agentProfileError } = await supabase
        .from('agent_profiles')
        .update(updates.agentProfile)
        .eq('user_id', agentId);

      if (agentProfileError) throw agentProfileError;
    }

    return true;
  } catch (error) {
    console.error('Error updating comprehensive agent info:', error);
    return false;
  }
}

export async function fetchAgencyAgentsWithPerformance(
  agencyCreatedBy: string
): Promise<AgentWithPerformance[]> {
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('created_by', agencyCreatedBy)
    .single();

  if (!agency) {
    return [];
  }

  const { data: agentProfiles } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('agency_id', agency.id);

  const agentIds = agentProfiles?.map(ap => ap.user_id) || [];

  if (agentIds.length === 0) {
    return [];
  }

  const { data: agents } = await supabase
    .from('profiles')
    .select('*')
    .in('id', agentIds)
    .eq('role', 'agent')
    .order('created_at', { ascending: false });

  if (!agents) {
    return [];
  }

  const { data: properties } = await supabase
    .from('properties')
    .select('id, listed_by, view_count, status')
    .in('listed_by', agentIds);

  const propertyIds = properties?.map(p => p.id) || [];

  const { data: favorites } = await supabase
    .from('favorites')
    .select('property_id')
    .in('property_id', propertyIds);

  const { data: contactRequests } = await supabase
    .from('contact_requests')
    .select('agent_id')
    .in('agent_id', agentIds);

  const agentsWithPerformance: AgentWithPerformance[] = agents.map(agent => {
    const agentProfile = agentProfiles?.find(ap => ap.user_id === agent.id) || null;
    const agentProperties = properties?.filter(p => p.listed_by === agent.id) || [];
    const agentViews = agentProperties.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const agentContacts = contactRequests?.filter(cr => cr.agent_id === agent.id).length || 0;
    const agentFavorites = favorites?.filter(f =>
      agentProperties.some(p => p.id === f.property_id)
    ).length || 0;

    return {
      ...agent,
      agentProfile,
      listingsCount: agentProperties.length,
      totalViews: agentViews,
      contactRequests: agentContacts,
      favorites: agentFavorites,
      activeListings: agentProperties.filter(p => p.status === 'active').length,
      soldListings: agentProperties.filter(p => p.status === 'sold').length,
    };
  });

  return agentsWithPerformance;
}

export async function removeAgentFromAgency(agentId: string, agencyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agent_profiles')
      .update({ agency_id: null })
      .eq('user_id', agentId)
      .eq('agency_id', agencyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing agent from agency:', error);
    return false;
  }
}

export async function updateAgentInfo(
  agentId: string,
  updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', agentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating agent info:', error);
    return false;
  }
}

export async function updateAgentProfile(
  agentId: string,
  updates: {
    email?: string;
    whatsapp?: string;
    license_number?: string;
    bio?: string;
    years_experience?: number;
    specializations?: string[];
    about?: string;
    mission?: string;
    languages_spoken?: string[];
    certifications?: string[];
    awards?: string[];
    areas_served?: string[];
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agent_profiles')
      .update(updates)
      .eq('user_id', agentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating agent profile:', error);
    return false;
  }
}

export async function changeAgentPassword(
  agentId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      agentId,
      { password: newPassword }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}
