import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/db/api';
import type { Notification } from '@/types';
import { Inbox, Bell, CheckCheck, Package, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

export default function MobileInboxPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate(MOBILE_ROUTES.login); return; }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const handleRead = async (n: Notification) => {
    if (!n.read) {
      try { await markNotificationAsRead(n.id); fetchNotifications(); } catch { /* silent */ }
    }
    if (n.link) navigate(n.link);
    else if (n.order_id) navigate(`${MOBILE_ROUTES.chat}?orderId=${n.order_id}`);
  };

  const handleReadAll = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      fetchNotifications();
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const unread = notifications.filter(n => !n.read).length;

  const typeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':   return <Package className="h-4 w-4 text-primary" />;
      case 'chat':
      case 'message': return <MessageCircle className="h-4 w-4 text-secondary" />;
      default:        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <MobileLayout>
      <PageMeta title="Inbox" />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Inbox</h1>
            {unread > 0 && (
              <Badge className="text-xs bg-destructive text-destructive-foreground">{unread}</Badge>
            )}
          </div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" onClick={handleReadAll}>
              <CheckCheck className="h-3.5 w-3.5" /> Read all
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-40 bg-muted" />
                <Skeleton className="h-3 w-full bg-muted" />
              </CardContent></Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Inbox className="h-16 w-16 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="font-semibold">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors active:scale-[0.99] ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}
                onClick={() => handleRead(n)}
              >
                <CardContent className="p-3 flex gap-3 items-start">
                  <div className={`p-2 rounded-full shrink-0 mt-0.5 ${!n.read ? 'bg-primary/10' : 'bg-muted'}`}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>
    </MobileLayout>
  );
}
