import React from 'react';

interface RetroPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'inset' | 'outset';
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const RetroPanel = React.forwardRef<HTMLDivElement, RetroPanelProps>(
  ({ children, className = '', variant = 'inset', onClick }, ref) => {
    
    const styles = variant === 'inset' ? {
      // Inset panel - looks pressed into the surface (white theme)
      borderTop: '2px solid #9ca3af',
      borderLeft: '2px solid #9ca3af',
      borderBottom: '2px solid #f3f4f6',
      borderRight: '2px solid #f3f4f6',
      boxShadow: `
        inset 2px 2px 4px rgba(0, 0, 0, 0.06),
        inset -1px -1px 2px rgba(255, 255, 255, 0.9),
        0 1px 0 rgba(255, 255, 255, 1)
      `,
    } : {
      // Outset (raised) panel - looks raised from the surface (white theme)
      borderTop: '2px solid #f3f4f6',
      borderLeft: '2px solid #f3f4f6',
      borderBottom: '2px solid #9ca3af',
      borderRight: '2px solid #9ca3af',
      boxShadow: `
        inset 1px 1px 2px rgba(255, 255, 255, 0.9),
        inset -1px -1px 2px rgba(0, 0, 0, 0.05),
        0 2px 4px rgba(0, 0, 0, 0.05)
      `,
    };

    return (
      <div
        ref={ref}
        className={className}
        onClick={onClick}
        style={{
          backgroundColor: '#ffffff',
          ...styles,
        }}
      >
        {children}
      </div>
    );
  }
);

RetroPanel.displayName = 'RetroPanel';

