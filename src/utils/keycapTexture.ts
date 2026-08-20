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
    caseColor: '#141418',
    caseMetalness: 0.85,
    caseRoughness: 0.35,
    alphaBase: '#18181c',
    alphaText: '#f8fafc',
    modBase: '#121215',
    modText: '#e2e8f0',
    accentBase: '#ea580c',
    accentText: '#ffffff',
    accentGlow: '#f97316',
    plateColor: '#1e1e24',
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
    modText: '#334155',
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
    alphaText: '#f8fafc',
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
    alphaText: '#a1a1aa',
    modBase: '#08080a',
    modText: '#71717a',
    accentBase: '#eab308',
    accentText: '#000000',
    accentGlow: '#eab308',
    plateColor: '#18181b',
    switchStem: '#eab308',
    rgbDefault: '#eab308',
  },
};

export function clearTextureCache() {
  textureCache.clear();
}

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
  const defaultTextColor = customColors?.keycapsText || colors.alphaText;

  let bgColor = alphaBase;
  let textColor = defaultTextColor;

  if (type === 'modifier' || type === 'special' || type === 'space' || type === 'knob') {
    bgColor = modBase;
    textColor = customColors?.keycapsText || colors.modText;
  } else if (type === 'accent') {
    bgColor = accentBase;
    textColor = customColors?.keycapsText || colors.accentText;
  }

  // Accent highlights (ESC, ENTER, FN) matching reference aesthetics
  if (label === 'ESC') {
    bgColor = accentBase;
    textColor = '#ffffff';
  } else if (label === 'ENTER') {
    bgColor = modBase;
    textColor = colors.accentGlow || '#f97316';
  } else if (label === 'FN') {
    bgColor = modBase;
    textColor = colors.accentGlow || '#f97316';
  }

  if (isPressed) {
    bgColor = '#27272a';
  }

  const cacheKey = `${bgColor}_${textColor}_${label}_${subLabel || ''}_${type}_${isPressed}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Ultra-crisp 512x512 texture for laser-sharp legibility at any distance
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Solid Matte PBT Body (Uniform, realistic micro-textured plastic)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Subtle Vertical Dish Lighting Gradient (Never distorts horizontally on wide keys!)
  const vertGrad = ctx.createLinearGradient(0, 0, 0, 512);
  vertGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
  vertGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
  vertGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
  vertGrad.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = vertGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 3. Subtle Chamfered Inset Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 496);

  // 4. Spacebar Glowing Accent Line (Matching reference image)
  if (type === 'space' || label === '') {
    ctx.fillStyle = colors.accentGlow || '#f97316';
    ctx.shadowColor = colors.accentGlow || '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillRect(180, 248, 152, 16);
    ctx.shadowBlur = 0;
  }

  // 5. Dual Legends (Number row: ! @ # $ % ^ & * ( ) _ +)
  if (subLabel) {
    ctx.font = 'bold 72px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.70;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(subLabel, 64, 64);

    // Main Number
    ctx.font = 'bold 96px "Segoe UI", system-ui, -apple-system, sans-serif';
    ctx.globalAlpha = 0.95;
    ctx.fillText(label, 64, 260);
  } else if (label) {
    // 6. Single Legends (Letters, Modifiers, Function keys)
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (label.length === 1) {
      // Single Alphabet Key (A-Z)
      ctx.font = 'bold 112px "Segoe UI", system-ui, -apple-system, sans-serif';
      ctx.fillText(label, 256, 256);
    } else if (label.length <= 3) {
      // Short modifiers (ESC, TAB, WIN, ALT, DEL, etc.)
      ctx.font = 'bold 80px "Segoe UI", system-ui, -apple-system, sans-serif';
      ctx.fillText(label, 256, 256);
    } else if (label.length <= 5) {
      // Medium modifiers (SHIFT, ENTER, CAPS, SPACE)
      ctx.font = 'bold 64px "Segoe UI", system-ui, -apple-system, sans-serif';
      ctx.fillText(label, 256, 256);
    } else {
      // Long modifiers (BACKSPACE, CAPSLOCK)
      ctx.font = 'bold 54px "Segoe UI", system-ui, -apple-system, sans-serif';
      ctx.fillText(label, 256, 256);
    }
  }

  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
