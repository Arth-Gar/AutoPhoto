export type AspectRatioType = '3x4' | '1x1' | '4x3' | '16x9' | 'strip';

export type Language = 'pt' | 'en' | 'es';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  brightness: number; // percentage, default 100
  contrast: number;   // percentage, default 100
  grayscale: number;  // 0 to 100
  sepia: number;      // 0 to 100
  saturate: number;   // percentage, default 100
  invert: number;     // 0 to 100
  hueRotate: number;  // 0 to 360
  blur: number;       // 0 to 10
  iconName: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  type: 'emoji' | 'svg' | 'stamp';
  content: string; // emoji char or svg identifier or text
  x: number; // percentage of canvas width (0-100)
  y: number; // percentage of canvas height (0-100)
  scale: number; // 0.5 to 3
  rotation: number; // degrees
  color?: string;
}

export interface StickerTemplate {
  id: string;
  name: string;
  category: 'acessorios' | 'rosto' | 'emojis' | 'molduras' | '3x4';
  type: 'emoji' | 'svg' | 'stamp';
  content: string;
  label: string;
  color?: string;
  defaultScale?: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string; // full resolution image with filters & stickers
  timestamp: number;
  aspectRatio: AspectRatioType;
  filterId: string;
  stickersCount: number;
  isFavorite?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  syncedCount: number;
  lastSync?: number;
}

export interface AdCreative {
  id: string;
  sponsor: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  url: string;
  color: string;
  bgColor: string;
  iconName: string;
}
