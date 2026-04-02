/**
 * services/profiles.ts
 * CRUD for user profiles.
 */
import { supabase } from '@/supabase';
import type { DbProfile, UserProfile } from '@/types';

export function mapProfile(row: DbProfile): UserProfile {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchProfile error:', error.message);
    return null;
  }
  if (!data) return null;
  return mapProfile(data as DbProfile);
}

export async function fetchProfilesBatch(
  userIds: string[]
): Promise<Record<string, UserProfile>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (error) {
    console.error('fetchProfilesBatch error:', error.message);
    return {};
  }

  const result: Record<string, UserProfile> = {};
  for (const row of (data as DbProfile[])) {
    result[row.id] = mapProfile(row);
  }
  return result;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<DbProfile, 'username' | 'avatar_url'>>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`updateProfile: ${error.message}`);
  return mapProfile(data as DbProfile);
}
