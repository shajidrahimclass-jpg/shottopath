import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, ClipboardList, User, MessageCircle, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserNotifications } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { MobileThemeToggle } from '@/components/mobile/MobileThemeToggle';
import { PageTransition } from '@/components/mobile/PageTransition';

const MOBILE_BASE = '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op';

export const MOBILE_ROUTES = {
  home: MOBILE_BASE,
  products: `${MOBILE_BASE}/products`,
  cart: `${MOBILE_BASE}/cart`,
  orders: `${MOBILE_BASE}/orders`,
  profile: `${MOBILE_BASE}/profile`,
  inbox: `${MOBILE_BASE}/inbox`,
  chat: `${MOBILE_BASE}/chat`,
  recentlyViewed: `${MOBILE_BASE}/recently-viewed`,
  productDetail: (slug: string) => `${MOBILE_BASE}/products/${slug}`,
  checkout: `${MOBILE_BASE}/checkout`,
  login: `${MOBILE_BASE}/login`,
};

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { user, profile } = useAuth();
  const { appSettings } = useAppSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Cart count from localStorage
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('cart');
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
      } catch { setCartCount(0); }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [location]);

  // Unread notifications
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const fetchUnread = async () => {
      try {
        const n = await getUserNotifications(user.id);
        setUnread(n.filter(x => !x.read).length);
      } catch { /* silent */ }
    };
    fetchUnread();
    const ch = supabase.channel('mobile-notif-layout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const go = (path: string) => navigate(path);
  const active = (path: string) => {
    if (path === MOBILE_ROUTES.home) return location.pathname === path;
    // Products: highlight for /products and /products/:slug
    if (path === MOBILE_ROUTES.products) {
      return location.pathname === path || location.pathname.startsWith(MOBILE_ROUTES.products + '/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const tabs = user ? [
    { path: MOBILE_ROUTES.home,     icon: Home,         label: 'Home',   badge: 0 },
    { path: MOBILE_ROUTES.products, icon: Package,      label: 'Shop',   badge: 0 },
    { path: MOBILE_ROUTES.cart,     icon: ShoppingCart, label: 'Cart',   badge: cartCount },
    { path: MOBILE_ROUTES.orders,   icon: ClipboardList,label: 'Orders', badge: 0 },
    { path: MOBILE_ROUTES.inbox,    icon: Bell,         label: 'Inbox',  badge: unread },
    { path: MOBILE_ROUTES.profile,  icon: User,         label: 'Profile',badge: 0 },
  ] : [
    { path: MOBILE_ROUTES.home,     icon: Home,         label: 'Home',   badge: 0 },
    { path: MOBILE_ROUTES.products, icon: Package,      label: 'Shop',   badge: 0 },
    { path: MOBILE_ROUTES.cart,     icon: ShoppingCart, label: 'Cart',   badge: cartCount },
    { path: MOBILE_ROUTES.login,    icon: User,         label: 'Sign In',badge: 0 },
  ];

  // Get first letter of name for avatar
  const initials = (profile?.username || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative overflow-x-hidden"
         style={{ boxShadow: '0 0 60px rgba(0,0,0,0.18)' }}>

      {/* ── Top header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-3 h-14 flex items-center justify-between shrink-0 gap-2">
        {/* Logo / brand */}
        <button onClick={() => go(MOBILE_ROUTES.home)} className="flex items-center gap-2.5 min-w-0 shrink-0">
          {appSettings?.favicon_url ? (
            <img src={appSettings.favicon_url} alt="logo" className="h-8 w-8 rounded-xl object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                 style={{ background: 'var(--gradient-primary)' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-base font-black tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-primary)' }}>
            {appSettings?.navbar_name || 'Shottopoth'}
          </span>
        </button>

        <div className="flex-1" />

        {/* Theme toggle */}
        <MobileThemeToggle />

        {/* Right actions */}
        {user && (
          <div className="flex items-center gap-0.5">
            <button onClick={() => go(MOBILE_ROUTES.chat)}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors" aria-label="Chat">
              <MessageCircle className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
            <button onClick={() => go(MOBILE_ROUTES.inbox)}
              className="relative p-2 rounded-full hover:bg-muted/80 transition-colors" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
              )}
            </button>
            <button onClick={() => go(MOBILE_ROUTES.profile)}
              className="ml-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md"
              style={{ background: 'var(--gradient-primary)' }} aria-label="Profile">
              <span className="text-white font-bold text-xs">{initials}</span>
            </button>
          </div>
        )}
        {!user && (
          <button onClick={() => go(MOBILE_ROUTES.login)}
            className="shrink-0 px-3.5 h-8 rounded-full text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-transform"
            style={{ background: 'var(--gradient-primary)' }}>
            Sign In
          </button>
        )}
      </header>

      {/* ── Scrollable content ───────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-28">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* ── Floating pill bottom tab bar ─────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-3"
           style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
        <div className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl overflow-hidden"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="grid h-[60px]" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map(({ path, icon: Icon, label, badge }) => {
              const isActive = active(path);
              return (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className="flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 active:scale-90"
                  aria-label={label}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <span className="absolute inset-x-1.5 top-1 bottom-1 rounded-xl pointer-events-none"
                          style={{ background: 'var(--gradient-primary)', opacity: 0.12 }} />
                  )}
                  {/* Active top accent line */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                          style={{ background: 'var(--gradient-primary)' }} />
                  )}
                  <div className="relative z-10">
                    <div className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                      <Icon
                        className={`h-[20px] w-[20px] transition-all duration-200 ${
                          isActive ? 'text-primary drop-shadow-sm' : 'text-muted-foreground'
                        }`}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-white text-[9px] font-bold px-0.5 shadow-sm">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold leading-none z-10 transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
