import { useState, useEffect } from 'react';
import { SwitchType } from './utils/audio';

export type ColorTheme = 'ember' | 'arctic' | 'synthwave' | 'stealth';
export type RGBMode = 'ember' | 'rainbow' | 'breathe' | 'pulse' | 'off';

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
