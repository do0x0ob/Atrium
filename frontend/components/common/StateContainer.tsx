/**
 * StateContainer - Compound Component Pattern
 * Unified Loading/Error/Empty/Content state handling
 */

import React, { ReactNode, Children, isValidElement } from 'react';
import { RetroPanel } from './RetroPanel';
import { RetroButton } from './RetroButton';

interface StateContainerProps {
  loading: boolean;
  error?: Error | string | null;
  empty?: boolean;
  children: ReactNode;
  onRetry?: () => void;
}

interface StateContainerSubComponents {
  Loading: typeof Loading;
  Error: typeof ErrorState;
  Empty: typeof Empty;
  Content: typeof Content;
}

const Loading: React.FC<{ children?: ReactNode; message?: string }> = ({ 
  children, 
  message = 'Loading...' 
}) => {
  if (children) return <>{children}</>;
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        <p className="text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ 
  children?: ReactNode;
  error?: Error | string | null;
  onRetry?: () => void;
}> = ({ children, error, onRetry }) => {
  if (children) return <>{children}</>;
  
  const errorMessage = error instanceof Error ? error.message : error || 'An error occurred';
  
  return (
    <RetroPanel className="flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md" style={{ fontFamily: 'Georgia, serif' }}>
        <span className="text-6xl mb-4 block">⚠️</span>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          {errorMessage}
        </p>
        {onRetry && (
          <RetroButton onClick={onRetry} variant="primary">
            Try Again
          </RetroButton>
        )}
      </div>
    </RetroPanel>
  );
};

const Empty: React.FC<{ 
  children?: ReactNode;
  icon?: string;
  title?: string;
  message?: string;
  className?: string;
}> = ({ 
  children, 
  icon = '📭', 
  title = 'No Items Found',
  message = 'There are no items to display.',
  className = ''
}) => {
  if (children) return <>{children}</>;
  
  const getIcon = () => {
    // If it's an emoji (more than 1 char typically means emoji)
    if (icon.length >= 2) {
      return <div className="text-6xl">{icon}</div>;
    }

    // Otherwise render SVG based on type
    const svgColor = '#d1d5db';
    switch (icon) {
      case 'file':
        return (
          <svg className="w-16 h-16" fill="none" stroke={svgColor} viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-16 h-16" fill="none" stroke={svgColor} viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-16 h-16" fill="none" stroke={svgColor} viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: // box
        return (
          <svg className="w-16 h-16" fill="none" stroke={svgColor} viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <RetroPanel 
        variant="inset"
        className="mb-6 p-6"
      >
        <div className="text-gray-400">
          {getIcon()}
        </div>
      </RetroPanel>
      
      <h3 
        className="text-gray-700 text-base uppercase tracking-widest mb-2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {title}
      </h3>
      
      <p 
        className="text-gray-500 text-sm text-center max-w-md"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {message}
      </p>
    </div>
  );
};

const Content: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const StateContainer: React.FC<StateContainerProps> & StateContainerSubComponents = ({
  loading,
  error,
  empty = false,
  children,
  onRetry,
}) => {
  // Find child components by their type
  let loadingChild: ReactNode = null;
  let errorChild: ReactNode = null;
  let emptyChild: ReactNode = null;
  let contentChild: ReactNode = null;

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Loading) {
        loadingChild = child;
      } else if (child.type === ErrorState) {
        errorChild = child;
      } else if (child.type === Empty) {
        emptyChild = child;
      } else if (child.type === Content) {
        contentChild = child;
      }
    }
  });

  // Render based on state priority: loading > error > empty > content
  if (loading) {
    return <>{loadingChild || <Loading />}</>;
  }

  if (error) {
    return <>{errorChild || <ErrorState error={error} onRetry={onRetry} />}</>;
  }

  if (empty) {
    return <>{emptyChild || <Empty />}</>;
  }

  return <>{contentChild || children}</>;
};

// Attach sub-components
StateContainer.Loading = Loading;
StateContainer.Error = ErrorState;
StateContainer.Empty = Empty;
StateContainer.Content = Content;
