/**
 * Theme system for Atrium Stage
 */

export type StageTheme = 'light' | 'dark';

export interface StageThemeConfig {
  // Background
  backgroundColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;

  // Platform
  platformColor: number;
  platformRoughness: number;
  platformMetalness: number;
  platformOpacity: number;
  rimColor: number;
  rimOpacity: number;

  // Grid
  gridColor1: number;
  gridColor2: number;
  gridOpacity: number;

  // Lights
  mainLightColor: number;
  mainLightIntensity: number;
  sideLightColor: number;
  sideLightIntensity: number;
  backLightColor: number;
  backLightIntensity: number;
  ambientLightColor: number;
  ambientLightIntensity: number;
  hemisphereSkyColor: number;
  hemisphereGroundColor: number;
  hemisphereIntensity: number;

  // Particles
  particleCount: number;
  particleColors: Array<[number, number, number]>;
  particleOpacity: number;
  particleBlending: 'normal' | 'additive';

  // UI
  loadingBg: string;
  loadingTextColor: string;
  loadingSpinnerColors: string[];
}

export const STAGE_THEMES: Record<StageTheme, StageThemeConfig> = {
  light: {
    // Background - warm neutral cream
    backgroundColor: 0xf5f3ed,
    fogColor: 0xf5f3ed,
    fogNear: 25,
    fogFar: 70,

    // Platform - smooth reflective surface
    platformColor: 0xf5f3ed,
    platformRoughness: 0.15,
    platformMetalness: 0.4,
    platformOpacity: 0.98,
    rimColor: 0xff6b35,
    rimOpacity: 0.35,

    // Grid - warm taupe
    gridColor1: 0xd4cfc4,
    gridColor2: 0xe8e4db,
    gridOpacity: 0.3,

    // Lights - warm studio lighting (reduced for better particle visibility)
    mainLightColor: 0xfff5e0,
    mainLightIntensity: 1.2,
    sideLightColor: 0xffd4a3,
    sideLightIntensity: 0.8,
    backLightColor: 0xffb88c,
    backLightIntensity: 0.5,
    ambientLightColor: 0xfff8f0,
    ambientLightIntensity: 0.45,
    hemisphereSkyColor: 0xfff5e6,
    hemisphereGroundColor: 0xf0e6d2,
    hemisphereIntensity: 0.35,

    // Particles - soft multi-color spectrum
    particleCount: 180,
    particleColors: [
      [0.95, 0.6, 0.45],   // Soft coral
      [0.85, 0.55, 0.75],  // Soft pink
      [0.90, 0.75, 0.40],  // Soft golden
      [0.50, 0.70, 0.90],  // Soft blue
      [0.75, 0.55, 0.85],  // Soft purple
      [0.50, 0.85, 0.75],  // Soft mint
      [0.95, 0.65, 0.35],  // Soft orange
      [0.60, 0.75, 0.90],  // Soft cyan
    ],
    particleOpacity: 0.7,
    particleBlending: 'normal',

    // UI
    loadingBg: 'bg-white',
    loadingTextColor: 'text-gray-600',
    loadingSpinnerColors: ['border-orange-300', 'border-t-orange-600'],
  },

  dark: {
    // Background - deep space
    backgroundColor: 0x0a0a0f,
    fogColor: 0x0a0a0f,
    fogNear: 15,
    fogFar: 60,

    // Platform - dark metallic
    platformColor: 0x1a1a24,
    platformRoughness: 0.3,
    platformMetalness: 0.7,
    platformOpacity: 0.85,
    rimColor: 0x4466ff,
    rimOpacity: 0.3,

    // Grid - neon blue
    gridColor1: 0x3344cc,
    gridColor2: 0x1a1a2e,
    gridOpacity: 0.4,

    // Lights - dramatic stage
    mainLightColor: 0xffffff,
    mainLightIntensity: 2.5,
    sideLightColor: 0x6688ff,
    sideLightIntensity: 1.8,
    backLightColor: 0x88aaff,
    backLightIntensity: 1.2,
    ambientLightColor: 0x1a1a2e,
    ambientLightIntensity: 0.4,
    hemisphereSkyColor: 0x1a2040,
    hemisphereGroundColor: 0x0a0a1a,
    hemisphereIntensity: 0.4,

    // Particles - subtle cosmic dust
    particleCount: 150,
    particleColors: [
      [0.3, 0.5, 0.9],
      [0.5, 0.3, 0.8],
      [0.6, 0.6, 0.7],
    ],
    particleOpacity: 0.45,
    particleBlending: 'additive',

    // UI
    loadingBg: 'bg-black',
    loadingTextColor: 'text-gray-300',
    loadingSpinnerColors: ['border-blue-400', 'border-t-purple-500'],
  },
};

