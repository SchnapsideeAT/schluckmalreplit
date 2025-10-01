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
      className={`scrollable-container ${needsScroll ? 'scrollable-enabled' : ''} ${className || ''}`}
    >
      {children}
    </div>
  );
};
