/**
 * Secure Content Window - Template Method Pattern
 * Generic window component for displaying encrypted content
 * Uses Strategy Pattern for different content renderers
 */

import React, { ReactNode } from 'react';

interface SecureContentWindowProps {
  content: string | null;
  loading: boolean;
  error: string | null;
  loadingMessage?: string;
  renderer: (content: string) => ReactNode;
  className?: string;
}

export const SecureContentWindow: React.FC<SecureContentWindowProps> = ({
  content,
  loading,
  error,
  loadingMessage = 'Loading...',
  renderer,
  className = 'bg-white',
}) => {
  // Loading State
  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin text-3xl text-gray-400 mb-2">⟳</div>
          <div className="text-gray-600">{loadingMessage}</div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className} p-8`}>
        <div className="text-center text-red-500">
          <div className="text-3xl mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Content State
  if (!content) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-gray-500">No content available</div>
      </div>
    );
  }

  // Render content using provided renderer (Strategy Pattern)
  return <div className="w-full h-full">{renderer(content)}</div>;
};

