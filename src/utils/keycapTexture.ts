import * as THREE from 'three';
import { ColorTheme, FontStyle } from '../store';

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
  botanical: {
    caseColor: '#0f291e',
    caseMetalness: 0.75,
    caseRoughness: 0.3,
    alphaBase: '#e2e8f0',
    alphaText: '#064e3b',
    modBase: '#1e3a2f',
    modText: '#a7f3d0',
    accentBase: '#10b981',
    accentText: '#ffffff',
    accentGlow: '#10b981',
    plateColor: '#1e3a2f',
    switchStem: '#10b981',
    rgbDefault: '#10b981',
  },
  olivia: {
    caseColor: '#1c1917',
    caseMetalness: 0.85,
    caseRoughness: 0.25,
    alphaBase: '#fdf2f8',
    alphaText: '#881337',
    modBase: '#18181b',
    modText: '#fda4af',
    accentBase: '#f43f5e',
    accentText: '#ffffff',
    accentGlow: '#fb7185',
    plateColor: '#fb7185',
    switchStem: '#f43f5e',
    rgbDefault: '#fb7185',
  },
  cafe: {
    caseColor: '#241407',
    caseMetalness: 0.7,
    caseRoughness: 0.35,
    alphaBase: '#fef3c7',
    alphaText: '#451a03',
    modBase: '#38220f',
    modText: '#fde68a',
    accentBase: '#b45309',
    accentText: '#ffffff',
    accentGlow: '#f59e0b',
    plateColor: '#78350f',
    switchStem: '#d97706',
    rgbDefault: '#f59e0b',
  },
  nautilus: {
    caseColor: '#070d18',
    caseMetalness: 0.85,
    caseRoughness: 0.28,
    alphaBase: '#06b6d4',
    alphaText: '#083344',
    modBase: '#0f172a',
    modText: '#38bdf8',
    accentBase: '#eab308',
    accentText: '#000000',
    accentGlow: '#06b6d4',
    plateColor: '#eab308',
    switchStem: '#06b6d4',
    rgbDefault: '#06b6d4',
  },
  laser: {
    caseColor: '#1e0538',
    caseMetalness: 0.85,
    caseRoughness: 0.25,
    alphaBase: '#3b82f6',
    alphaText: '#ffffff',
    modBase: '#581c87',
    modText: '#f472b6',
    accentBase: '#ec4899',
    accentText: '#ffffff',
    accentGlow: '#06b6d4',
    plateColor: '#ec4899',
    switchStem: '#ec4899',
    rgbDefault: '#06b6d4',
  },
  dracula: {
    caseColor: '#14141d',
    caseMetalness: 0.9,
    caseRoughness: 0.25,
    alphaBase: '#f8fafc',
    alphaText: '#282a36',
    modBase: '#1e1e2e',
    modText: '#bd93f9',
    accentBase: '#bd93f9',
    accentText: '#282a36',
    accentGlow: '#ff79c6',
    plateColor: '#bd93f9',
    switchStem: '#50fa7b',
    rgbDefault: '#bd93f9',
  },
  retro: {
    caseColor: '#44403c',
    caseMetalness: 0.6,
    caseRoughness: 0.4,
    alphaBase: '#f5f5f4',
    alphaText: '#1c1917',
    modBase: '#78716c',
    modText: '#f5f5f4',
    accentBase: '#dc2626',
    accentText: '#ffffff',
    accentGlow: '#dc2626',
    plateColor: '#a8a29e',
    switchStem: '#dc2626',
    rgbDefault: '#dc2626',
  },
  apollo: {
    caseColor: '#111827',
    caseMetalness: 0.85,
    caseRoughness: 0.3,
    alphaBase: '#cbd5e1',
    alphaText: '#0f172a',
    modBase: '#1e293b',
    modText: '#94a3b8',
    accentBase: '#f97316',
    accentText: '#ffffff',
    accentGlow: '#f97316',
    plateColor: '#f97316',
    switchStem: '#f97316',
    rgbDefault: '#f97316',
  },
};

export function clearTextureCache() {
  textureCache.clear();
}

function getFontFamily(style: FontStyle): string {
  switch (style) {
    case 'classic': return 'Georgia, "Times New Roman", serif';
    case 'script': return '"Brush Script MT", "Segoe Script", cursive, sans-serif';
    default: return '"Segoe UI", system-ui, -apple-system, sans-serif';
  }
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
  },
  fontStyle: FontStyle = 'modern',
  fontScale: number = 1.0
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

  const fontFamily = getFontFamily(fontStyle);
  const cacheKey = `${bgColor}_${textColor}_${label}_${subLabel || ''}_${type}_${isPressed}_${fontStyle}_${fontScale}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Ultra-crisp, high-fidelity 512x512 texture for maximum realism and razor-sharp legends
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Solid Base PBT Plastic Body
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Realistic Cylindrical Concave Dish Lighting Gradient
  const vertGrad = ctx.createLinearGradient(0, 0, 0, 512);
  vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.14)');
  vertGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.04)');
  vertGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
  vertGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.12)');
  vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.36)');
  ctx.fillStyle = vertGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 3. Subtle Spherical Inset Radial Dish Vignette
  const radGrad = ctx.createRadialGradient(256, 230, 40, 256, 256, 260);
  radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.06)');
  radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.0)');
  radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 4. Subtle Injection-Molded PBT Matte Micro-Grain Noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  // Deterministic seed noise based on label
  let seed = 0;
  for (let i = 0; i < label.length; i++) seed += label.charCodeAt(i);
  for (let i = 0; i < data.length; i += 16) {
    seed = (seed * 9301 + 49297) % 233280;
    const noise = ((seed / 233280) - 0.5) * 7;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 5. Precision Chamfered Dish Inset Lip Borders (Light Top Highlight & Dark Bottom Shadow)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 492, 492);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 484, 484);

  // 6. Tactile Homing Bars on 'F' and 'J' Keys (Enthusiast Touch Typing Feature)
  if (label === 'F' || label === 'J') {
    // 3D Raised Homing Ridge with specular top and shadow bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(176, 396, 160, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(176, 392, 160, 4);
  }

  // 7. Spacebar Glowing Accent Line
  if (type === 'space' || label === '') {
    ctx.fillStyle = colors.accentGlow || '#f97316';
    ctx.shadowColor = colors.accentGlow || '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillRect(160, 248, 192, 16);
    ctx.shadowBlur = 0;

    // Small laser center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 256, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Dual Legends (Number row: ! @ # $ % ^ & * ( ) _ +)
  if (subLabel) {
    // Top Sub-Legend (Symbols)
    ctx.font = `bold ${Math.round(68 * fontScale)}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.72;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(subLabel, 64, 60);

    // Bottom Main Legend (Numbers)
    ctx.font = `bold ${Math.round(92 * fontScale)}px ${fontFamily}`;
    ctx.globalAlpha = 0.96;
    ctx.fillText(label, 64, 260);
  } else if (label) {
    // 9. Single Legends (Letters, Modifiers, Function keys)
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let displayLabel = label;
    if (label === 'ENTER') displayLabel = '↵ ENTER';
    else if (label === 'SHIFT') displayLabel = '⇧ SHIFT';
    else if (label === 'TAB') displayLabel = '⇥ TAB';
    else if (label === 'CAPS') displayLabel = '⇪ CAPS';
    else if (label === 'BACK') displayLabel = '⌫ BACK';
    else if (label === 'WIN') displayLabel = '❖ WIN';
    else if (label === 'UP') displayLabel = '▲';
    else if (label === 'DOWN') displayLabel = '▼';
    else if (label === 'LEFT') displayLabel = '◀';
    else if (label === 'RIGHT') displayLabel = '▶';

    if (displayLabel.length === 1) {
      // Single Alphabet Key (A-Z) - Classic upper-left Cherry position or bold center
      ctx.font = `bold ${Math.round(112 * fontScale)}px ${fontFamily}`;
      ctx.fillText(displayLabel, 256, 246);
    } else if (displayLabel.length <= 3) {
      // Short modifiers (ESC, DEL, END, ALT, etc.)
      ctx.font = `bold ${Math.round(76 * fontScale)}px ${fontFamily}`;
      ctx.fillText(displayLabel, 256, 256);
    } else if (displayLabel.length <= 6) {
      // Medium modifiers (⇧ SHIFT, ↵ ENTER, ⇥ TAB, ⇪ CAPS)
      ctx.font = `bold ${Math.round(62 * fontScale)}px ${fontFamily}`;
      ctx.fillText(displayLabel, 256, 256);
    } else {
      // Long modifiers (BACKSPACE, CAPSLOCK)
      ctx.font = `bold ${Math.round(52 * fontScale)}px ${fontFamily}`;
      ctx.fillText(displayLabel, 256, 256);
    }
  }

  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
