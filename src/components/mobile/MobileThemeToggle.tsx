import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeOption = 'light' | 'dark' | 'system';

const OPTIONS: { value: ThemeOption; icon: React.ElementType; label: string }[] = [
  { value: 'light',  icon: Sun,     label: 'Light'  },
  { value: 'dark',   icon: Moon,    label: 'Dark'   },
  { value: 'system', icon: Monitor, label: 'System' },
];

interface MobileThemeToggleProps {
  /** 'default' = on bg-background (default). 'light' = on dark/colored bg */
  variant?: 'default' | 'light';
}

/** Compact 3-pill switcher — renders inline, ~96px wide */
export function MobileThemeToggle({ variant = 'default' }: MobileThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-24 h-8" />;

  const onLight = variant === 'light';

  return (
    <div className={`flex items-center rounded-full p-0.5 gap-0.5 ${
      onLight
        ? 'border border-white/30 bg-white/10'
        : 'border border-border bg-muted/50'
    }`}>
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return <></>;
      })}
    </div>
  );
}

/** Large card-style 3-option selector for settings screens */
export function MobileThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200 active:scale-95 ${
              active
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-all duration-200 ${active ? 'text-primary' : ''}`}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={`text-[11px] font-semibold ${active ? 'text-primary' : ''}`}>{label}</span>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
