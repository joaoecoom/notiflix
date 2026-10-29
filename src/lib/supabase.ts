import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as unknown as SupabaseClient);

const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

export const supabaseAdmin: SupabaseClient = supabaseConfigured && serviceRoleKey
  ? createClient(supabaseUrl!, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : (null as unknown as SupabaseClient);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  id: string;
  user_id: string;
  can_manual_notification: boolean;
  can_auto_system: boolean;
  allowed_platforms: string[];
  created_at: string;
  updated_at: string;
}
