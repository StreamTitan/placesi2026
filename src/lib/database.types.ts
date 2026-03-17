export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Minimal types matching what the frontend expects
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          phone: string | null;
          sex: string | null;
          date_of_birth: string | null;
          country: string | null;
          agency_name: string | null;
          theme_preference: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          status: string;
          property_type: string;
          bedrooms: number;
          bathrooms: number;
          area: number;
          address: string;
          city: string;
          region: string;
          country: string;
          featured_image: string | null;
          images: Json;
          agent_id: string;
          views_count: number;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      agencies: {
        Row: {
          id: string;
          name: string;
          registration_number: string | null;
          email: string | null;
          phone: string | null;
          logo_url: string | null;
          country: string | null;
          created_by: string;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      agent_profiles: {
        Row: {
          id: string;
          user_id: string;
          agency_id: string | null;
          email: string | null;
          license_number: string | null;
          country: string | null;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      contractors: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          logo_url: string | null;
          description: string | null;
          years_in_business: number | null;
          primary_category: string | null;
          additional_categories: Json | null;
          service_areas: Json | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          linkedin_url: string | null;
          tiktok_url: string | null;
          employees_count: number | null;
          certifications: Json | null;
          average_job_size: string | null;
          residential_or_commercial: string | null;
          operating_hours: string | null;
          trial_start_date: string | null;
          subscription_status: string | null;
          country: string | null;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      contractor_listings: {
        Row: {
          id: string;
          contractor_id: string;
          title: string;
          description: string;
          categories: Json | null;
          is_visible: boolean;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      contractor_specials: {
        Row: {
          id: string;
          contractor_id: string;
          title: string;
          description: string | null;
          discount_percentage: number | null;
          valid_from: string | null;
          valid_to: string | null;
          is_active: boolean;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      contractor_analytics: {
        Row: {
          id: string;
          contractor_id: string;
          views_count: number;
          clicks_count: number;
          inquiries_count: number;
          date: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      mortgage_applications: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          status: string;
          loan_amount: number;
          down_payment: number;
          term_years: number;
          interest_rate: number | null;
          monthly_payment: number | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type: string;
          file_url: string;
          file_name: string | null;
          uploaded_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      application_notes: {
        Row: {
          id: string;
          application_id: string;
          user_id: string;
          note: string;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      co_applicants: {
        Row: {
          id: string;
          application_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          occupation: string | null;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string | null;
          is_read: boolean;
          created_at: string;
          [key: string]: any;
        };
        Insert: { [key: string]: any };
        Update: { [key: string]: any };
      };
    };
    Enums: {
      user_role: 'client' | 'agent' | 'agency' | 'contractor' | 'admin';
    };
  };
}
