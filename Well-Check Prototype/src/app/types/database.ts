// Supabase Database Types (Generated from Schema V1.0)
// These types match the well_check_core_v1.sql schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          family_code: string;
          family_name: string | null;
          max_members: number;
          plan_tier: string;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          tenant_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'primary_user' | 'monitor' | 'super_admin';
          device_model: string | null;
          device_os: string | null;
          app_version: string | null;
          push_token: string | null;
          joined_via_family_code: string | null;
          join_ip_address: string | null;
          join_user_agent: string | null;
          join_timestamp: string | null;
          created_at: string;
          updated_at: string;
          last_seen_at: string | null;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      family_members: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          role: 'primary_user' | 'monitor' | 'super_admin';
          avatar_url: string | null;
          is_online: boolean;
          battery_level: number | null;
          last_location: Json | null;
          last_seen: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>;
      };
      ping_requests: {
        Row: {
          id: string;
          tenant_id: string;
          from_user_id: string;
          from_user_name: string;
          to_user_id: string;
          to_user_name: string;
          status: 'pending' | 'replied' | 'timeout';
          sent_at: string;
          replied_at: string | null;
          timeout_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ping_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['ping_requests']['Insert']>;
      };
      verified_pulses: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          user_name: string;
          location: Json;
          battery_level: number | null;
          gps_accuracy: 'high' | 'medium' | 'low' | 'none' | null;
          ping_request_id: string | null;
          timestamp: string;
          created_at: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['verified_pulses']['Row'], 'id' | 'created_at' | 'expires_at'>;
        Update: Partial<Database['public']['Tables']['verified_pulses']['Insert']>;
      };
      emergency_events: {
        Row: {
          id: string;
          tenant_id: string;
          triggered_by_user_id: string;
          triggered_by_user_name: string;
          status: 'active' | 'resolved' | 'false_alarm';
          sync_mode: 'normal' | 'high_frequency' | 'offline_queue';
          location: Json;
          audio_recording_enabled: boolean;
          audio_file_url: string | null;
          audio_sha256_hash: string | null;
          force_high_accuracy: boolean;
          resolved_by_user_id: string | null;
          resolved_at: string | null;
          resolution_notes: string | null;
          triggered_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['emergency_events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['emergency_events']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          event_type: string;
          event_data: Json;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          server_timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: never; // Immutable table
      };
      proximity_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          from_user_id: string;
          to_user_id: string;
          distance_miles: number;
          distance_zone: 'nearby' | 'moderate' | 'far';
          from_location: Json;
          to_location: Json;
          calculation_method: string;
          calculated_at: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['proximity_snapshots']['Row'], 'id' | 'calculated_at' | 'expires_at'>;
        Update: Partial<Database['public']['Tables']['proximity_snapshots']['Insert']>;
      };
    };
    Functions: {
      calculate_proximity_distance: {
        Args: {
          lat1: number;
          lon1: number;
          lat2: number;
          lon2: number;
        };
        Returns: number;
      };
      get_distance_zone: {
        Args: {
          distance_miles: number;
        };
        Returns: 'nearby' | 'moderate' | 'far';
      };
    };
  };
}
