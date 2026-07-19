/**
 * Mobile chat page — reuses ChatPage logic inside MobileLayout shell.
 * The ChatPage component already handles the order-picker when no orderId is present.
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle, User, Shield, ArrowLeft, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getOrderMessages, sendOrderMessage, markMessagesAsRead, getOrders, deleteOrderMessage } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { OrderMessageWithProfile, OrderWithItems } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import PageMeta from '@/components/common/PageMeta';

export default function MobileChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [userOrders, setUserOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [messages, setMessages] = useState<OrderMessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!user) { navigate(MOBILE_ROUTES.login); return; }
    if (!orderId) {
      setOrdersLoading(true);
      getOrders(user.id).then(setUserOrders).catch(() => toast.error('Failed to load orders')).finally(() => setOrdersLoading(false));
    }
  }, [user, orderId, navigate]);

  // Load messages
  useEffect(() => {
    if (!user || !orderId) return;

    const loadAll = async () => {
      try {
        setLoading(true);
        const orders = await getOrders(user.id);
        const found = orders.find(o => o.id === orderId);
        if (found) setOrder(found);
        const msgs = await getOrderMessages(orderId);
        setMessages(msgs);
        await markMessagesAsRead(orderId, 'user');
      } catch { toast.error('Failed to load messages'); }
      finally { setLoading(false); }
    };

    loadAll();

    const ch = supabase.channel(`mobile-chat-${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` }, async () => {
        const msgs = await getOrderMessages(orderId);
        setMessages(msgs);
        if (user) markMessagesAsRead(orderId, 'user');
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user, orderId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !orderId || !user) return;
    setSending(true);
    try {
      await sendOrderMessage(orderId, newMessage.trim(), 'user');
      setNewMessage('');
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  // ── Order picker ─────────────────────────────────────────────────────────
  if (!orderId) {
    return (
      <MobileLayout>
        <PageMeta title="Chat Support" />
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Chat Support</h1>
              <p className="text-xs text-muted-foreground">Select an order to start chatting</p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}><CardContent className="p-4 flex gap-3 items-center">
                  <Skeleton className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                </CardContent></Card>
              ))}
            </div>
          ) : userOrders.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground opacity-30" />
              <p className="font-semibold">No orders found</p>
              <Button onClick={() => navigate(MOBILE_ROUTES.products)}>Shop Now</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {userOrders.map(o => (
                <Card
                  key={o.id}
                  className="cursor-pointer active:scale-[0.98] hover:border-primary/40 transition-all"
                  onClick={() => navigate(`${MOBILE_ROUTES.chat}?orderId=${o.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · {o.status}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{o.items?.length ?? 0} items</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // ── Chat view ─────────────────────────────────────────────────────────────
  return (
    <MobileLayout>
      <PageMeta title="Chat" />
      <div className="flex flex-col h-[calc(100vh-7.5rem)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button
            onClick={() => navigate(MOBILE_ROUTES.chat)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            {loading ? (
              <Skeleton className="h-4 w-32 bg-muted" />
            ) : (
              <>
                <p className="text-sm font-semibold truncate">
                  Order #{orderId?.slice(0, 8).toUpperCase()}
                </p>
                {order && (
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                )}
              </>
            )}
          </div>
          <div className="p-1.5 bg-primary/10 rounded-full">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <Skeleton className="h-12 w-48 rounded-2xl bg-muted" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Send a message to start the conversation</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {messages.map(msg => {
                const isMe = msg.user_id === user?.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-6 w-6 shrink-0 mb-1">
                      <AvatarFallback className={`text-[10px] ${msg.sender_role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.sender_role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        {msg.image_url && (
                          <img src={msg.image_url} alt="attachment" className="rounded-lg mb-1 max-w-[150px]" />
                        )}
                        {msg.message && <p>{msg.message}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input bar */}
        <div className="border-t bg-background px-3 py-2.5 flex items-end gap-2 shrink-0">
          <Textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none min-h-[38px] max-h-24 text-sm py-2"
          />
          <Button
            size="icon"
            className="h-9 w-9 rounded-full shrink-0"
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
