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
    alphaBase: '#18181b', // Ultra-sleek matte PBT dark charcoal
    alphaText: '#f8fafc', // Crisp laser-etched brilliant white
    modBase: '#111114',   // Deep matte obsidian for modifiers
    modText: '#94a3b8',   // Soft silver-gray modifier legends
    accentBase: '#1e1e24', // Accent keycap
    accentText: '#fb923c',
    accentGlow: '#ff8800',
    plateColor: '#1f1f23',
    switchStem: '#ff7700', // Tangerine switch stem
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
  isPressed: boolean = false
): THREE.CanvasTexture {
  const cacheKey = `${theme}_${label}_${subLabel || ''}_${type}_${isHovered}_${isPressed}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const colors = THEME_CONFIGS[theme] || THEME_CONFIGS.ember;

  let bgColor = colors.alphaBase;
  let textColor = colors.alphaText;

  if (type === 'modifier') {
    bgColor = colors.modBase;
    textColor = colors.modText;
  } else if (type === 'accent' || label === 'ESC' || label === 'ENTER') {
    bgColor = colors.accentBase;
    textColor = colors.accentText;
  }

  if (isPressed) {
    bgColor = '#27272a';
  } else if (isHovered) {
    bgColor = '#2a2a30';
  }

  // 1. Base Keycap Fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Realistic PBT Stippled Texture Grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Ergonomic Concave Dish Spherical Highlight & Shadow
  const dishGradient = ctx.createRadialGradient(256, 230, 40, 256, 256, 240);
  dishGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  dishGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  dishGradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.15)');
  dishGradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = dishGradient;
  ctx.fillRect(0, 0, 512, 512);

  // 4. Subtle Injection Mold Beveled Perimeter Chamfer
  ctx.strokeStyle = isHovered ? '#ff8800' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = isHovered ? 8 : 3;
  ctx.strokeRect(12, 12, 488, 488);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 472);

  // 5. Sub-Legend (Secondary Function)
  if (subLabel) {
    ctx.font = '700 68px "Outfit", "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.7;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(subLabel, 68, 68);
  }

  // 6. Main Doubleshot Laser-Sharp Legend
  if (label) {
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = textColor;

    // Crisp shadow underneath doubleshot legend
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    if (label.length > 4) {
      ctx.font = '700 62px "Outfit", "Segoe UI", system-ui, sans-serif';
      const x = subLabel ? 68 : 256;
      const y = subLabel ? 320 : 256;
      ctx.textAlign = subLabel ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    } else if (label.length > 1) {
      ctx.font = '800 84px "Outfit", "Segoe UI", system-ui, sans-serif';
      const x = subLabel ? 68 : 256;
      const y = subLabel ? 310 : 256;
      ctx.textAlign = subLabel ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    } else {
      ctx.font = '800 112px "Outfit", "Segoe UI", system-ui, sans-serif';
      const x = subLabel ? 68 : 256;
      const y = subLabel ? 300 : 256;
      ctx.textAlign = subLabel ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
