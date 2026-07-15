/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Community discussion topics
   GET  /api/forum-topics?category=<cat>&sort=hot|new   (public, no auth)
   POST /api/forum-topics   { category, title, body }   (requires auth)
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';
import { resolveOrProvisionUser } from '../lib/user-provisioning.js';

const CATEGORIES = ['general', 'help', 'showcase', 'africa', 'careers'];

async function _resolveUserId(clerkId) {
  const user = await resolveOrProvisionUser(clerkId).catch(() => null);
  return user?.id || null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const category = CATEGORIES.includes(req.query.category) ? req.query.category : null;
    const sort = req.query.sort === 'hot' ? 'comment_count.desc,created_at.desc' : 'created_at.desc';
    const filter = category ? `&category=eq.${category}` : '';

    const listRes = await supabaseServiceRequest(
      `forum_topics?select=id,category,title,body,reacted_by,comment_count,created_at,user_id,users(name,avatar_url,institution)${filter}&order=${sort}&limit=100`,
      'GET'
    ).catch(() => null);

    if (!listRes) return res.status(200).json({ topics: [] });
    const topics = await listRes.json();
    return res.status(200).json({ topics });
  }

  if (req.method === 'POST') {
    let auth;
    try {
      auth = await requireAuth(req);
    } catch (err) {
      if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
      throw err;
    }

    const { category, title, body } = req.body || {};
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'Title and body are required' });
    const cat = CATEGORIES.includes(category) ? category : 'general';

    const userId = await _resolveUserId(auth.clerkId);
    if (!userId) return res.status(503).json({ error: 'Account not provisioned yet — try again in a moment' });

    const insertRes = await supabaseServiceRequest(
      'forum_topics', 'POST',
      { user_id: userId, category: cat, title: title.trim().slice(0, 200), body: body.trim().slice(0, 5000) },
      { prefer: 'return=representation' }
    ).catch(err => { throw err; });

    const rows = await insertRes.json();
    return res.status(201).json({ topic: rows?.[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
