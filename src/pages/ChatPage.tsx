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
    <div className="min-h-screen pt-16 bg-[#0a0e1a] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Community Chat</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Community
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {initialLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-orange-500 animate-spin" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No messages yet. Be the first to say hello! 🌌</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user.id;
              const displayName = getDisplayName(msg);
              const avatarUrl = getAvatarUrl(msg);

              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-slate-700">
                      {avatarUrl ? (
                        <FallbackImage
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-400 text-xs font-bold">
                          {displayName[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-200'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold text-orange-400 mb-1">{displayName}</p>
                    )}
                    {msg.imageUrl ? (
                      <FallbackImage
                        src={msg.imageUrl}
                        alt="Shared image"
                        className="max-w-full rounded-lg"
                        fallbackClassName="w-full h-40 rounded-lg"
                      />
                    ) : (
                      <p className="break-words">{msg.text}</p>
                    )}
                    <p className={`text-xs mt-1 ${isOwn ? 'text-orange-200' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  {isOwn && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-orange-500/20">
                      {profile?.avatarUrl ? (
                        <FallbackImage
                          src={profile.avatarUrl}
                          alt="You"
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-400 text-xs font-bold">
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
      <div className="bg-slate-900 border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
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
            className="border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Share image"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </Button>
          <Input
            type="text"
            placeholder={uploading ? 'Uploading image…' : 'Type a message…'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            className="flex-1 bg-slate-800 border-white/20 text-white placeholder:text-gray-500"
            disabled={uploading}
          />
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={sendMessage}
            disabled={!newMessage.trim() || uploading}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
