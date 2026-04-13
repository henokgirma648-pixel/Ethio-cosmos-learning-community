import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase';
import { fetchProfilesBatch } from '@/services/profiles';
import type { ChatMessage, UserProfile, DbChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { FallbackImage } from '@/components/MediaFallback';

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enrichMessages = useCallback(
    async (msgs: ChatMessage[], existingProfiles: Record<string, UserProfile>) => {
      const unknownIds = [...new Set(msgs.map((m) => m.userId))].filter(
        (id) => !existingProfiles[id]
      );
      if (unknownIds.length === 0) return existingProfiles;

      const fetched = await fetchProfilesBatch(unknownIds);
      return { ...existingProfiles, ...fetched };
    },
    []
  );

  const mapDbMessage = useCallback((m: DbChatMessage): ChatMessage => ({
    id: m.id,
    userId: m.user_id,
    username: m.user_id, // Placeholder — overwritten after profile fetch
    avatarUrl: null,
    text: m.message_text,
    imageUrl: m.image_url,
    timestamp: m.created_at,
  }), []);

  // Load existing messages
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(200);

        if (error) throw error;

        const mapped = (data as DbChatMessage[]).map(mapDbMessage);
        const enrichedProfiles = await enrichMessages(mapped, {});
        setProfiles(enrichedProfiles);
        setMessages(mapped);
      } catch (err) {
        console.error('Chat load error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    void load();
  }, [user, mapDbMessage, enrichMessages]);

  // Real-time subscription to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const m = mapDbMessage(payload.new as DbChatMessage);
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
          // Fetch profile if we don't have it yet
          setProfiles((prev) => {
            if (prev[m.userId]) return prev;
            void fetchProfilesBatch([m.userId]).then((fetched) =>
              setProfiles((p) => ({ ...p, ...fetched }))
            );
            return prev;
          });
        }
      )
      .subscribe();

    return () => { void channel.unsubscribe(); };
  }, [user, mapDbMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      message_text: text,
    });
    if (error) {
      console.error('Send message error:', error);
      setNewMessage(text); // Restore on failure
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const filePath = `chat-images/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        image_url: publicUrl,
      });
      if (insertError) throw insertError;
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image. Make sure the "uploads" bucket is configured in Supabase.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const getDisplayName = (msg: ChatMessage) => {
    const p = profiles[msg.userId];
    if (p) return p.username;
    return msg.userId.slice(0, 8) + '…'; // Short UUID as final fallback
  };

  const getAvatarUrl = (msg: ChatMessage) => {
    return profiles[msg.userId]?.avatarUrl ?? null;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-16 bg-[#0d051a] flex flex-col">
      {/* Header */}
      <div className="bg-purple-950/40 backdrop-blur-xl border-b border-white/10 px-6 py-5 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Community Chat</h1>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/20">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            1 online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {initialLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="text-purple-500 animate-spin" size={48} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-purple-300/40 text-xl">No messages yet. Be the first to say hello! 🌌</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user.id;
              const displayName = getDisplayName(msg);
              const avatarUrl = getAvatarUrl(msg);

              return (
                <div key={msg.id} className={`flex items-end gap-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-purple-900/40 border border-white/10 shadow-lg">
                      {avatarUrl ? (
                        <FallbackImage
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-lg font-bold">
                          {displayName[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-2xl border ${
                      isOwn 
                        ? 'bg-purple-600 border-purple-500/50 text-white rounded-br-none' 
                        : 'bg-purple-950/40 border-white/5 text-purple-100 rounded-bl-none backdrop-blur-md'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-sm font-bold text-purple-400 mb-2 tracking-wide">{displayName}</p>
                    )}
                    {msg.imageUrl ? (
                      <FallbackImage
                        src={msg.imageUrl}
                        alt="Shared image"
                        className="max-w-full rounded-xl shadow-lg border border-white/10"
                        fallbackClassName="w-full h-56 rounded-xl"
                      />
                    ) : (
                      <p className="break-words text-lg leading-relaxed">{msg.text}</p>
                    )}
                    <p className={`text-xs mt-3 font-medium ${isOwn ? 'text-purple-200/60' : 'text-purple-300/40'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  {isOwn && (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-purple-600/20 border border-purple-500/30 shadow-lg">
                      {profile?.avatarUrl ? (
                        <FallbackImage
                          src={profile.avatarUrl}
                          alt="You"
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-lg font-bold">
                          {profile?.username?.[0]?.toUpperCase() ?? 'Y'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-purple-950/40 backdrop-blur-2xl border-t border-white/10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 border-white/10 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-2xl transition-all"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Share image"
          >
            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} />}
          </Button>
          <Input
            type="text"
            placeholder={uploading ? 'Uploading image…' : 'Type a message…'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            className="flex-1 h-14 bg-purple-900/20 border-white/10 text-white placeholder:text-purple-300/30 rounded-2xl px-6 text-lg focus:ring-purple-500/50"
            disabled={uploading}
          />
          <Button
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-lg shadow-purple-500/20 transition-all"
            onClick={sendMessage}
            disabled={!newMessage.trim() || uploading}
          >
            <Send size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
