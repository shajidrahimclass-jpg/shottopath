import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminBasePath } from '@/config/admin';

interface RouteGuardProps {
  children: React.ReactNode;
}

// 로그인 없이 접근 가능한 공개 경로
const PUBLIC_ROUTES = [
  '/login', '/forgot-password', '/reset-password', '/verify-email',
  '/403', '/404', '/', '/products', '/products/*', '/app',
  '/terms', '/reviews',
  // Mobile web app — entire subtree is public (auth handled internally per page)
  '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op',
  '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/*',
];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);
    const adminBasePath = getAdminBasePath();
    const isAdminRoute = location.pathname.startsWith(adminBasePath);

    // /admin 또는 /admin/* 같은 짧은 경로가 잘못 접근될 경우 홈으로 리다이렉트
    const isGenericAdminPath =
      location.pathname === '/admin' || location.pathname.startsWith('/admin/');
    if (isGenericAdminPath && !isAdminRoute) {
      navigate('/', { replace: true });
      return;
    }

    // 비로그인 사용자를 보호된 경로에서 로그인 페이지로 리다이렉트
    if (!user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    // 관리자 경로에 일반 사용자 접근 시 홈으로 리다이렉트
    if (isAdminRoute && profile && profile.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}