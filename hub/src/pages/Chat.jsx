import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import Composer from '../components/chat/Composer.jsx';
import {
  deleteMessage,
  editMessage,
  getChannelLastMessages,
  getChannels,
  getChatReads,
  getConversationLastMessages,
  getMessages,
  getMyConversations,
  markRead,
  reportMessage,
  sendMessage,
  subscribePresence,
  subscribeToMessages,
} from '../lib/chatApi.js';
import { getOwnersByIds } from '../lib/datasetsApi.js';

export default function Chat({ profile, isSignedIn }) {
  const { kind, id } = useParams();
  const [channels, setChannels] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [channelLastMessage, setChannelLastMessage] = useState({});
  const [conversationLastMessage, setConversationLastMessage] = useState({});
  const [reads, setReads] = useState({});
  const [messages, setMessages] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [error, setError] = useState(null);

  const activeChannel = kind === 'c' ? channels.find((c) => c.slug === id) : null;
  const target = kind === 'c' && activeChannel ? { channelId: activeChannel.id } : kind === 'dm' && id ? { conversationId: id } : null;

  // Sidebar data + unread bookkeeping — reloaded whenever the active
  // target changes so read state stays current after visiting one.
  async function loadSidebar() {
    const [{ data: channelRows }, { data: conversationRows }, { data: chLast }, { data: convLast }, { data: readRows }] = await Promise.all([
      getChannels(),
      getMyConversations(profile?.id),
      getChannelLastMessages(),
      getConversationLastMessages(),
      getChatReads(profile?.id),
    ]);
    setChannels(channelRows);
    setConversations(conversationRows);
    setChannelLastMessage(Object.fromEntries(chLast.map((r) => [r.channel_id, r.last_message_at])));
    setConversationLastMessage(Object.fromEntries(convLast.map((r) => [r.conversation_id, r.last_message_at])));
    setReads(Object.fromEntries(readRows.map((r) => [r.channel_id || r.conversation_id, r.last_read_at])));
  }

  useEffect(() => {
    if (isSignedIn && profile?.id) loadSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, profile?.id]);

  // Load + subscribe for the active target.
  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setMessages([]);
    setError(null);

    getMessages(target).then(async ({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
        return;
      }
      setMessages(data);
      const ownerMap = await getOwnersByIds(data.map((m) => m.user_id));
      if (!cancelled) setUsersById((prev) => ({ ...prev, ...ownerMap }));
      if (profile?.id) {
        await markRead(profile.id, target);
        loadSidebar();
      }
    });

    const unsubscribe = subscribeToMessages(target, async (newMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]));
      if (!usersById[newMessage.user_id]) {
        const ownerMap = await getOwnersByIds([newMessage.user_id]);
        setUsersById((prev) => ({ ...prev, ...ownerMap }));
      }
      if (profile?.id && newMessage.user_id !== profile.id) {
        // Viewing this target live — mark it read immediately rather
        // than waiting for the next mount, so the sidebar dot doesn't
        // flash on for a message the user is already looking at.
        markRead(profile.id, target);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.channelId, target?.conversationId, profile?.id]);

  // Presence — only meaningful for channels (Prompt spec: "online-
  // members list per channel"); DMs have exactly 2 fixed participants.
  useEffect(() => {
    if (!activeChannel || !profile?.id) return;
    const unsubscribe = subscribePresence(activeChannel.slug, profile, (state) => {
      setOnlineIds(new Set(Object.values(state).flat().map((p) => p.user_id)));
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.slug, profile?.id]);

  const unread = useMemo(() => {
    const unreadChannels = new Set(channels.filter((c) => channelLastMessage[c.id] && (!reads[c.id] || new Date(channelLastMessage[c.id]) > new Date(reads[c.id]))).map((c) => c.id));
    const unreadConversations = new Set(
      conversations.filter((c) => conversationLastMessage[c.id] && (!reads[c.id] || new Date(conversationLastMessage[c.id]) > new Date(reads[c.id]))).map((c) => c.id)
    );
    return { channels: unreadChannels, conversations: unreadConversations };
  }, [channels, conversations, channelLastMessage, conversationLastMessage, reads]);

  if (!isSignedIn) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-error">Sign in to use Chat.</div>
      </div>
    );
  }

  if (!kind && channels.length > 0) {
    const defaultChannel = channels.find((c) => c.is_default) || channels[0];
    return <Navigate to={`/chat/c/${defaultChannel.slug}`} replace />;
  }

  async function handleSend(body) {
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      user_id: profile.id,
      body,
      created_at: new Date().toISOString(),
      edited_at: null,
      channel_id: target.channelId || null,
      conversation_id: target.conversationId || null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error: err } = await sendMessage(target, profile.id, body);
    if (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(err);
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data : m)));
  }

  async function handleEdit(messageId, newBody) {
    const { data } = await editMessage(messageId, newBody);
    if (data) setMessages((prev) => prev.map((m) => (m.id === messageId ? data : m)));
  }

  async function handleDelete(messageId) {
    await deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  async function handleReport(messageId) {
    await reportMessage(messageId, profile.id, null);
  }

  return (
    <div className="chat-page">
      <ChatSidebar channels={channels} conversations={conversations} unread={unread} />
      <div className="chat-main">
        {error && <div className="ol-error">{error.message}</div>}
        {!target && <p className="ol-sub" style={{ padding: '1rem' }}>Pick a channel or conversation.</p>}
        {target && (
          <>
            {activeChannel && (
              <div className="chat-header">
                <span className="chat-header-title"># {activeChannel.slug}</span>
                <span className="ol-sub">{activeChannel.description}</span>
                <span className="ol-sub chat-header-online">{onlineIds.size} online</span>
              </div>
            )}
            <MessageList
              messages={messages}
              usersById={usersById}
              currentUserId={profile.id}
              onlineIds={onlineIds}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
            <Composer onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}
