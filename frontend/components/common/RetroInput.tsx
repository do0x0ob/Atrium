'use client';

import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'dark';
}

export const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: {
        bg: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
        borderDark: '#9ca3af',
        placeholder: 'rgba(156, 163, 175, 0.5)',
        focus: 'rgba(107, 114, 128, 0.8)',
      },
      dark: {
        bg: '#f9fafb',
        text: '#1f2937',
        border: '#d1d5db',
        borderDark: '#6b7280',
        placeholder: 'rgba(156, 163, 175, 0.4)',
        focus: 'rgba(75, 85, 99, 0.8)',
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 text-sm
          transition-all duration-150
          outline-none
          ${className}
        `}
        style={{
          backgroundColor: currentVariant.bg,
          color: currentVariant.text,
          fontFamily: 'Georgia, serif',
          borderTop: `2px solid ${currentVariant.borderDark}`,
          borderLeft: `2px solid ${currentVariant.borderDark}`,
          borderBottom: `2px solid ${currentVariant.border}`,
          borderRight: `2px solid ${currentVariant.border}`,
          boxShadow: `
            inset 2px 2px 3px rgba(0, 0, 0, 0.06),
            inset -1px -1px 2px rgba(255, 255, 255, 0.9)
          `,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderTop = `2px solid ${currentVariant.focus}`;
          e.currentTarget.style.borderLeft = `2px solid ${currentVariant.focus}`;
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 4px rgba(0, 0, 0, 0.08),
            inset -1px -1px 2px rgba(255, 255, 255, 0.8),
            0 0 0 1px ${currentVariant.focus}
          `;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderTop = `2px solid ${currentVariant.borderDark}`;
          e.currentTarget.style.borderLeft = `2px solid ${currentVariant.borderDark}`;
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 3px rgba(0, 0, 0, 0.06),
            inset -1px -1px 2px rgba(255, 255, 255, 0.9)
          `;
        }}
        {...props}
      />
    );
  }
);

RetroInput.displayName = 'RetroInput';

