"use client";

import { ReactNode } from 'react';

interface RetroFrameCanvasProps {
  children: ReactNode;
  className?: string;
}

export function RetroFrameCanvas({ children, className = '' }: RetroFrameCanvasProps) {
  return (
    <div className={`flex-1 relative p-3 ${className}`}>
      <div 
        className="w-full h-full relative overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          borderTop: '2px solid #9ca3af',
          borderLeft: '2px solid #9ca3af',
          borderBottom: '2px solid #f3f4f6',
          borderRight: '2px solid #f3f4f6',
          boxShadow: `
            inset 2px 2px 4px rgba(0, 0, 0, 0.06),
            inset -1px -1px 2px rgba(255, 255, 255, 0.9),
            0 1px 0 rgba(255, 255, 255, 1)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
}

