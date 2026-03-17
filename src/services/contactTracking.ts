import { supabase } from '../lib/supabase';

export type ContactMethod = 'phone' | 'whatsapp' | 'email';

export interface VisitorContactInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface TrackContactOptions {
  agentId: string;
  agentName: string;
  contactMethod: ContactMethod;
  listingId?: string;
  visitorInfo?: VisitorContactInfo;
}

export async function trackContactRequest(
  options: TrackContactOptions
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isRegistered = !!user;

    const { error: insertError } = await supabase.from('contact_requests').insert({
      agent_id: options.agentId,
      agent_name: options.agentName,
      contact_method: options.contactMethod,
      listing_id: options.listingId || null,
      visitor_id: user?.id || null,
      is_registered: isRegistered,
      visitor_name: options.visitorInfo?.name || null,
      visitor_phone: options.visitorInfo?.phone || null,
      visitor_email: options.visitorInfo?.email || null,
    });

    if (insertError) {
      console.error('Error inserting contact request:', insertError);
      throw insertError;
    }

    const { error: rpcError } = await supabase.rpc('increment_contact_count', {
      p_agent_id: options.agentId,
      p_contact_method: options.contactMethod,
    });

    if (rpcError) {
      console.error('Error incrementing contact count:', rpcError);
    }
  } catch (error) {
    console.error('Error tracking contact request:', error);
    throw error;
  }
}

export interface ContactStats {
  total: number;
  byPhone: number;
  byWhatsApp: number;
  byEmail: number;
}

export async function getContactStats(agentId: string): Promise<ContactStats> {
  try {
    const { data, error } = await supabase
      .from('agent_profiles')
      .select('phone_contact_count, whatsapp_contact_count, email_contact_count, total_contact_count')
      .eq('user_id', agentId)
      .single();

    if (error) throw error;

    const stats: ContactStats = {
      total: data?.total_contact_count || 0,
      byPhone: data?.phone_contact_count || 0,
      byWhatsApp: data?.whatsapp_contact_count || 0,
      byEmail: data?.email_contact_count || 0,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return { total: 0, byPhone: 0, byWhatsApp: 0, byEmail: 0 };
  }
}

export async function getAgencyContactStats(agencyCreatedBy: string): Promise<ContactStats> {
  try {
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('created_by', agencyCreatedBy)
      .single();

    if (agencyError) throw agencyError;

    const { data: agentProfiles, error: agentsError } = await supabase
      .from('agent_profiles')
      .select('phone_contact_count, whatsapp_contact_count, email_contact_count, total_contact_count')
      .eq('agency_id', agency.id);

    if (agentsError) throw agentsError;

    if (!agentProfiles || agentProfiles.length === 0) {
      return { total: 0, byPhone: 0, byWhatsApp: 0, byEmail: 0 };
    }

    const stats: ContactStats = {
      total: agentProfiles.reduce((sum, ap) => sum + (ap.total_contact_count || 0), 0),
      byPhone: agentProfiles.reduce((sum, ap) => sum + (ap.phone_contact_count || 0), 0),
      byWhatsApp: agentProfiles.reduce((sum, ap) => sum + (ap.whatsapp_contact_count || 0), 0),
      byEmail: agentProfiles.reduce((sum, ap) => sum + (ap.email_contact_count || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching agency contact stats:', error);
    return { total: 0, byPhone: 0, byWhatsApp: 0, byEmail: 0 };
  }
}
