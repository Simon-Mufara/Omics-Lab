import { supabase } from './supabaseClient.js';

export async function getChannels() {
  const { data, error } = await supabase.from('channels').select('*').order('name', { ascending: true });
  return { data: data || [], error };
}

export async function getMyConversations(userId) {
  if (!userId) return { data: [], error: null };
  const { data, error } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId);
  if (error || !data) return { data: [], error };

  // For each conversation, resolve "the other participant" with a
  // second query — simpler and more predictable than trying to coax
  // a self-join for "not me" out of PostgREST's embed syntax.
  const conversationIds = data.map((r) => r.conversation_id);
  if (!conversationIds.length) return { data: [], error: null };

  const { data: allParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id,user_id')
    .in('conversation_id', conversationIds);

  const otherIdByConversation = {};
  for (const row of allParticipants || []) {
    if (row.user_id !== userId) otherIdByConversation[row.conversation_id] = row.user_id;
  }
  const otherIds = [...new Set(Object.values(otherIdByConversation))];
  const { data: otherUsers } = otherIds.length
    ? await supabase.from('users').select('id,username,display_name,name,avatar_url').in('id', otherIds)
    : { data: [] };
  const userById = Object.fromEntries((otherUsers || []).map((u) => [u.id, u]));

  return {
    data: conversationIds.map((id) => ({ id, otherUser: userById[otherIdByConversation[id]] || null })),
    error: null,
  };
}

export async function getOrCreateDM(otherUserId) {
  const { data, error } = await supabase.rpc('get_or_create_dm', { p_other_user_id: otherUserId });
  return { data, error };
}

export async function getMessages(target) {
  let query = supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(200);
  query = target.channelId ? query.eq('channel_id', target.channelId) : query.eq('conversation_id', target.conversationId);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function sendMessage(target, userId, body) {
  const row = { user_id: userId, body, channel_id: target.channelId || null, conversation_id: target.conversationId || null };
  const { data, error } = await supabase.from('messages').insert(row).select().single();
  return { data, error };
}

export async function editMessage(messageId, body) {
  return supabase.from('messages').update({ body, edited_at: new Date().toISOString() }).eq('id', messageId).select().single();
}

export async function deleteMessage(messageId) {
  return supabase.from('messages').delete().eq('id', messageId);
}

export async function reportMessage(messageId, reporterId, reason) {
  return supabase.from('message_reports').insert({ message_id: messageId, reporter_id: reporterId, reason: reason || null });
}

export async function getChannelLastMessages() {
  const { data, error } = await supabase.from('channel_last_message').select('*');
  return { data: data || [], error };
}

export async function getConversationLastMessages() {
  const { data, error } = await supabase.from('conversation_last_message').select('*');
  return { data: data || [], error };
}

export async function getChatReads(userId) {
  if (!userId) return { data: [], error: null };
  const { data, error } = await supabase.from('chat_reads').select('*').eq('user_id', userId);
  return { data: data || [], error };
}

export async function markRead(userId, target) {
  // target_id is a generated column (see db/schema.sql) — never
  // included in the payload, Postgres rejects explicit values for it.
  const row = {
    user_id: userId,
    channel_id: target.channelId || null,
    conversation_id: target.conversationId || null,
    last_read_at: new Date().toISOString(),
  };
  return supabase.from('chat_reads').upsert(row, { onConflict: 'user_id,target_id' });
}

/* Subscribes to new INSERTs on `messages` for a single channel or
   conversation. Returns an unsubscribe function. */
export function subscribeToMessages(target, onInsert) {
  const filter = target.channelId ? `channel_id=eq.${target.channelId}` : `conversation_id=eq.${target.conversationId}`;
  const channel = supabase
    .channel(`messages:${target.channelId || target.conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter }, (payload) => onInsert(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* Realtime Presence for a channel — tracks who currently has this
   channel open. Returns an unsubscribe function; onSync receives the
   full presence state (map of key -> [{user_id, username, avatar_url}]) */
export function subscribePresence(channelSlug, self, onSync) {
  const presenceChannel = supabase.channel(`presence:${channelSlug}`, { config: { presence: { key: self.id } } });
  presenceChannel
    .on('presence', { event: 'sync' }, () => onSync(presenceChannel.presenceState()))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ user_id: self.id, username: self.username, avatar_url: self.avatar_url });
      }
    });
  return () => supabase.removeChannel(presenceChannel);
}
