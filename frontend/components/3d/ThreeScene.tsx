"use client";

import { useThreeScene } from '@/hooks/three/useThreeScene';
import { Model3DItem } from '@/types/three';
import { StageTheme, STAGE_THEMES } from '@/types/theme';
import { useEffect, useMemo } from 'react';

interface ThreeSceneProps {
  kioskId: string;
  models?: Model3DItem[];
  enableGallery?: boolean;
  className?: string;
  theme?: StageTheme;
}

export function ThreeScene({ kioskId, models = [], enableGallery = true, className = '', theme = 'light' }: ThreeSceneProps) {
  const themeConfig = STAGE_THEMES[theme];

  // Memoize scene options to prevent re-initialization
  const sceneOptions = useMemo(() => ({
    backgroundColor: themeConfig.backgroundColor,
    cameraPosition: [25, 25, 25] as [number, number, number], // Monument Valley style isometric view
    enableGallery,
    enableShadows: true,
    theme: themeConfig,
  }), [enableGallery, themeConfig, theme]);

  const {
    canvasRef,
    sceneInitialized,
    isLoading,
    loadModels,
  } = useThreeScene(sceneOptions);

  // Load models when they change
  useEffect(() => {
    if (sceneInitialized && models.length > 0) {
      loadModels(models);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneInitialized, models.length]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
        style={{ backgroundColor: `#${themeConfig.backgroundColor.toString(16).padStart(6, '0')}` }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${themeConfig.loadingBg} bg-opacity-90`}>
          <div className="text-center">
            <div className={`inline-block w-8 h-8 border-3 ${themeConfig.loadingSpinnerColors.join(' ')} rounded-full animate-spin mb-2`}></div>
            <p className={`text-sm ${themeConfig.loadingTextColor}`} style={{ fontFamily: 'Georgia, serif' }}>
              Preparing stage...
            </p>
          </div>
        </div>
      )}

      {/* Stage info overlay */}
      <div className={`absolute bottom-4 right-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} pointer-events-none`} style={{ fontFamily: 'Georgia, serif' }}>
        Atrium Stage · {theme === 'dark' ? '🌙 Night' : '☀️ Day'}
      </div>
    </div>
  );
}

