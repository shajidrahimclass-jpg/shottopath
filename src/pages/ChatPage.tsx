import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageZoom } from '@/components/ui/image-zoom';
import { Send, MessageCircle, User, Shield, X, ArrowLeft, Paperclip, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getOrderMessages, sendOrderMessage, markMessagesAsRead, uploadChatImage, getOrders, deleteOrderMessage } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { OrderMessageWithProfile, OrderWithItems } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  // Order picker state (shown when no orderId in URL)
  const [userOrders, setUserOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [messages, setMessages] = useState<OrderMessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user orders for the picker when no orderId
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/chat' } });
      return;
    }
    if (!orderId) {
      setOrdersLoading(true);
      getOrders(user.id)
        .then(setUserOrders)
        .catch(() => toast.error('주문 목록을 불러오지 못했습니다.'))
        .finally(() => setOrdersLoading(false));
    }
  }, [user, orderId, navigate]);

  useEffect(() => {
    if (!user || !orderId) return;

    loadOrderAndMessages();
    markAsRead();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          loadMessages();
          markAsRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId, navigate]);

  // Disappearing chat logic
  useEffect(() => {
    if (!order?.disappearing_chat || !orderId) return;

    const cleanupInterval = setInterval(async () => {
      try {
        const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
        // Use SECURITY DEFINER RPC — avoids 403 for regular users
        await supabase.rpc('cleanup_disappearing_messages', {
          p_order_id:        orderId,
          p_before_timestamp: thirtySecondsAgo,
        });
      } catch (error) {
        console.error('Failed to cleanup disappearing messages:', error);
      }
    }, 10000);

    return () => clearInterval(cleanupInterval);
  }, [order?.disappearing_chat, orderId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const loadOrderAndMessages = async () => {
    try {
      setLoading(true);
      if (user) {
        const orders = await getOrders(user.id);
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
      await loadMessages();
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!orderId) return;
    try {
      const data = await getOrderMessages(orderId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!orderId) return;
    try {
      await markMessagesAsRead(orderId, 'user');
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) {
      toast.error('Please enter a message or select an image');
      return;
    }

    if (!orderId) return;

    try {
      setSending(true);
      let imageUrl: string | null = null;

      if (selectedImage) {
        setUploading(true);
        try {
          imageUrl = await uploadChatImage(selectedImage, orderId);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload image. Sending message without image.');
        }
        setUploading(false);
      }

      await sendOrderMessage(orderId, newMessage || '📷 Image', 'user', imageUrl);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteOrderMessage(messageId);
      toast.success('Message deleted');
      loadMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  // ── Order picker (no orderId in URL) ──────────────────────────────────────
  if (!orderId) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">고객 지원 채팅</h1>
              <p className="text-sm text-muted-foreground">채팅할 주문을 선택하세요</p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-muted" />
                      <Skeleton className="h-3 w-48 bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-14 text-center gap-4">
                <ShoppingBag className="h-14 w-14 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-base">주문 내역이 없습니다</p>
                  <p className="text-sm text-muted-foreground mt-1">주문 후 고객 지원을 이용하실 수 있습니다.</p>
                </div>
                <Button onClick={() => navigate('/products')}>
                  쇼핑하러 가기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userOrders.map((o) => (
                <Card
                  key={o.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  onClick={() => navigate(`/chat?orderId=${o.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        주문 #{o.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('ko-KR')} •{' '}
                        <span className="capitalize">{o.status}</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {o.items?.length ?? 0}개 상품
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // ── Loading skeleton (orderId present) ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2 bg-muted" />
              <Skeleton className="h-4 w-48 bg-muted" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4 bg-muted" />
            <Skeleton className="h-6 w-32 mx-auto bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <MessageCircle className="h-20 w-20 mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-3">주문을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-8">해당 주문이 존재하지 않거나 접근 권한이 없습니다.</p>
          <Button onClick={() => navigate('/chat')} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            주문 목록으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/orders')}
            className="shrink-0 h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm md:text-lg">Admin Support</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Order #{order.id.slice(0, 8)} • {order.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {order?.disappearing_chat && (
        <div className="bg-destructive/10 text-destructive text-[10px] md:text-xs py-1.5 px-3 text-center border-b border-destructive/20 font-medium flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          Disappearing Chat Active — Messages self-destruct after 30 seconds
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-3 md:px-4" ref={scrollRef}>
        <div className="container mx-auto max-w-4xl py-4 md:py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
              <div className="p-4 md:p-6 bg-primary/5 rounded-full mb-4 md:mb-6">
                <MessageCircle className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Start a Conversation</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Send a message to get help with your order. Our admin team will respond as soon as possible.
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_role === 'user';
                const isAdminMessage = message.sender_role === 'admin';
                const showAvatar = index === 0 || messages[index - 1].sender_role !== message.sender_role;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 md:gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-300 group`}
                  >
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0 border-2 border-background shadow-sm">
                        <AvatarFallback className={isAdminMessage ? 'bg-primary/10' : 'bg-secondary/10'}>
                          {isAdminMessage ? (
                            <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          ) : (
                            <User className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 md:w-10 shrink-0" />
                    )}

                    <div className={`flex flex-col gap-1 md:gap-1.5 max-w-[80%] sm:max-w-[75%] md:max-w-[60%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs md:text-sm font-medium text-foreground">
                            {isAdminMessage ? 'Admin' : 'You'}
                          </span>
                          {isAdminMessage && (
                            <Badge variant="secondary" className="text-xs px-1.5 md:px-2 py-0 h-4 md:h-5">
                              Support
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="relative">
                        <div
                          className={`rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-card border rounded-tl-sm'
                          }`}
                        >
                          {message.image_url && (
                            <div className="relative group">
                              <ImageZoom
                                src={message.image_url}
                                alt="Chat attachment"
                                className="max-w-full h-auto max-h-60 md:max-h-80 object-contain rounded-lg"
                              />
                            </div>
                          )}
                          {message.message && message.message !== '📷 Image' && (
                            <div className="px-3 py-2 md:px-4 md:py-3">
                              <p className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {message.message}
                              </p>
                            </div>
                          )}
                        </div>

                        {isOwnMessage && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground px-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card shadow-lg">
        <div className="container mx-auto max-w-4xl px-3 md:px-4 py-3 md:py-4">
          {imagePreview && (
            <div className="mb-3 md:mb-4 relative inline-block animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 md:h-28 md:w-28 object-cover rounded-lg md:rounded-xl border-2 border-primary shadow-md"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 md:h-7 md:w-7 rounded-full shadow-lg"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 md:gap-3 items-end">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="chat-image-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
            >
              <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[40px] md:min-h-[48px] max-h-[100px] md:max-h-[120px] resize-none rounded-lg md:rounded-xl pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base"
                disabled={sending || uploading}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || uploading || (!newMessage.trim() && !selectedImage)}
              className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl"
              size="icon"
            >
              {uploading ? (
                <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
