/**
 * Three.js related type definitions for Atrium
 */

import { AtriumGallerySceneConfig } from '../lib/three/AtriumGalleryScene';

// Configuration for Three.js scene rendering
export interface ThreeSceneConfig {
  backgroundColor?: number;
  ambientLightColor?: number;
  ambientLightIntensity?: number;
  directionalLightColor?: number;
  directionalLightIntensity?: number;
  enableShadows?: boolean;
  cameraPosition?: [number, number, number];
  galleryScene?: AtriumGallerySceneConfig;
}

// Options for loading GLB models
export interface LoadGLBOptions {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
  onProgress?: (progress: ProgressEvent) => void;
}

// 3D Model item from Kiosk
export interface Model3DItem {
  id: string;
  name: string;
  blobId?: string;
  modelUrl?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

