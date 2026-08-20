/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import UI from "./components/UI";
import { Suspense, useEffect, useRef } from "react";
import { setScrollProgress, getScrollProgress, setKeyPressed, useAppStore } from "./store";
import { playSwitchSound } from "./utils/audio";

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { switchType, soundEnabled } = useAppStore();

  // Buttery-smooth virtual momentum wheel listener
  useEffect(() => {
    let target = getScrollProgress();
    let current = target;
    let rafId: number;

    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) > 0.0001) {
        current += diff * 0.12;
        setScrollProgress(current);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleWheel = (e: WheelEvent) => {
      const elem = e.target as HTMLElement;
      if (elem && elem.closest('.allow-internal-scroll')) {
        return;
      }

      // Smooth proportional wheel impulse
      const impulse = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.0011;
      target = Math.max(0, Math.min(1, target + impulse));
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Touch swipe listener for mobile scrolling
  useEffect(() => {
    let touchStartY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length > 1) return;

      const target = e.target as HTMLElement;
      if (target && target.closest('.allow-internal-scroll')) {
        return;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchY) * 0.0022;
      touchStartY = touchY;

      const current = getScrollProgress();
      const next = Math.max(0, Math.min(1, current + deltaY));
      setScrollProgress(next);
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Keyboard typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      setKeyPressed(e.code, true);
      if (soundEnabled) {
        playSwitchSound(switchType);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      setKeyPressed(e.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [switchType, soundEnabled]);

  return (
    <div className="w-screen h-screen bg-[#050505] overflow-hidden text-white font-sans selection:bg-orange-500/30 relative">
      <Suspense fallback={
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-orange-400 font-bold tracking-widest text-sm uppercase">Loading KeyCraft 3D...</div>
        </div>
      }>
        {/* R3F 3D Canvas Layer (Centered perfectly within viewport and freely interactive via mouse drag) */}
        <div className="absolute inset-0 lg:right-[22rem] z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
          <Canvas
            shadows
            dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
            camera={{ position: [0, 5.5, 20], fov: 38 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
          >
            <Scene />
          </Canvas>
        </div>

        {/* UI Overlay Layer */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 z-10 pointer-events-none"
        >
          <div className="h-screen w-full pointer-events-none">
            <UI scrollContainerRef={scrollContainerRef} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
