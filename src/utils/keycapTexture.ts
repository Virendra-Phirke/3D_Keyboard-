import * as THREE from 'three';
import { ColorTheme } from '../store';

const textureCache = new Map<string, THREE.CanvasTexture>();

export interface ThemeColors {
  caseColor: string;
  caseMetalness: number;
  caseRoughness: number;
  alphaBase: string;
  alphaText: string;
  modBase: string;
  modText: string;
  accentBase: string;
  accentText: string;
  accentGlow: string;
  plateColor: string;
  switchStem: string;
  rgbDefault: string;
}

export const THEME_CONFIGS: Record<ColorTheme, ThemeColors> = {
  ember: {
    caseColor: '#121215',
    caseMetalness: 0.85,
    caseRoughness: 0.35,
    alphaBase: '#18181c',
    alphaText: '#f3f4f6',
    modBase: '#121215',
    modText: '#d1d5db',
    accentBase: '#222226',
    accentText: '#f3f4f6',
    accentGlow: '#ff8800',
    plateColor: '#1f1f23',
    switchStem: '#ff7700',
    rgbDefault: '#ff8800',
  },
  arctic: {
    caseColor: '#e2e8f0',
    caseMetalness: 0.6,
    caseRoughness: 0.25,
    alphaBase: '#f8fafc',
    alphaText: '#0f172a',
    modBase: '#e2e8f0',
    modText: '#475569',
    accentBase: '#0284c7',
    accentText: '#ffffff',
    accentGlow: '#38bdf8',
    plateColor: '#cbd5e1',
    switchStem: '#0284c7',
    rgbDefault: '#00d2ff',
  },
  synthwave: {
    caseColor: '#130e24',
    caseMetalness: 0.85,
    caseRoughness: 0.3,
    alphaBase: '#20163b',
    alphaText: '#f1f5f9',
    modBase: '#170f2d',
    modText: '#e879f9',
    accentBase: '#d946ef',
    accentText: '#ffffff',
    accentGlow: '#06b6d4',
    plateColor: '#4c1d95',
    switchStem: '#06b6d4',
    rgbDefault: '#d946ef',
  },
  stealth: {
    caseColor: '#050505',
    caseMetalness: 0.95,
    caseRoughness: 0.2,
    alphaBase: '#0d0d0f',
    alphaText: '#71717a',
    modBase: '#08080a',
    modText: '#52525b',
    accentBase: '#18181b',
    accentText: '#eab308',
    accentGlow: '#eab308',
    plateColor: '#18181b',
    switchStem: '#eab308',
    rgbDefault: '#eab308',
  },
};

export function getKeycapTexture(
  theme: ColorTheme,
  label: string,
  subLabel: string | undefined,
  type: 'alpha' | 'modifier' | 'accent' | 'space' | 'special' | 'knob',
  isHovered: boolean = false,
  isPressed: boolean = false,
  customColors?: {
    keycapsAlpha?: string;
    keycapsMod?: string;
    keycapsAccent?: string;
    keycapsText?: string;
  }
): THREE.CanvasTexture {
  const colors = THEME_CONFIGS[theme] || THEME_CONFIGS.ember;
  const alphaBase = customColors?.keycapsAlpha || colors.alphaBase;
  const modBase = customColors?.keycapsMod || colors.modBase;
  const accentBase = customColors?.keycapsAccent || colors.accentBase;
  const textColor = customColors?.keycapsText || (type === 'modifier' ? colors.modText : colors.alphaText);

  const cacheKey = `${alphaBase}_${modBase}_${accentBase}_${textColor}_${label}_${subLabel || ''}_${type}_${isPressed}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  let bgColor = alphaBase;
  if (type === 'modifier') {
    bgColor = modBase;
  } else if (type === 'accent' || label === 'ESC' || label === 'ENTER') {
    bgColor = accentBase;
  }

  if (isPressed) {
    bgColor = '#27272a';
  }

  // Draw Matte Keycap Texture
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle Dish Gradient
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 160);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
  grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Clean Subtle Border Inset (No orange highlight)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, 244, 244);

  // SubLabel (e.g. ! @ # $)
  if (subLabel) {
    ctx.font = 'bold 36px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.65;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(subLabel, 36, 36);
  }

  // Main Label (Laser-etched sharp font)
  if (label) {
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = textColor;
    ctx.textAlign = subLabel ? 'left' : 'center';
    ctx.textBaseline = 'middle';

    if (label.length > 3) {
      ctx.font = 'bold 34px "Segoe UI", system-ui, -apple-system, sans-serif';
      const x = subLabel ? 36 : 128;
      const y = subLabel ? 160 : 128;
      ctx.fillText(label, x, y);
    } else if (label.length > 1) {
      ctx.font = 'bold 44px "Segoe UI", system-ui, -apple-system, sans-serif';
      const x = subLabel ? 36 : 128;
      const y = subLabel ? 150 : 128;
      ctx.fillText(label, x, y);
    } else {
      ctx.font = 'bold 56px "Segoe UI", system-ui, -apple-system, sans-serif';
      const x = subLabel ? 36 : 128;
      const y = subLabel ? 148 : 128;
      ctx.fillText(label, x, y);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
