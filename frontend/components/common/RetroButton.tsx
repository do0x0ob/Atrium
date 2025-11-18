import React from 'react';

export type RetroButtonVariant = 'primary' | 'secondary' | 'danger';
export type RetroButtonSize = 'sm' | 'md' | 'lg';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RetroButtonVariant;
  size?: RetroButtonSize;
  children: React.ReactNode;
  isLoading?: boolean;
}

/**
 * RetroButton - A reusable button component that matches the retro OS aesthetic
 * 
 * Features:
 * - Beveled 3D edges with inset/outset shadows
 * - Press-down effect on active state
 * - Multiple variants: primary, secondary, danger
 * - Consistent with Window component styling
 */
export const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md',
    children, 
    className = '',
    disabled,
    isLoading,
    ...props 
  }, ref) => {
    
    // Size configurations
    const sizeStyles = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-1.5 text-xs',
      lg: 'px-5 py-2 text-sm',
    };

    // Variant configurations - White theme
    const variantStyles = {
      primary: {
        bg: '#1f2937',
        hoverBg: '#111827',
        activeBg: '#374151',
        text: '#ffffff',
        disabledBg: '#d1d5db',
        disabledText: '#9ca3af',
      },
      secondary: {
        bg: '#f3f4f6',
        hoverBg: '#e5e7eb',
        activeBg: '#f9fafb',
        text: '#374151',
        disabledBg: '#f9fafb',
        disabledText: '#d1d5db',
      },
      danger: {
        bg: '#fef2f2',
        hoverBg: '#fee2e2',
        activeBg: '#fef2f2',
        text: '#dc2626',
        disabledBg: '#f9fafb',
        disabledText: '#fca5a5',
      },
    };

    const currentVariant = variantStyles[variant];
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`
          relative font-medium transition-all duration-75
          ${sizeStyles[size]}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          backgroundColor: isDisabled ? currentVariant.disabledBg : currentVariant.bg,
          color: isDisabled ? currentVariant.disabledText : currentVariant.text,
          fontFamily: 'Georgia, serif',
          
          // 3D beveled edges - raised button effect (white theme)
          borderTop: isDisabled ? '2px solid #e5e7eb' : '2px solid #d1d5db',
          borderLeft: isDisabled ? '2px solid #e5e7eb' : '2px solid #d1d5db',
          borderBottom: isDisabled ? '2px solid #f9fafb' : '2px solid #9ca3af',
          borderRight: isDisabled ? '2px solid #f9fafb' : '2px solid #9ca3af',
          
          // Inner shadows for depth (lighter for white theme)
          boxShadow: isDisabled
            ? 'inset 0 0 0 1px #e5e7eb'
            : `
                inset 1px 1px 2px rgba(255, 255, 255, 0.9),
                inset -1px -1px 2px rgba(0, 0, 0, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.05)
              `,
        }}
        disabled={isDisabled}
        onMouseDown={(e) => {
          if (!isDisabled) {
            // Press-down effect (white theme)
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 3px rgba(0, 0, 0, 0.15),
              inset -1px -1px 1px rgba(255, 255, 255, 0.8)
            `;
            e.currentTarget.style.borderTop = '2px solid #9ca3af';
            e.currentTarget.style.borderLeft = '2px solid #9ca3af';
            e.currentTarget.style.borderBottom = '2px solid #d1d5db';
            e.currentTarget.style.borderRight = '2px solid #d1d5db';
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            // Reset to raised state (white theme)
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 2px rgba(255, 255, 255, 0.9),
              inset -1px -1px 2px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.05)
            `;
            e.currentTarget.style.borderTop = '2px solid #d1d5db';
            e.currentTarget.style.borderLeft = '2px solid #d1d5db';
            e.currentTarget.style.borderBottom = '2px solid #9ca3af';
            e.currentTarget.style.borderRight = '2px solid #9ca3af';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            // Reset on mouse leave (white theme)
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 2px rgba(255, 255, 255, 0.9),
              inset -1px -1px 2px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.05)
            `;
            e.currentTarget.style.borderTop = '2px solid #d1d5db';
            e.currentTarget.style.borderLeft = '2px solid #d1d5db';
            e.currentTarget.style.borderBottom = '2px solid #9ca3af';
            e.currentTarget.style.borderRight = '2px solid #9ca3af';
          }
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = currentVariant.hoverBg;
          }
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = currentVariant.bg;
          }
        }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';

