// Supabase Client Configuration
// Offline-First Architecture: Optimistic updates + background sync

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables (set these in your .env file)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For prototype demo mode (when no Supabase credentials)
export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

// Create Supabase client with optimized settings for real-time
export const supabase = DEMO_MODE
  ? null
  : createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10, // Rate limit for battery optimization
        },
      },
      global: {
        headers: {
          'x-app-name': 'well-check',
          'x-app-version': '1.0.0',
        },
      },
    });

// Helper: Check if Supabase is available
export function isSupabaseConnected(): boolean {
  return !DEMO_MODE && supabase !== null;
}

// Helper: Get current user's tenant_id (for RLS queries)
export async function getCurrentUserTenantId(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Query users table to get tenant_id
  const { data } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single();

  return data?.tenant_id || null;
}

// Helper: Log to console with demo mode indicator
export function logSupabase(message: string, data?: any) {
  const prefix = DEMO_MODE ? '[DEMO MODE]' : '[SUPABASE]';
  console.log(`${prefix} ${message}`, data || '');
}
