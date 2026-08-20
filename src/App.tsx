/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import UI from "./components/UI";
import { Suspense, useEffect, useRef } from "react";
import { setScrollProgress, getScrollProgress, subscribeScroll, setKeyPressed, useAppStore } from "./store";
import { playSwitchSound } from "./utils/audio";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { switchType, soundEnabled } = useAppStore();

  // Buttery-smooth virtual momentum wheel listener with kinetic inertia
  useEffect(() => {
    let target = getScrollProgress();
    let current = target;
    let velocity = 0;
    let rafId: number;
    let isInternalUpdating = false;

    // Synchronize target when updated from UI sliders or preset clicks
    const unsub = subscribeScroll(() => {
      if (!isInternalUpdating) {
        const ext = getScrollProgress();
        if (Math.abs(ext - current) > 0.005) {
          target = ext;
          current = ext;
          velocity = 0;
        }
      }
    });

    const tick = () => {
      const diff = target - current;
      velocity = velocity * 0.84 + diff * 0.14;
      current += velocity;

      if (Math.abs(diff) < 0.00001 && Math.abs(velocity) < 0.00001) {
        if (current !== target) {
          current = target;
          velocity = 0;
          isInternalUpdating = true;
          setScrollProgress(current);
          isInternalUpdating = false;
        }
      } else {
        isInternalUpdating = true;
        setScrollProgress(current);
        isInternalUpdating = false;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleWheel = (e: WheelEvent) => {
      const elem = e.target as HTMLElement;
      if (elem && elem.closest('.allow-internal-scroll')) {
        return;
      }

      const isTrackpad = Math.abs(e.deltaY) < 50 && !Number.isInteger(e.deltaY);
      const factor = isTrackpad ? 0.0007 : 0.00088;
      const impulse = e.deltaY * factor;
      target = Math.max(0, Math.min(1, target + impulse));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        target = Math.min(1, target + 0.06);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        target = Math.max(0, target - 0.06);
      } else if (e.key === 'Home') {
        target = 0;
      } else if (e.key === 'End') {
        target = 1;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => {
      unsub();
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Touch swipe listener for mobile scrolling with kinetic glide
  useEffect(() => {
    let lastTouchY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchY = e.touches[0].clientY;
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
      const deltaY = (lastTouchY - touchY) * 0.0028;
      lastTouchY = touchY;

      const current = getScrollProgress();
      setScrollProgress(Math.max(0, Math.min(1, current + deltaY)));
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
        <div className="absolute inset-0 z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
          <ErrorBoundary>
            <Canvas
              dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25)]}
              camera={{ position: [0, 5.5, 20], fov: 38 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                precision: 'mediump',
                stencil: false,
                depth: true,
              }}
            >
              <Scene />
            </Canvas>
          </ErrorBoundary>
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
