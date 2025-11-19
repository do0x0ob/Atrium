'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RetroSelectOption {
  value: string;
  label: string;
}

interface RetroSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: RetroSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'dark';
  placeholder?: string;
}

/**
 * RetroSelect - A retro-styled select dropdown component
 * 
 * Features:
 * - Beveled 3D edges matching RetroInput style
 * - Custom dropdown arrow
 * - Consistent with retro OS aesthetic
 */
export const RetroSelect = React.forwardRef<HTMLSelectElement, RetroSelectProps>(
  ({ 
    options,
    value,
    onChange,
    variant = 'default',
    placeholder = 'Select an option...',
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    const selectRef = useRef<HTMLSelectElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle forwarded ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(selectRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = selectRef.current;
      }
    }, [ref]);

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

    // Sync internal value with external value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
      setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === internalValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;
    const isEmpty = !internalValue;

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div
          className={`
            relative w-full px-3 py-2 text-sm
            transition-all duration-150
            cursor-pointer
            ${disabled ? 'cursor-not-allowed opacity-60' : ''}
          `}
          style={{
            backgroundColor: currentVariant.bg,
            color: isEmpty ? currentVariant.placeholder : currentVariant.text,
            fontFamily: 'Georgia, serif',
            borderTop: `2px solid ${currentVariant.borderDark}`,
            borderLeft: `2px solid ${currentVariant.borderDark}`,
            borderBottom: `2px solid ${currentVariant.border}`,
            borderRight: `2px solid ${currentVariant.border}`,
            boxShadow: isOpen
              ? `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.08),
                  inset -1px -1px 2px rgba(255, 255, 255, 0.8),
                  0 0 0 1px ${currentVariant.focus}
                `
              : `
                  inset 2px 2px 3px rgba(0, 0, 0, 0.06),
                  inset -1px -1px 2px rgba(255, 255, 255, 0.9)
                `,
          }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="block truncate">{displayText}</span>
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
              transition: 'transform 0.15s ease',
            }}
          >
            ▼
          </span>
        </div>

        {/* Hidden native select for form compatibility */}
        <select
          ref={selectRef}
          value={internalValue}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown menu */}
        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto"
            style={{
              backgroundColor: currentVariant.bg,
              borderTop: `2px solid ${currentVariant.borderDark}`,
              borderLeft: `2px solid ${currentVariant.borderDark}`,
              borderBottom: `2px solid ${currentVariant.border}`,
              borderRight: `2px solid ${currentVariant.border}`,
              boxShadow: `
                0 4px 6px rgba(0, 0, 0, 0.1),
                inset 1px 1px 2px rgba(255, 255, 255, 0.9),
                inset -1px -1px 2px rgba(0, 0, 0, 0.05)
              `,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 text-sm cursor-pointer
                  ${internalValue === option.value ? 'font-bold' : ''}
                `}
                style={{
                  fontFamily: 'Georgia, serif',
                  color: internalValue === option.value ? currentVariant.text : currentVariant.text,
                  backgroundColor: internalValue === option.value ? '#f3f4f6' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (internalValue !== option.value) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (internalValue !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={() => {
                  setInternalValue(option.value);
                  onChange?.(option.value);
                  setIsOpen(false);
                  // Trigger change event on hidden select
                  if (selectRef.current) {
                    const event = new Event('change', { bubbles: true });
                    selectRef.current.value = option.value;
                    selectRef.current.dispatchEvent(event);
                  }
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

RetroSelect.displayName = 'RetroSelect';

