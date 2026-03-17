import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string,
    agencyName?: string,
    sex?: string,
    dateOfBirth?: string,
    agencyId?: string,
    phone?: string,
    profilePicture?: File,
    agencyLogo?: File,
    contractorData?: any,
    country?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        document.documentElement.classList.add('dark');
        loadProfile(session.user.id);
      } else {
        document.documentElement.classList.remove('dark');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          document.documentElement.classList.add('dark');
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          document.documentElement.classList.remove('dark');
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (!data.theme_preference || data.theme_preference === 'light') {
          await supabase
            .from('profiles')
            .update({ theme_preference: 'dark' })
            .eq('id', userId);

          setProfile({ ...data, theme_preference: 'dark' });
        } else {
          setProfile(data);
        }

        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    agencyName?: string,
    sex?: string,
    dateOfBirth?: string,
    agencyId?: string,
    phone?: string,
    profilePicture?: File,
    agencyLogo?: File,
    contractorData?: any,
    country?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await new Promise(resolve => setTimeout(resolve, 100));

      let avatarUrl: string | null = null;
      let logoUrl: string | null = null;

      if (role === 'agent' && profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${data.user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, profilePicture, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error(`Failed to upload profile picture: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      if (role === 'agency' && agencyLogo) {
        const fileExt = agencyLogo.name.split('.').pop();
        const fileName = `${data.user.id}/logo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, agencyLogo, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw new Error(`Failed to upload agency logo: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const profileUpdate: any = {
        full_name: fullName,
        role: role as Database['public']['Enums']['user_role'],
        theme_preference: 'dark',
      };

      if (avatarUrl) {
        profileUpdate.avatar_url = avatarUrl;
      }

      if (phone && phone.length === 7) {
        profileUpdate.phone = `1868${phone}`;
      }

      if (role === 'agency' && agencyName) {
        profileUpdate.agency_name = agencyName;
      }

      if (sex) {
        profileUpdate.sex = sex;
      }

      if (dateOfBirth) {
        profileUpdate.date_of_birth = dateOfBirth;
      }

      if (country) {
        profileUpdate.country = country;
      }

      if (role === 'agency' && agencyName) {
        const agencyInsert: any = {
          name: agencyName,
          registration_number: `REG-${Date.now()}`,
          email: email,
          created_by: data.user.id,
        };

        if (phone && phone.length === 7) {
          agencyInsert.phone = `1868${phone}`;
        }

        if (logoUrl) {
          agencyInsert.logo_url = logoUrl;
        }

        if (country) {
          agencyInsert.country = country;
        }

        const { error: agencyError } = await supabase
          .from('agencies')
          .insert(agencyInsert)
          .select()
          .single();

        if (agencyError) {
          console.error('Agency creation error:', agencyError);
          throw new Error(`Failed to create agency: ${agencyError.message}`);
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      if (role === 'agent') {
        const agentProfileInsert: any = {
          user_id: data.user.id,
          email: email,
        };

        if (agencyId) {
          agentProfileInsert.agency_id = agencyId;
        }

        if (country) {
          agentProfileInsert.country = country;
        }

        const { error: agentProfileError } = await supabase
          .from('agent_profiles')
          .insert(agentProfileInsert);

        if (agentProfileError) {
          console.error('Agent profile creation error:', agentProfileError);
          throw new Error(`Failed to create agent profile: ${agentProfileError.message}`);
        }
      }

      if (role === 'contractor' && contractorData) {
        let contractorLogoUrl: string | null = null;

        if (contractorData.logo) {
          const fileExt = contractorData.logo.name.split('.').pop();
          const fileName = `${data.user.id}/logo-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('contractor-logos')
            .upload(fileName, contractorData.logo, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Contractor logo upload error:', uploadError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('contractor-logos')
              .getPublicUrl(fileName);
            contractorLogoUrl = publicUrl;
          }
        }

        const contractorInsert: any = {
          user_id: data.user.id,
          company_name: contractorData.companyName,
          logo_url: contractorLogoUrl,
          description: contractorData.description || null,
          years_in_business: contractorData.yearsInBusiness || null,
          primary_category: contractorData.primaryCategory,
          additional_categories: contractorData.additionalCategories || null,
          service_areas: contractorData.serviceAreas || null,
          address: contractorData.address || null,
          phone: phone && phone.length === 7 ? `1868${phone}` : contractorData.phone || null,
          email: email,
          website_url: contractorData.websiteUrl || null,
          facebook_url: contractorData.facebookUrl || null,
          instagram_url: contractorData.instagramUrl || null,
          linkedin_url: contractorData.linkedinUrl || null,
          tiktok_url: contractorData.tiktokUrl || null,
          employees_count: contractorData.employeesCount || null,
          certifications: contractorData.certifications || null,
          average_job_size: contractorData.averageJobSize || null,
          residential_or_commercial: contractorData.residentialOrCommercial || null,
          operating_hours: contractorData.operatingHours || null,
          trial_start_date: new Date().toISOString(),
          subscription_status: 'trial',
          country: country || 'Trinidad and Tobago'
        };

        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .insert(contractorInsert)
          .select()
          .single();

        if (contractorError) {
          console.error('Contractor creation error:', contractorError);
          throw new Error(`Failed to create contractor profile: ${contractorError.message}`);
        }

        const { error: listingError } = await supabase
          .from('contractor_listings')
          .insert({
            contractor_id: contractor.id,
            title: contractorData.companyName,
            description: contractorData.description || '',
            categories: [contractorData.primaryCategory],
            is_visible: true
          });

        if (listingError) {
          console.error('Contractor listing creation error:', listingError);
        }
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    await loadProfile(user.id);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
