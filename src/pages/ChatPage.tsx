import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, isValidConfig } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';
import type { ChatMessage } from '@/types';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, onlineUsers } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Load existing messages and subscribe to new ones
  useEffect(() => {
    if (!user || !isValidConfig) return;

    // Load existing messages
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error('Error loading messages:', error); return; }
        if (data) {
          setMessages(data.map((m) => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            senderEmail: m.sender_email,
            text: m.text,
            imageUrl: m.image_url,
            timestamp: new Date(m.created_at).getTime(),
          })));
        }
      });

    // Subscribe to new messages in real time
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as {
            id: string; sender_id: string; sender_name: string;
            sender_email: string; text?: string; image_url?: string; created_at: string;
          };
          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              senderEmail: m.sender_email,
              text: m.text,
              imageUrl: m.image_url,
              timestamp: new Date(m.created_at).getTime(),
            },
          ]);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    if (!isValidConfig) {
      alert('Supabase is not configured. Please add your credentials to the .env file.');
      return;
    }
    const text = newMessage.trim();
    setNewMessage('');
    const { error } = await supabase.from('messages').insert({
      sender_id: user.uid,
      sender_name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      sender_email: user.email,
      text,
    });
    if (error) console.error('Error sending message:', error);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !isValidConfig) return;

    setUploading(true);
    try {
      const filePath = `chat-images/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('messages').insert({
        sender_id: user.uid,
        sender_name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        sender_email: user.email,
        image_url: publicUrl,
      });
      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (!user) return null;

  if (!isValidConfig) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Chat Not Available</h2>
          <p className="text-gray-400">Supabase is not configured. Please add your credentials to the .env file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-[#0a0e1a] flex flex-col">
      {/* Online Users Badge */}
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Community Chat</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {onlineUsers} users online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No messages yet. Be the first to say hello! 🌌</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user.uid;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-200'}`}>
                    {!isOwn && (
                      <p className="text-xs font-medium text-gray-400 mb-1">{msg.senderName}</p>
                    )}
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="Shared image" className="max-w-full rounded-lg" />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <p className={`text-xs mt-1 ${isOwn ? 'text-orange-200' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
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
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button
            variant="outline"
            size="icon"
            className="border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip size={20} />
          </Button>
          <Input
            type="text"
            placeholder={uploading ? 'Uploading image...' : 'Type a message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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
