import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders } from '@/db/api';
import type { OrderWithItems } from '@/types';
import {
  LogOut, Package, ChevronRight, ShoppingBag,
  MessageCircle, Bell, CheckCircle2, Clock, Truck, Palette, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { MobileThemeSelector } from '@/components/mobile/MobileThemeToggle';

export default function MobileProfilePage() {
  const { user, profile, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate(MOBILE_ROUTES.login); return; }
    getOrders(user.id)
      .then(d => setOrders(d))
      .catch(() => {});
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(MOBILE_ROUTES.home);
      toast.success('Signed out successfully');
    } catch { toast.error('Sign out failed'); }
  };

  const initials = (profile?.username || user?.email || 'U').slice(0, 2).toUpperCase();
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Shopper';

  const orderStats = [
    { label: 'All Orders', value: orders.length, icon: ShoppingBag, grad: 'from-violet-500 to-purple-600' },
    { label: 'Pending',    value: orders.filter(o => ['pending', 'processing'].includes(o.status)).length, icon: Clock, grad: 'from-amber-400 to-orange-500' },
    { label: 'Shipped',   value: orders.filter(o => o.status === 'on_the_way').length, icon: Truck, grad: 'from-blue-400 to-indigo-500' },
    { label: 'Done',      value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle2, grad: 'from-green-400 to-emerald-600' },
  ];

  const menuItems = [
    { label: 'My Orders',        icon: Package,       path: MOBILE_ROUTES.orders,         desc: `${orders.length} order${orders.length !== 1 ? 's' : ''}`, grad: 'from-violet-500 to-purple-600' },
    { label: 'Recently Viewed',  icon: Clock,         path: MOBILE_ROUTES.recentlyViewed, desc: 'Your browsing history',   grad: 'from-teal-400 to-cyan-500' },
    { label: 'Chat Support',     icon: MessageCircle, path: MOBILE_ROUTES.chat,           desc: 'Talk to our team',        grad: 'from-blue-400 to-indigo-500' },
    { label: 'Notifications',    icon: Bell,          path: MOBILE_ROUTES.inbox,          desc: 'Inbox & alerts',          grad: 'from-amber-400 to-orange-500' },
  ];

  if (!user) return null;

  return (
    <MobileLayout>
      <PageMeta title="Profile" />

      {/* ── Hero gradient strip with floating avatar ──── */}
      <div className="relative">
        {/* Wide gradient bg */}
        <div className="h-36 w-full relative overflow-hidden"
             style={{ background: 'var(--gradient-primary)' }}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-5 right-24 h-16 w-16 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* Avatar + name card floating over strip */}
        <div className="px-4 -mt-12">
          <div className="bg-card rounded-3xl border border-border/40 shadow-xl p-4">
            <div className="flex items-end gap-4 -mt-10 mb-3">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-2xl border-4 border-card shrink-0 flex items-center justify-center text-white font-black text-2xl shadow-xl"
                   style={{ background: 'var(--gradient-primary)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="font-black text-base truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
              </div>
              <div className="pb-1 shrink-0">
                <span className="text-[10px] font-black text-white px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--gradient-primary)' }}>Member</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 space-y-4 pb-8">

        {/* ── Order stats grid ─────────────────────────── */}
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
            Order Overview
          </p>
          <div className="grid grid-cols-4 gap-2">
            {orderStats.map(({ label, value, icon: Icon, grad }) => (
              <button key={label}
                onClick={() => navigate(MOBILE_ROUTES.orders)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br ${grad} active:scale-95 transition-transform shadow-sm`}>
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                <span className="text-lg font-black text-white leading-none">{value}</span>
                <span className="text-[9px] font-bold text-white/80 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Menu items ───────────────────────────────── */}
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
            Quick Links
          </p>
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            {menuItems.map(({ label, icon: Icon, path, desc, grad }, i) => (
              <button key={label} onClick={() => navigate(path)}
                className="relative w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-muted/50 transition-colors text-left">
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-muted-foreground font-medium">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                {i < menuItems.length - 1 && (
                  <span className="absolute bottom-0 left-[52px] right-0 h-px bg-border/50" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Theme preferences ────────────────────────── */}
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
            Appearance
          </p>
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                <Palette className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold">Theme</p>
                <p className="text-xs text-muted-foreground font-medium">Choose your look</p>
              </div>
            </div>
            <MobileThemeSelector />
          </div>
        </div>

        {/* ── Sign out ─────────────────────────────────── */}
        <button onClick={handleSignOut}
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 text-destructive font-black text-sm border-2 border-destructive/30 bg-destructive/5 active:scale-[0.98] transition-transform">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>

        {/* Branding footer */}
        <div className="text-center pt-2 pb-2">
          <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by Shottopoth
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
