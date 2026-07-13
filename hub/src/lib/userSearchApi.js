import { supabase } from './supabaseClient.js';

export async function searchUsers({ q = '', role = null, country = null, institution = null, limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('search_users', {
    p_q: q || null,
    p_role: role || null,
    p_country: country || null,
    p_institution: institution || null,
    p_limit: limit,
    p_offset: offset,
  });
  return { data: data || [], error };
}
