import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOBILE_ROUTES } from '@/components/layouts/MobileLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { MobileThemeToggle } from '@/components/mobile/MobileThemeToggle';
import { PageTransition } from '@/components/mobile/PageTransition';
import {
  LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User,
  ShoppingBag, Zap, Shield, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

type Tab = 'login' | 'register';

export default function MobileLoginPage() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { appSettings } = useAppSettings();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect once authenticated
  useEffect(() => {
    if (user) navigate(MOBILE_ROUTES.home, { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { error } = await signInWithEmail(loginForm.email, loginForm.password);
      if (error) toast.error(error.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all fields'); return;
    }
    if (registerForm.password !== registerForm.confirm) {
      toast.error('Passwords do not match'); return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(registerForm.email, registerForm.password, registerForm.name);
      if (error) { toast.error(error.message || 'Registration failed'); return; }
      toast.success('Account created! Check your email to verify.');
    } finally { setLoading(false); }
  };

  const brandName = appSettings?.navbar_name || 'Shottopoth';
  const faviconUrl = appSettings?.favicon_url;

  const perks = [
    { icon: ShoppingBag, text: 'Track all your orders' },
    { icon: Zap,         text: 'Faster checkout experience' },
    { icon: Shield,      text: 'Secure & private account' },
  ];

  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6)  s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(registerForm.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', 'bg-destructive', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][strength];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      const errMsg = error.message || String(error);
      if (errMsg.includes('not enabled') || errMsg.includes('Unsupported provider')) {
        toast.error('Google Sign-in is not enabled on this server. Please use email and password.');
      } else {
        toast.error(error.message || 'Google Sign-in failed');
      }
    }
    setLoading(false);
  };

  return (
    /* Standalone full-page wrapper — no bottom nav for auth flow */
    <PageTransition><div className="flex flex-col min-h-screen max-w-md mx-auto bg-background overflow-x-hidden"
         style={{ boxShadow: '0 0 40px rgba(0,0,0,0.15)' }}>
      <PageMeta title="Sign In" />

      {/* ── Minimal top bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 absolute top-0 inset-x-0 z-20">
        <button
          onClick={() => navigate(MOBILE_ROUTES.home)}
          className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium">Home</span>
        </button>
        {/* Theme toggle — dark pill on gradient bg */}
        <div className="bg-black/20 backdrop-blur-sm rounded-full p-0.5">
          <MobileThemeToggle variant="light" />
        </div>
      </div>

      {/* ── Hero / brand section ──────────────────────────────── */}
      <div className="relative overflow-hidden shrink-0 bg-primary text-primary-foreground">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-8 right-16 h-16 w-16 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 px-6 pt-14 pb-16">
          {/* Logo + brand name */}
          <div className="flex items-center gap-3 mb-5">
            {faviconUrl ? (
              <img src={faviconUrl} alt={brandName} className="h-12 w-12 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-primary-foreground leading-tight">{brandName}</h1>
              <p className="text-primary-foreground/70 text-xs">Your trusted shopping partner</p>
            </div>
          </div>

          {/* Value perks */}
          <div className="space-y-2">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-primary-foreground/90">
                <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Auth card floated over hero ───────────────────────── */}
      <div className="flex-1 px-4 -mt-6 pb-8">
        <div className="bg-background rounded-2xl shadow-xl overflow-hidden border border-border/40">

          {/* Custom animated tab switcher */}
          <div className="grid grid-cols-2 border-b border-border">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3.5 text-sm font-semibold transition-all relative ${
                  tab === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
                {tab === t && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-t-full transition-all duration-300 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── SIGN IN FORM ───────────────────────────── */}
            {tab === 'login' && (
              <>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      autoComplete="email"
                      className="h-12 pl-10 text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="login-pass" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-pass"
                      type={showLoginPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      autoComplete="current-password"
                      className="h-12 pl-10 pr-11 text-sm rounded-xl"
                    />
                    <button type="button" onClick={() => setShowLoginPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                      {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-60 transition-opacity mt-1"
                  
                >
                  {loading
                    ? <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    : <LogIn className="h-4 w-4" />}
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-primary font-semibold">
                    Register now
                  </button>
                </p>
              </form>
              {/* Google SSO */}
              <div className="mt-4 space-y-3">
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-border" />
                  <span className="mx-3 text-xs text-muted-foreground uppercase">Or continue with</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
              </>
            )}

            {/* ── REGISTER FORM ──────────────────────────── */}
            {tab === 'register' && (
              <>
              <form onSubmit={handleRegister} className="space-y-3.5">

                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="reg-name" placeholder="Your full name" value={registerForm.name}
                      onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                      className="h-12 pl-10 text-sm rounded-xl" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="reg-email" type="email" placeholder="your@email.com" value={registerForm.email}
                      onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                      className="h-12 pl-10 text-sm rounded-xl" />
                  </div>
                </div>

                {/* Password + strength meter */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="reg-pass" type={showRegPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters" value={registerForm.password}
                      onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                      className="h-12 pl-10 pr-11 text-sm rounded-xl" />
                    <button type="button" onClick={() => setShowRegPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                      {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.password.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-muted'}`} />
                        ))}
                      </div>
                      <p className={`text-[10px] font-semibold ${
                        strength <= 1 ? 'text-destructive' :
                        strength <= 2 ? 'text-amber-500' :
                        strength <= 3 ? 'text-yellow-500' : 'text-green-500'
                      }`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="reg-confirm" type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Repeat password" value={registerForm.confirm}
                      onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))}
                      className="h-12 pl-10 pr-11 text-sm rounded-xl" />
                    <button type="button" onClick={() => setShowConfirmPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.confirm.length > 0 && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold ${
                      registerForm.password === registerForm.confirm ? 'text-green-500' : 'text-destructive'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {registerForm.password === registerForm.confirm ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-60 transition-opacity mt-1"
                  
                >
                  {loading
                    ? <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    : <UserPlus className="h-4 w-4" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-primary font-semibold">
                    Sign in
                  </button>
                </p>
              </form>
              {/* Google SSO */}
              <div className="mt-4 space-y-3">
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-border" />
                  <span className="mx-3 text-xs text-muted-foreground uppercase">Or continue with</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
              </>
            )}
          </div>

          {/* Terms footer */}
          <div className="px-5 py-3 bg-muted/30 border-t border-border/50">
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              By continuing you agree to our{' '}
              <span className="text-primary font-medium cursor-pointer">Terms & Conditions</span>
              {' '}and{' '}
              <span className="text-primary font-medium cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div></PageTransition>
  );
}

