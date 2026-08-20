import { useState, useEffect } from 'react';
import { SwitchType } from './utils/audio';

export type ColorTheme = 'ember' | 'arctic' | 'synthwave' | 'stealth';
export type RGBMode = 'ember' | 'rainbow' | 'breathe' | 'pulse' | 'off';

interface AppState {
  scrollProgress: number;
  colorTheme: ColorTheme;
  rgbMode: RGBMode;
  switchType: SwitchType;
  soundEnabled: boolean;
  showAnnotations: boolean;
  zoomLevel: number;
  pressedKeys: Set<string>;
  activeStageIndex: number;
  cameraResetNonce: number;
}

const state: AppState = {
  scrollProgress: 0,
  colorTheme: 'ember',
  rgbMode: 'ember',
  switchType: 'linear',
  soundEnabled: true,
  showAnnotations: true,
  zoomLevel: 1.0,
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
  notify();
};

export const getColorTheme = () => state.colorTheme;

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
