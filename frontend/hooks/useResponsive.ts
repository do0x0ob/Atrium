import { useState, useEffect } from 'react';

/**
 * useResponsive - Unified responsive detection hook
 * Detects mobile and tablet breakpoints
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Tailwind md breakpoint
      setIsTablet(width >= 768 && width < 1024); // Tailwind lg breakpoint
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
}

