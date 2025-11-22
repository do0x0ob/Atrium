/**
 * Hook for ensuring a function runs only once
 * Provides concurrency control to prevent duplicate async operations
 */

import { useRef, useEffect, DependencyList } from 'react';

export function useLoadOnce<T>(
  loadFn: () => Promise<T>,
  dependencies: DependencyList
): void {
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent concurrent or duplicate execution
    if (isLoadingRef.current || hasLoadedRef.current) {
      return;
    }

    isLoadingRef.current = true;

    loadFn()
      .then(() => {
        hasLoadedRef.current = true;
      })
      .catch((error) => {
        console.error('useLoadOnce error:', error);
        // Reset loading state on error to allow retry
        isLoadingRef.current = false;
      });
  }, dependencies);
}

