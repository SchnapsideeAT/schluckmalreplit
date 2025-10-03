import { ReactNode, useRef } from 'react';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { cn } from '@/lib/utils';

interface ScrollableContainerProps {
  children: ReactNode;
  className?: string;
}

export const ScrollableContainer = ({ children, className }: ScrollableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const needsScroll = useScrollDetection({ containerRef });

  return (
    <div
      ref={containerRef}
      className={cn(
        'scrollable-container bg-background',
        needsScroll ? 'scrollable-enabled' : '',
        className
      )}
      style={{
        paddingTop: `max(1rem, env(safe-area-inset-top))`,
        paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      {children}
    </div>
  );
};
