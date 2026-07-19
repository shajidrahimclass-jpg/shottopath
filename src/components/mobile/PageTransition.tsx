/**
 * PageTransition — lightweight CSS-based enter animation for mobile pages.
 * Uses `key` from the current location pathname so React remounts the wrapper
 * on every route change, triggering the CSS animation fresh each time.
 */
import { useLocation } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Which direction to slide based on nav depth
function getTransitionStyle(prevPath: string | null, nextPath: string): React.CSSProperties {
  // Detail pages slide in from right; going back slides from left
  const isDeeper = prevPath && nextPath.length > prevPath.length && nextPath.startsWith(prevPath.split('/').slice(0, -1).join('/'));
  return isDeeper
    ? { '--tx': '28px' } as React.CSSProperties
    : { '--tx': '-14px' } as React.CSSProperties;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [key, setKey] = useState(location.pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;
    setStyle(getTransitionStyle(prev, location.pathname));
    setKey(location.pathname);
  }, [location.pathname]);

  return (
    <div
      key={key}
      style={style}
      className="mobile-page-enter w-full"
    >
      {children}
    </div>
  );
}
