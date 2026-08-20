import React, { useRef, useEffect, useState } from "react";
import {
  useAppStore,
  useCustomScroll,
  setColorTheme,
  setRGBMode,
  setSwitchType,
  setSoundEnabled,
  toggleAnnotations,
  zoomIn,
  zoomOut,
  resetZoom,
  ColorTheme,
  RGBMode
} from "../store";
import { SwitchType, playSwitchSound } from "../utils/audio";
import {
  Volume2,
  VolumeX,
  Palette,
  Check,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";

interface StageInfo {
  num: string;
  title: string;
  desc: string;
  progress: number;
  iconType: 'keycaps' | 'switches' | 'plate' | 'pcb' | 'internals' | 'case' | 'exploded';
}

const STAGES: StageInfo[] = [
  { num: "01", title: "KEYCAPS", desc: "The journey begins", progress: 0.18, iconType: "keycaps" },
  { num: "02", title: "SWITCHES", desc: "The soul of typing", progress: 0.32, iconType: "switches" },
  { num: "03", title: "PLATE", desc: "The stabilizing force", progress: 0.46, iconType: "plate" },
  { num: "04", title: "PCB", desc: "The brain of the board", progress: 0.58, iconType: "pcb" },
  { num: "05", title: "INTERNALS", desc: "Hidden perfection", progress: 0.68, iconType: "internals" },
  { num: "06", title: "CASE & HARDWARE", desc: "The foundation", progress: 0.80, iconType: "case" },
  { num: "07", title: "EXPLODED VIEW", desc: "Every layer matters", progress: 0.92, iconType: "exploded" },
];

const THEMES: { id: ColorTheme; label: string; bg: string; border: string }[] = [
  { id: 'ember', label: 'Ember Orange', bg: 'bg-[#f97316]', border: 'border-[#f97316]' },
  { id: 'arctic', label: 'Arctic Ice', bg: 'bg-[#0284c7]', border: 'border-[#0284c7]' },
  { id: 'synthwave', label: 'Synthwave Neon', bg: 'bg-[#d946ef]', border: 'border-[#d946ef]' },
  { id: 'stealth', label: 'Stealth Obsidian', bg: 'bg-[#eab308]', border: 'border-[#eab308]' },
];

const RGB_MODES: { id: RGBMode; label: string }[] = [
  { id: 'ember', label: 'Amber Warm' },
  { id: 'rainbow', label: 'Rainbow Flow' },
  { id: 'breathe', label: 'Breathing' },
  { id: 'pulse', label: 'Pulse Wave' },
  { id: 'off', label: 'Lights Off' },
];

const SWITCH_TYPES: { id: SwitchType; label: string; desc: string }[] = [
  { id: 'linear', label: 'Thocky Linear 45g', desc: 'Smooth travel & deep acoustic pop' },
  { id: 'clicky', label: 'Clicky Blue 55g', desc: 'Tactile bump & crisp click' },
  { id: 'silent', label: 'Silent Linear 40g', desc: 'Muffled sound-dampened strike' },
];

interface UIProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function getActiveStageIndex(p: number): number {
  if (p < 0.12) return -1;
  if (p < 0.25) return 0;
  if (p < 0.38) return 1;
  if (p < 0.50) return 2;
  if (p < 0.62) return 3;
  if (p < 0.74) return 4;
  if (p < 0.85) return 5;
  return 6;
}

function LayerThumbnail({ type, isCurrent }: { type: string; isCurrent: boolean }) {
  const strokeColor = isCurrent ? "#f97316" : "#71717a";

  if (type === 'keycaps') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="6" width="9" height="7" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="15.5" y="6" width="9" height="7" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="27" y="6" width="9" height="7" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="6" y="16" width="9" height="7" rx="1.5" fill="#27272a" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="17.5" y="16" width="16.5" height="7" rx="1.5" fill="#f97316" fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="8" y="26" width="24" height="8" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === 'switches') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="10" width="12" height="12" rx="2" fill="#27272a" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="10.5" y="6" width="3" height="5" rx="0.5" fill="#f97316" />
        <rect x="22" y="10" width="12" height="12" rx="2" fill="#27272a" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="26.5" y="6" width="3" height="5" rx="0.5" fill="#f97316" />
        <rect x="14" y="22" width="12" height="12" rx="2" fill="#27272a" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="18.5" y="18" width="3" height="5" rx="0.5" fill="#f97316" />
      </svg>
    );
  }

  if (type === 'plate') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="2" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="8" y="12" width="6" height="6" rx="1" fill="#09090b" stroke={strokeColor} strokeWidth="0.8" />
        <rect x="17" y="12" width="6" height="6" rx="1" fill="#09090b" stroke={strokeColor} strokeWidth="0.8" />
        <rect x="26" y="12" width="6" height="6" rx="1" fill="#09090b" stroke={strokeColor} strokeWidth="0.8" />
        <rect x="8" y="22" width="6" height="6" rx="1" fill="#09090b" stroke={strokeColor} strokeWidth="0.8" />
        <rect x="17" y="22" width="15" height="6" rx="1" fill="#09090b" stroke={strokeColor} strokeWidth="0.8" />
      </svg>
    );
  }

  if (type === 'pcb') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="2" fill="#052e16" fillOpacity="0.4" stroke={strokeColor} strokeWidth="1.2" />
        <circle cx="11" cy="15" r="2" fill="#eab308" />
        <circle cx="20" cy="15" r="2" fill="#eab308" />
        <circle cx="29" cy="15" r="2" fill="#eab308" />
        <path d="M11 17L20 25M20 17L29 25" stroke="#eab308" strokeWidth="1" strokeDasharray="1 1" />
        <rect x="14" y="22" width="12" height="6" rx="1" fill="#18181b" stroke={strokeColor} strokeWidth="0.8" />
      </svg>
    );
  }

  if (type === 'internals') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="5" y="10" width="30" height="7" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1" />
        <rect x="5" y="19" width="30" height="5" rx="1" fill="#27272a" stroke={strokeColor} strokeWidth="1" />
        <rect x="5" y="26" width="30" height="7" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1" />
      </svg>
    );
  }

  if (type === 'case') {
    return (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="10" width="32" height="20" rx="3" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="9" y="14" width="22" height="12" rx="1.5" fill="#09090b" />
        <circle cx="8" cy="34" r="1.5" fill="#eab308" />
        <circle cx="16" cy="34" r="1.5" fill="#eab308" />
        <circle cx="24" cy="34" r="1.5" fill="#eab308" />
        <circle cx="32" cy="34" r="1.5" fill="#eab308" />
      </svg>
    );
  }

  return (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <path d="M6 8L20 4L34 8L20 12L6 8Z" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M6 15L20 11L34 15L20 19L6 15Z" fill="#27272a" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M6 22L20 18L34 22L20 26L6 22Z" fill="#052e16" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M6 29L20 25L34 29L20 33L6 29Z" fill="#18181b" stroke={strokeColor} strokeWidth="1.2" />
    </svg>
  );
}

function SidebarTracker({ scrollContainerRef }: UIProps) {
  const p = useCustomScroll();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeIdx = getActiveStageIndex(p);

  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.height = `${Math.min(100, Math.max(0, p * 100))}%`;
    }
  }, [p]);

  const scrollToStage = (targetProgress: number) => {
    if (scrollContainerRef.current) {
      const totalScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTo({
        top: targetProgress * totalScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex-grow relative flex flex-col justify-between py-2 pointer-events-auto">
      <div className="absolute left-[7px] top-6 bottom-6 w-[1.5px] bg-white/10"></div>
      <div
        ref={indicatorRef}
        className="absolute left-[7px] top-6 w-[1.5px] bg-orange-500 origin-top transition-all duration-75 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
      ></div>

      {STAGES.map((stage, i) => {
        const isCurrent = activeIdx === i;
        return (
          <button
            key={i}
            onClick={() => scrollToStage(stage.progress)}
            className={`relative flex items-center gap-3.5 text-left group transition p-2 rounded-xl cursor-pointer ${
              isCurrent ? 'bg-white/5 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full z-10 transition-all duration-300 ${
                isCurrent ? 'scale-125 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)] ring-2 ring-orange-500/40' : 'bg-white/20 group-hover:bg-white/40'
              }`}
            />

            <div className={`w-11 h-11 rounded-lg bg-black/60 border flex items-center justify-center p-1 transition ${
              isCurrent ? 'border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.2)]' : 'border-white/10 group-hover:border-white/20'
            }`}>
              <LayerThumbnail type={stage.iconType} isCurrent={isCurrent} />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-orange-400' : 'text-gray-500'}`}>{stage.num}</span>
                <span className={`text-xs font-black tracking-wider uppercase truncate ${isCurrent ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {stage.title}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                {stage.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function UI({ scrollContainerRef }: UIProps) {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel } = useAppStore();
  const scrollProgress = useCustomScroll();
  const [showConfig, setShowConfig] = useState(false);

  const scrollToSection = (targetProgress: number) => {
    if (scrollContainerRef.current) {
      const totalScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTo({
        top: targetProgress * totalScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex w-full h-full text-white pointer-events-none select-none">
      {/* Top Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/10 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-75 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:w-[calc(100%-22rem)]">
        {/* Top Navbar */}
        <nav className="w-full h-20 flex justify-between items-center px-8 md:px-12 sticky top-0 z-50 pointer-events-auto bg-black/40 backdrop-blur-md border-b border-white/10">
          <div
            onClick={() => scrollToSection(0)}
            className="flex items-center gap-3 text-lg font-black tracking-widest uppercase cursor-pointer"
          >
            <span className="text-orange-500 text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">⬡</span>
            <span>MECHCRAFT <span className="text-gray-400 text-xs font-normal tracking-wider ml-1">KEYBOARDS</span></span>
          </div>



          <div className="flex items-center gap-3 pointer-events-auto">
            {/* 3D Layer Annotations Callout Toggle */}
            <button
              onClick={toggleAnnotations}
              title={showAnnotations ? "Hide Layer Callout Labels" : "Show Layer Callout Labels"}
              className={`px-3 py-2 rounded-lg border text-xs font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                showAnnotations
                  ? 'border-orange-500 bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Tag size={13} className={showAnnotations ? "text-orange-400" : "text-gray-400"} />
              <span className="hidden sm:inline">{showAnnotations ? "LABELS ON" : "LABELS OFF"}</span>
            </button>

            {/* Switch Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSwitchSound(switchType);
              }}
              title={soundEnabled ? "Mute Switch Acoustics" : "Unmute Switch Acoustics"}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                soundEnabled
                  ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                  : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Customizer Studio Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="border border-white/20 bg-black/40 hover:border-orange-500 text-xs px-3 py-2 rounded-lg font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <Palette size={14} className="text-orange-400" />
              <span className="hidden sm:inline">STUDIO</span>
            </button>

            {/* Pre-Order Button */}
            <button className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black font-bold px-4 py-2 rounded-lg text-xs tracking-wider transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <span>🛒 PRE-ORDER NOW</span>
              <span className="font-bold">›</span>
            </button>
          </div>
        </nav>

        {/* Hero Section: Clean 3D Keyboard Model Display */}
        <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-end items-center px-8 md:px-12 pb-10 relative pointer-events-none">
          {/* Floating Interactive Zoom Controls */}
          <div className="fixed bottom-8 left-8 z-40 pointer-events-auto flex items-center gap-1.5 bg-black/80 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
            <button
              onClick={zoomOut}
              title="Zoom Out Model"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={resetZoom}
              title="Reset Zoom to 100%"
              className="px-2 py-1 text-xs font-mono font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1"
            >
              <span>{Math.round(zoomLevel * 100)}%</span>
              <RotateCcw size={11} className="text-gray-500" />
            </button>

            <button
              onClick={zoomIn}
              title="Zoom In Model"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </section>

        {/* Disassembly Section */}
        <section className="h-[600vh] relative pointer-events-none">
          <div className="sticky top-0 h-screen flex flex-col justify-end px-8 md:px-12 pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 border-t border-white/10 pt-6 max-w-4xl">
              <div className="flex items-start gap-2.5">
                <div className="text-orange-500 text-lg leading-none font-bold">◱</div>
                <div>
                  <div className="text-white font-bold text-[10px] tracking-wider uppercase">CNC ALUMINUM</div>
                  <div className="text-[9px] text-gray-400">Premium Build</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-orange-500 text-lg leading-none font-bold">💠</div>
                <div>
                  <div className="text-white font-bold text-[10px] tracking-wider uppercase">GASKET MOUNT</div>
                  <div className="text-[9px] text-gray-400">Softer Typing Feel</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-orange-500 text-lg leading-none font-bold">⌨️</div>
                <div>
                  <div className="text-white font-bold text-[10px] tracking-wider uppercase">PBT KEYCAPS</div>
                  <div className="text-[9px] text-gray-400">Durable & Fade Proof</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-orange-500 text-lg leading-none font-bold">🔆</div>
                <div>
                  <div className="text-white font-bold text-[10px] tracking-wider uppercase">RGB LIGHTING</div>
                  <div className="text-[9px] text-gray-400">16.8M Colors</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-orange-500 text-lg leading-none font-bold">🔋</div>
                <div>
                  <div className="text-white font-bold text-[10px] tracking-wider uppercase">4000mAh BATTERY</div>
                  <div className="text-[9px] text-gray-400">Long Lasting Power</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Studio Customizer Panel */}
      {showConfig && (
        <div className="allow-internal-scroll fixed bottom-6 left-8 md:left-12 z-50 pointer-events-auto bg-black/85 backdrop-blur-xl border border-white/15 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-[22rem] max-w-[calc(100vw-3rem)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-orange-400">
              <Palette size={15} /> KEYBOARD STUDIO
            </div>
            <button
              onClick={() => setShowConfig(false)}
              className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Colorway Edition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setColorTheme(th.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs font-bold transition cursor-pointer ${
                    colorTheme === th.id
                      ? `${th.border} bg-white/10 text-white`
                      : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/30'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${th.bg}`}></span>
                  <span className="truncate">{th.label}</span>
                  {colorTheme === th.id && <Check size={12} className="ml-auto text-orange-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Backlight Mode
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RGB_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setRGBMode(mode.id)}
                  className={`px-2.5 py-1.5 rounded-md border text-[11px] font-bold transition cursor-pointer ${
                    rgbMode === mode.id
                      ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                      : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Mechanical Switch Profile
            </label>
            <div className="space-y-1.5">
              {SWITCH_TYPES.map((sw) => (
                <button
                  key={sw.id}
                  onClick={() => {
                    setSwitchType(sw.id);
                    playSwitchSound(sw.id);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition cursor-pointer ${
                    switchType === sw.id
                      ? 'border-orange-500 bg-orange-500/15 text-white'
                      : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{sw.label}</div>
                    <div className="text-[10px] text-gray-400">{sw.desc}</div>
                  </div>
                  {switchType === sw.id && <Check size={14} className="text-orange-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar ("DISASSEMBLY JOURNEY") with Annotations Toggle */}
      <div className="hidden lg:flex w-[22rem] h-screen sticky top-0 border-l border-white/10 flex-col py-6 px-6 bg-black/40 backdrop-blur-md pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-orange-400 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
            <span>DISASSEMBLY JOURNEY</span>
          </div>

          {/* Right-side Toggle Switch for 3D Annotation Labels */}
          <button
            onClick={toggleAnnotations}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border transition flex items-center gap-1.5 cursor-pointer ${
              showAnnotations
                ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showAnnotations ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span>{showAnnotations ? 'LABELS ON' : 'LABELS OFF'}</span>
          </button>
        </div>

        <SidebarTracker scrollContainerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
