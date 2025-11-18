'use client';

import React from 'react';

interface RetroHeadingProps {
  title: string;
  subtitle?: string;
  author?: string;
  className?: string;
}

/**
 * RetroHeading - Retro OS styled heading component
 * Used for page/section titles with optional subtitle
 */
export function RetroHeading({ title, subtitle, author, className = '' }: RetroHeadingProps) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="px-6 py-2.5"
        style={{
          background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
          borderTop: '2px solid #ffffff',
          borderLeft: '2px solid #ffffff',
          borderBottom: '2px solid #d1d5db',
          borderRight: '2px solid #d1d5db',
          boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 1), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <h1 className="text-gray-800 text-3xl uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-sm tracking-wide mt-1" style={{ fontFamily: 'Georgia, serif' }}>
            {subtitle}
          </p>
        )}
        {author && (
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1" style={{ fontFamily: 'Georgia, serif' }}>
            {author}
          </p>
        )}
      </div>
      
      {/* Bottom decorative line */}
      <div 
        className="h-1"
        style={{
          background: 'linear-gradient(to right, #f9fafb, #d1d5db, #f9fafb)',
        }}
      />
    </div>
  );
}

