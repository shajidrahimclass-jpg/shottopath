import { useRef, useState, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { cn } from '@/lib/utils';

interface PinchZoomImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function PinchZoomImage({ src, alt, className }: PinchZoomImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const bind = useGesture(
    {
      onPinch: ({ offset: [d], memo = scale }) => {
        if (!isMobile) return memo;
        
        const newScale = Math.max(1, Math.min(memo + d / 200, 4));
        setScale(newScale);
        
        // Reset position when zooming out to 1
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        
        return memo;
      },
      onDrag: ({ offset: [x, y], pinching }) => {
        if (!isMobile || pinching || scale === 1) return;
        
        // Limit dragging based on scale
        const maxX = (imageRef.current?.offsetWidth || 0) * (scale - 1) / 2;
        const maxY = (imageRef.current?.offsetHeight || 0) * (scale - 1) / 2;
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, x)),
          y: Math.max(-maxY, Math.min(maxY, y)),
        });
      },
      onDoubleClick: () => {
        if (!isMobile) return;
        
        if (scale === 1) {
          setScale(2);
        } else {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      },
    },
    {
      drag: {
        from: () => [position.x, position.y],
      },
      pinch: {
        scaleBounds: { min: 1, max: 4 },
        rubberband: true,
      },
    }
  );

  // Don't apply gestures on desktop
  if (!isMobile) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-contain', className)}
        draggable="false"
      />
    );
  }

  return (
    <div
      ref={imageRef}
      {...bind()}
      className={cn('touch-none overflow-hidden', className)}
      style={{
        cursor: scale > 1 ? 'grab' : 'default',
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain select-none"
        draggable="false"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
        }}
      />
    </div>
  );
}
