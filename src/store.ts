import { useState, useEffect } from 'react';
import { SwitchType } from './utils/audio';

export type ColorTheme = 'ember' | 'arctic' | 'synthwave' | 'stealth';
export type RGBMode = 'ember' | 'rainbow' | 'breathe' | 'pulse' | 'off';
export type FontStyle = 'modern' | 'classic' | 'script';
export type LightingEffect = 'static' | 'wave' | 'breathe';

export interface CustomColors {
  keycapsAlpha: string;
  keycapsMod: string;
  keycapsAccent: string;
  keycapsText: string;
  knobColor: string;
  switchStem: string;
  plate: string;
  pcb: string;
  caseColor: string;
  weightBar: string;
  ledColor: string;
}

export interface SavedLayout {
  id: string;
  name: string;
  colorTheme: ColorTheme;
  customColors: CustomColors;
  rgbMode: RGBMode;
  fontStyle: FontStyle;
  fontSize: number;
  legendColor: string;
  lightingEffect: LightingEffect;
  lightingSpeed: number;
  lightingBrightness: number;
}

export const DEFAULT_CUSTOM_COLORS: Record<ColorTheme, CustomColors> = {
  ember: {
    keycapsAlpha: '#18181c',
    keycapsMod: '#121215',
    keycapsAccent: '#222226',
    keycapsText: '#f3f4f6',
    knobColor: '#3f3f46',
    switchStem: '#ff7700',
    plate: '#475569',
    pcb: '#18181b',
    caseColor: '#27272a',
    weightBar: '#f59e0b',
    ledColor: '#ff8800',
  },
  arctic: {
    keycapsAlpha: '#f8fafc',
    keycapsMod: '#e2e8f0',
    keycapsAccent: '#0284c7',
    keycapsText: '#0f172a',
    knobColor: '#0284c7',
    switchStem: '#0284c7',
    plate: '#cbd5e1',
    pcb: '#1e293b',
    caseColor: '#e2e8f0',
    weightBar: '#38bdf8',
    ledColor: '#00d2ff',
  },
  synthwave: {
    keycapsAlpha: '#20163b',
    keycapsMod: '#170f2d',
    keycapsAccent: '#d946ef',
    keycapsText: '#f1f5f9',
    knobColor: '#d946ef',
    switchStem: '#06b6d4',
    plate: '#4c1d95',
    pcb: '#2e1065',
    caseColor: '#130e24',
    weightBar: '#d946ef',
    ledColor: '#d946ef',
  },
  stealth: {
    keycapsAlpha: '#0d0d0f',
    keycapsMod: '#08080a',
    keycapsAccent: '#18181b',
    keycapsText: '#71717a',
    knobColor: '#18181b',
    switchStem: '#eab308',
    plate: '#18181b',
    pcb: '#09090b',
    caseColor: '#050505',
    weightBar: '#eab308',
    ledColor: '#eab308',
  },
};

const DEFAULT_SAVED_LAYOUTS: SavedLayout[] = [
  {
    id: 'sunburst',
    name: 'Sunburst',
    colorTheme: 'ember',
    customColors: { ...DEFAULT_CUSTOM_COLORS.ember },
    rgbMode: 'ember',
    fontStyle: 'modern',
    fontSize: 56,
    legendColor: '#f3f4f6',
    lightingEffect: 'static',
    lightingSpeed: 50,
    lightingBrightness: 75,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colorTheme: 'arctic',
    customColors: { ...DEFAULT_CUSTOM_COLORS.arctic },
    rgbMode: 'breathe',
    fontStyle: 'classic',
    fontSize: 48,
    legendColor: '#0f172a',
    lightingEffect: 'wave',
    lightingSpeed: 40,
    lightingBrightness: 60,
  },
  {
    id: 'forest',
    name: 'Forest',
    colorTheme: 'stealth',
    customColors: {
      ...DEFAULT_CUSTOM_COLORS.stealth,
      keycapsAlpha: '#052e16',
      keycapsMod: '#022c22',
      keycapsAccent: '#065f46',
      keycapsText: '#86efac',
      ledColor: '#22c55e',
      switchStem: '#16a34a',
    },
    rgbMode: 'breathe',
    fontStyle: 'modern',
    fontSize: 52,
    legendColor: '#86efac',
    lightingEffect: 'breathe',
    lightingSpeed: 30,
    lightingBrightness: 50,
  },
  {
    id: 'default',
    name: 'Default',
    colorTheme: 'ember',
    customColors: { ...DEFAULT_CUSTOM_COLORS.ember },
    rgbMode: 'off',
    fontStyle: 'modern',
    fontSize: 56,
    legendColor: '#f3f4f6',
    lightingEffect: 'static',
    lightingSpeed: 50,
    lightingBrightness: 75,
  },
];

interface AppState {
  scrollProgress: number;
  colorTheme: ColorTheme;
  rgbMode: RGBMode;
  switchType: SwitchType;
  soundEnabled: boolean;
  showAnnotations: boolean;
  zoomLevel: number;
  customColors: CustomColors;
  pressedKeys: Set<string>;
  activeStageIndex: number;
  cameraResetNonce: number;
  // New Studio fields
  fontStyle: FontStyle;
  fontSize: number;
  legendColor: string;
  lightingEffect: LightingEffect;
  lightingSpeed: number;
  lightingBrightness: number;
  savedLayouts: SavedLayout[];
  showStudio: boolean;
  studioTab: 'workspace' | 'saved';
}

const state: AppState = {
  scrollProgress: 0,
  colorTheme: 'ember',
  rgbMode: 'off',
  switchType: 'linear',
  soundEnabled: false,
  showAnnotations: false,
  zoomLevel: 1.0,
  customColors: { ...DEFAULT_CUSTOM_COLORS.ember },
  pressedKeys: new Set<string>(),
  activeStageIndex: 0,
  cameraResetNonce: 0,
  // New Studio defaults
  fontStyle: 'modern',
  fontSize: 56,
  legendColor: '#f3f4f6',
  lightingEffect: 'static',
  lightingSpeed: 50,
  lightingBrightness: 75,
  savedLayouts: [...DEFAULT_SAVED_LAYOUTS],
  showStudio: false,
  studioTab: 'workspace',
};

type StateListener = () => void;
const listeners = new Set<StateListener>();

function notify() {
  listeners.forEach((l) => l());
}

export const setScrollProgress = (p: number) => {
  state.scrollProgress = Math.max(0, Math.min(1, p));
  state.activeStageIndex = Math.min(6, Math.floor(state.scrollProgress * 7.2));
  notify();
};

export const getScrollProgress = () => state.scrollProgress;

export const setShowAnnotations = (show: boolean) => {
  state.showAnnotations = show;
  notify();
};

export const toggleAnnotations = () => {
  state.showAnnotations = !state.showAnnotations;
  notify();
};

export const getShowAnnotations = () => state.showAnnotations;

export const zoomIn = () => {
  state.zoomLevel = Math.min(2.0, state.zoomLevel + 0.15);
  notify();
};

export const zoomOut = () => {
  state.zoomLevel = Math.max(0.5, state.zoomLevel - 0.15);
  notify();
};

export const resetZoom = () => {
  state.zoomLevel = 1.0;
  notify();
};

export const getZoomLevel = () => state.zoomLevel;

export const setColorTheme = (theme: ColorTheme) => {
  state.colorTheme = theme;
  state.customColors = { ...DEFAULT_CUSTOM_COLORS[theme] };
  notify();
};

export const getColorTheme = () => state.colorTheme;

export const setCustomColor = (key: keyof CustomColors, color: string) => {
  state.customColors = {
    ...state.customColors,
    [key]: color,
  };
  notify();
};

export const resetCustomColors = () => {
  state.customColors = { ...DEFAULT_CUSTOM_COLORS[state.colorTheme] };
  notify();
};

export const getCustomColors = () => state.customColors;

export const setRGBMode = (mode: RGBMode) => {
  state.rgbMode = mode;
  notify();
};

export const getRGBMode = () => state.rgbMode;

export const setSwitchType = (type: SwitchType) => {
  state.switchType = type;
  notify();
};

export const getSwitchType = () => state.switchType;

export const setSoundEnabled = (enabled: boolean) => {
  state.soundEnabled = enabled;
  notify();
};

export const getSoundEnabled = () => state.soundEnabled;

export const setKeyPressed = (code: string, isPressed: boolean) => {
  if (isPressed) {
    state.pressedKeys.add(code);
  } else {
    state.pressedKeys.delete(code);
  }
  notify();
};

export const getPressedKeys = () => state.pressedKeys;

export const resetCamera = () => {
  state.cameraResetNonce += 1;
  notify();
};

export const getCameraResetNonce = () => state.cameraResetNonce;

// New Studio Actions
export const setFontStyle = (style: FontStyle) => {
  state.fontStyle = style;
  notify();
};

export const setFontSize = (size: number) => {
  state.fontSize = Math.max(24, Math.min(80, size));
  notify();
};

export const setLegendColor = (color: string) => {
  state.legendColor = color;
  state.customColors = { ...state.customColors, keycapsText: color };
  notify();
};

export const setLightingEffect = (effect: LightingEffect) => {
  state.lightingEffect = effect;
  // Map to RGB mode
  if (effect === 'static') state.rgbMode = 'ember';
  else if (effect === 'wave') state.rgbMode = 'rainbow';
  else if (effect === 'breathe') state.rgbMode = 'breathe';
  notify();
};

export const setLightingSpeed = (speed: number) => {
  state.lightingSpeed = Math.max(0, Math.min(100, speed));
  notify();
};

export const setLightingBrightness = (brightness: number) => {
  state.lightingBrightness = Math.max(0, Math.min(100, brightness));
  notify();
};

export const toggleStudio = () => {
  state.showStudio = !state.showStudio;
  notify();
};

export const setShowStudio = (show: boolean) => {
  state.showStudio = show;
  notify();
};

export const setStudioTab = (tab: 'workspace' | 'saved') => {
  state.studioTab = tab;
  notify();
};

export const saveCurrentLayout = (name: string) => {
  const layout: SavedLayout = {
    id: `custom_${Date.now()}`,
    name,
    colorTheme: state.colorTheme,
    customColors: { ...state.customColors },
    rgbMode: state.rgbMode,
    fontStyle: state.fontStyle,
    fontSize: state.fontSize,
    legendColor: state.legendColor,
    lightingEffect: state.lightingEffect,
    lightingSpeed: state.lightingSpeed,
    lightingBrightness: state.lightingBrightness,
  };
  state.savedLayouts = [...state.savedLayouts, layout];
  notify();
};

export const loadLayout = (layout: SavedLayout) => {
  state.colorTheme = layout.colorTheme;
  state.customColors = { ...layout.customColors };
  state.rgbMode = layout.rgbMode;
  state.fontStyle = layout.fontStyle;
  state.fontSize = layout.fontSize;
  state.legendColor = layout.legendColor;
  state.lightingEffect = layout.lightingEffect;
  state.lightingSpeed = layout.lightingSpeed;
  state.lightingBrightness = layout.lightingBrightness;
  notify();
};

export const deleteLayout = (id: string) => {
  state.savedLayouts = state.savedLayouts.filter((l) => l.id !== id);
  notify();
};

export function useAppStore(): AppState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

export function useCustomScroll() {
  const [progress, setProgress] = useState(state.scrollProgress);

  useEffect(() => {
    const listener = () => setProgress(state.scrollProgress);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return progress;
}
