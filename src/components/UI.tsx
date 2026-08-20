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
  setCustomColor,
  resetCustomColors,
  setFontStyle,
  setFontSize,
  setLegendColor,
  setLightingEffect,
  setLightingSpeed,
  setLightingBrightness,
  setShowStudio,
  setStudioTab,
  saveCurrentLayout,
  loadLayout,
  deleteLayout,
  setScrollProgress,
  ColorTheme,
  RGBMode,
  FontStyle,
  LightingEffect,
  CustomColors,
  SavedLayout
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
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Type,
  Lightbulb,
  Save
} from "lucide-react";

/* ─── Stage Tracker Types ─── */
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

/* ─── Color Presets ─── */
const THEMES: { id: ColorTheme; label: string; bg: string; border: string }[] = [
  { id: 'ember', label: 'Ember Orange', bg: 'bg-[#f97316]', border: 'border-[#f97316]' },
  { id: 'arctic', label: 'Arctic Ice', bg: 'bg-[#0284c7]', border: 'border-[#0284c7]' },
  { id: 'synthwave', label: 'Synthwave Neon', bg: 'bg-[#d946ef]', border: 'border-[#d946ef]' },
  { id: 'stealth', label: 'Stealth Obsidian', bg: 'bg-[#eab308]', border: 'border-[#eab308]' },
];

const SWITCH_TYPES: { id: SwitchType; label: string; desc: string }[] = [
  { id: 'linear', label: 'Thocky Linear 45g', desc: 'Smooth travel & deep acoustic pop' },
  { id: 'clicky', label: 'Clicky Blue 55g', desc: 'Tactile bump & crisp click' },
  { id: 'silent', label: 'Silent Linear 40g', desc: 'Muffled sound-dampened strike' },
];

interface PartColorOption {
  key: keyof CustomColors;
  label: string;
  presetColors: string[];
}

const PART_CUSTOMIZERS: PartColorOption[] = [
  { key: 'keycapsAlpha', label: 'Alphas', presetColors: ['#18181c', '#f8fafc', '#20163b', '#0d0d0f', '#991b1b', '#1e3a8a', '#064e3b', '#701a75'] },
  { key: 'keycapsMod', label: 'Modifiers', presetColors: ['#121215', '#e2e8f0', '#170f2d', '#08080a', '#7f1d1d', '#172554', '#022c22', '#4a044e'] },
  { key: 'caseColor', label: 'Case', presetColors: ['#27272a', '#121215', '#e2e8f0', '#130e24', '#050505', '#1e293b', '#78350f', '#064e3b'] },
  { key: 'knobColor', label: 'Knob', presetColors: ['#3f3f46', '#ff7700', '#0284c7', '#d946ef', '#eab308', '#e2e8f0', '#dc2626', '#18181b'] },
  { key: 'switchStem', label: 'Stems', presetColors: ['#ff7700', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#eab308', '#ec4899', '#f8fafc'] },
  { key: 'plate', label: 'Plate', presetColors: ['#475569', '#f59e0b', '#18181b', '#cbd5e1', '#fb7185', '#0284c7', '#4c1d95', '#dc2626'] },
  { key: 'pcb', label: 'PCB', presetColors: ['#18181b', '#052e16', '#1e1b4b', '#581c87', '#7f1d1d', '#0f172a'] },
  { key: 'weightBar', label: 'Weight', presetColors: ['#f59e0b', '#ea580c', '#e2e8f0', '#a855f7', '#18181b', '#38bdf8'] },
];

/* ─── Per-Key Color Grid ─── */
const PER_KEY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e', '#14b8a6', '#0ea5e9', '#a855f7', '#6366f1', '#ffffff',
];

/* ─── Legend Color Swatches ─── */
const LEGEND_COLORS = ['#f97316', '#f59e0b', '#ffffff', '#94a3b8', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];

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

/* ─── Layer Thumbnail SVGs ─── */
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

/* ─── Sidebar Tracker ─── */
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
    setScrollProgress(targetProgress);
  };

  return (
    <div className="flex-grow relative flex flex-col justify-between py-2 pointer-events-auto">
      <div className="absolute left-[7px] top-6 bottom-6 w-[1.5px] bg-white/10"></div>
      <div ref={indicatorRef} className="absolute left-[7px] top-6 w-[1.5px] bg-orange-500 origin-top transition-all duration-75"></div>
      {STAGES.map((stage, i) => {
        const isCurrent = activeIdx === i;
        return (
          <button
            key={i}
            onClick={() => scrollToStage(stage.progress)}
            className={`relative flex items-center gap-3.5 text-left group transition p-2 rounded-xl cursor-pointer ${
              isCurrent ? 'bg-white/5 border border-orange-500/30' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full z-10 transition-all duration-300 ${
              isCurrent ? 'scale-125 bg-orange-500 ring-2 ring-orange-500/40' : 'bg-white/20 group-hover:bg-white/40'
            }`} />
            <div className={`w-11 h-11 rounded-lg bg-black/60 border flex items-center justify-center p-1 transition ${
              isCurrent ? 'border-orange-500/60' : 'border-white/10 group-hover:border-white/20'
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
              <div className="text-[10px] text-gray-500 mt-0.5 truncate">{stage.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Custom Slider Component ─── */
function StudioSlider({ value, onChange, accentColor = '#f97316' }: { value: number; onChange: (v: number) => void; accentColor?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const update = (e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    onChange(Math.round(pct));
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => update(e);
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragging]);

  return (
    <div
      ref={trackRef}
      className="relative h-2 rounded-full bg-white/10 cursor-pointer group"
      onMouseDown={(e) => { setDragging(true); update(e); }}
    >
      <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: accentColor }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-110"
        style={{ left: `calc(${value}% - 8px)`, backgroundColor: accentColor, borderColor: '#fff' }}
      />
    </div>
  );
}

/* ─── Full-Screen Studio Panel ─── */
function StudioPanel() {
  const {
    colorTheme, rgbMode, switchType, customColors,
    fontStyle, fontSize, legendColor, lightingEffect,
    lightingSpeed, lightingBrightness, savedLayouts, studioTab, showStudio
  } = useAppStore();
  const [layoutScroll, setLayoutScroll] = useState(0);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  if (!showStudio) return null;

  const maxScroll = Math.max(0, savedLayouts.length - 4);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto flex flex-col" style={{ background: 'linear-gradient(135deg, #0c0a1a 0%, #0a0a12 50%, #0d0b18 100%)' }}>

      {/* ─── TOP BAR ─── */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-[#2a2640]/60 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-orange-500 text-xl">⬡</span>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setStudioTab('workspace')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                studioTab === 'workspace' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setStudioTab('saved')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                studioTab === 'saved' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Saved Sets
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStudio(false)}
            className="text-gray-400 hover:text-white text-xs font-bold tracking-wider uppercase transition cursor-pointer"
          >
            Account
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify({ colorTheme, customColors, rgbMode, fontStyle, fontSize, legendColor, lightingEffect, lightingSpeed, lightingBrightness }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'keyboard-config.json'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wider uppercase rounded-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setShowStudio(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-grow flex min-h-0">

        {/* ─── LEFT: 3D Keyboard Preview Area ─── */}
        <div className="flex-grow relative flex flex-col">
          {/* Transparent - lets the 3D canvas show through */}
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 text-xs tracking-widest uppercase font-bold mb-2">Live 3D Preview</div>
              <div className="text-gray-700 text-[10px]">Scroll to disassemble • Drag to rotate</div>
            </div>
          </div>

          {/* ─── BOTTOM: Saved Layouts Carousel ─── */}
          <div className="px-6 pb-5 shrink-0">
            <div className="bg-[#0f0d1a]/80 border border-[#2a2640]/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-white tracking-wider uppercase">Saved Layouts</div>
                <div className="flex items-center gap-2">
                  {showSaveInput ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Layout name..."
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white w-28 outline-none focus:border-orange-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && saveName.trim()) {
                            saveCurrentLayout(saveName.trim());
                            setSaveName('');
                            setShowSaveInput(false);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (saveName.trim()) {
                            saveCurrentLayout(saveName.trim());
                            setSaveName('');
                            setShowSaveInput(false);
                          }
                        }}
                        className="p-1 rounded bg-orange-500 text-black cursor-pointer"
                      >
                        <Save size={12} />
                      </button>
                      <button onClick={() => setShowSaveInput(false)} className="p-1 rounded text-gray-400 hover:text-white cursor-pointer">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSaveInput(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Save Current Layout"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLayoutScroll(Math.max(0, layoutScroll - 1))}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  disabled={layoutScroll === 0}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex gap-3 overflow-hidden flex-grow">
                  {savedLayouts.slice(layoutScroll, layoutScroll + 4).map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => loadLayout(layout)}
                      className="group relative w-1/4 shrink-0 rounded-xl border border-white/10 hover:border-orange-500/50 overflow-hidden transition cursor-pointer bg-[#13111f]"
                    >
                      {/* Preview thumbnail - colored strip */}
                      <div className="h-16 flex items-end justify-center relative overflow-hidden">
                        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${layout.customColors.keycapsAlpha}88 0%, ${layout.customColors.caseColor} 100%)` }} />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {[layout.customColors.keycapsAlpha, layout.customColors.keycapsMod, layout.customColors.ledColor].map((c, i) => (
                            <div key={i} className="w-4 h-2 rounded-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div className="px-2 py-1.5 text-center">
                        <div className="text-[10px] font-bold text-gray-300 truncate">{layout.name}</div>
                      </div>
                      {/* Delete button on hover for custom layouts */}
                      {layout.id.startsWith('custom_') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteLayout(layout.id); }}
                          className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setLayoutScroll(Math.min(maxScroll, layoutScroll + 1))}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  disabled={layoutScroll >= maxScroll}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="allow-internal-scroll w-[340px] shrink-0 border-l border-[#2a2640]/50 overflow-y-auto no-scrollbar">
          <div className="p-5 space-y-5">

            {/* ── LEGEND DESIGN Section ── */}
            <div className="bg-[#13111f]/80 border border-[#2a2640]/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Type size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">Legend Design</span>
              </div>

              {/* Font Style */}
              <div className="mb-3.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Font Style</label>
                <div className="flex gap-1.5">
                  {(['modern', 'classic', 'script'] as FontStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setFontStyle(style)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                        fontStyle === style
                          ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                      style={{ fontFamily: style === 'script' ? 'Georgia, serif' : style === 'classic' ? '"Times New Roman", serif' : '"Segoe UI", system-ui, sans-serif' }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Font Size</label>
                  <span className="text-[10px] font-mono text-orange-400 font-bold">{fontSize}px</span>
                </div>
                <StudioSlider value={((fontSize - 24) / 56) * 100} onChange={(v) => setFontSize(Math.round(24 + (v / 100) * 56))} />
              </div>

              {/* Icon Selection Toggle (A1 style) */}
              <div className="mb-3.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Icon Selection</label>
                <div className="flex gap-1.5">
                  <button className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-orange-500 bg-orange-500/15 text-orange-400 cursor-pointer">
                    A1
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 cursor-pointer">
                    ⌘
                  </button>
                </div>
              </div>

              {/* Legend Color */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Legend Color</label>
                <div className="flex items-center gap-1.5">
                  {LEGEND_COLORS.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setLegendColor(hex)}
                      className={`w-7 h-7 rounded-lg transition shrink-0 cursor-pointer border ${
                        legendColor.toLowerCase() === hex.toLowerCase()
                          ? 'border-orange-400 ring-2 ring-orange-500/50 scale-110'
                          : 'border-white/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={legendColor}
                    onChange={(e) => setLegendColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* ── LIGHTING FX Section ── */}
            <div className="bg-[#13111f]/80 border border-[#2a2640]/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">Lighting FX</span>
              </div>

              {/* Effect Type */}
              <div className="mb-3.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Effect Type</label>
                <div className="flex gap-1.5">
                  {(['static', 'wave', 'breathe'] as LightingEffect[]).map((fx) => (
                    <button
                      key={fx}
                      onClick={() => setLightingEffect(fx)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                        lightingEffect === fx
                          ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {fx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed</label>
                  <span className="text-[10px] font-mono text-orange-400 font-bold">{lightingSpeed}%</span>
                </div>
                <StudioSlider value={lightingSpeed} onChange={setLightingSpeed} />
              </div>

              {/* Brightness */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brightness</label>
                  <span className="text-[10px] font-mono text-orange-400 font-bold">{lightingBrightness}%</span>
                </div>
                <StudioSlider value={lightingBrightness} onChange={setLightingBrightness} accentColor="#f59e0b" />
              </div>

              {/* Per Key Color Grid */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Per Key</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {PER_KEY_COLORS.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setCustomColor('ledColor', hex)}
                      className={`w-full aspect-square rounded-lg transition cursor-pointer border ${
                        customColors.ledColor.toLowerCase() === hex.toLowerCase()
                          ? 'border-white ring-1 ring-white/50 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={customColors.ledColor}
                    onChange={(e) => setCustomColor('ledColor', e.target.value)}
                    className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-gray-300">{customColors.ledColor}</span>
                </div>
              </div>
            </div>

            {/* ── COMPONENT COLORS Section ── */}
            <div className="bg-[#13111f]/80 border border-[#2a2640]/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">Component Colors</span>
              </div>

              {/* Theme Quick-Select */}
              <div className="mb-3.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Theme Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setColorTheme(th.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-[11px] font-bold transition cursor-pointer ${
                        colorTheme === th.id
                          ? `${th.border} bg-white/10 text-white`
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${th.bg}`}></span>
                      <span className="truncate">{th.label}</span>
                      {colorTheme === th.id && <Check size={11} className="ml-auto text-orange-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Part Colors Grid */}
              <div className="space-y-2">
                {PART_CUSTOMIZERS.map((part) => (
                  <div key={part.key} className="flex items-center gap-2">
                    <div className="w-20 text-[10px] font-bold text-gray-400 truncate">{part.label}</div>
                    <div className="flex items-center gap-1 flex-grow overflow-x-auto no-scrollbar">
                      {part.presetColors.slice(0, 6).map((hex) => (
                        <button
                          key={hex}
                          onClick={() => setCustomColor(part.key, hex)}
                          className={`w-5 h-5 rounded-md shrink-0 transition cursor-pointer border ${
                            customColors[part.key].toLowerCase() === hex.toLowerCase()
                              ? 'border-orange-400 ring-1 ring-orange-500/50 scale-110'
                              : 'border-white/10 hover:scale-105'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customColors[part.key]}
                      onChange={(e) => setCustomColor(part.key, e.target.value)}
                      className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── SWITCH PROFILE Section ── */}
            <div className="bg-[#13111f]/80 border border-[#2a2640]/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">Switch Profile</span>
              </div>
              <div className="space-y-1.5">
                {SWITCH_TYPES.map((sw) => (
                  <button
                    key={sw.id}
                    onClick={() => { setSwitchType(sw.id); playSwitchSound(sw.id); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      switchType === sw.id
                        ? 'border-orange-500 bg-orange-500/15 text-white'
                        : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-white">{sw.label}</div>
                      <div className="text-[9px] text-gray-400">{sw.desc}</div>
                    </div>
                    {switchType === sw.id && <Check size={13} className="text-orange-400" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div className="h-11 flex items-center justify-end px-6 border-t border-[#2a2640]/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-Time Rendering</span>
          <div className="w-10 h-5 rounded-full bg-orange-500 flex items-center justify-end px-0.5 cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main UI Export ─── */
export default function UI({ scrollContainerRef }: UIProps) {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel, customColors, showStudio } = useAppStore();
  const scrollProgress = useCustomScroll();

  const scrollToSection = (targetProgress: number) => {
    setScrollProgress(targetProgress);
  };

  return (
    <div className="flex w-full h-full text-white pointer-events-none select-none">
      {/* Top Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/10 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-75"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:w-[calc(100%-22rem)]">
        {/* Top Navbar */}
        <nav className="w-full h-20 flex justify-between items-center px-8 md:px-12 sticky top-0 z-50 pointer-events-auto bg-[#050505]/90 border-b border-white/5">
          <div
            onClick={() => scrollToSection(0)}
            className="flex items-center gap-3 text-lg font-black tracking-widest uppercase cursor-pointer"
          >
            <span className="text-orange-500 text-2xl">⬡</span>
            <span>MECHCRAFT <span className="text-gray-400 text-xs font-normal tracking-wider ml-1">KEYBOARDS</span></span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={toggleAnnotations}
              title={showAnnotations ? "Hide Labels" : "Show Labels"}
              className={`px-3 py-2 rounded-lg border text-xs font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                showAnnotations
                  ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Tag size={13} />
              <span className="hidden sm:inline">{showAnnotations ? "LABELS ON" : "LABELS OFF"}</span>
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSwitchSound(switchType);
              }}
              title={soundEnabled ? "Mute" : "Unmute"}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                soundEnabled
                  ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => setShowStudio(true)}
              className="border border-indigo-500/50 bg-indigo-600/20 hover:bg-indigo-600/40 text-xs px-4 py-2 rounded-lg font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <Palette size={14} className="text-indigo-400" />
              <span className="hidden sm:inline text-indigo-300">STUDIO</span>
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-end items-center px-8 md:px-12 pb-10 relative pointer-events-none">
          <div className="fixed bottom-8 left-8 z-40 pointer-events-auto flex items-center gap-1.5 bg-black/80 border border-white/15 px-3 py-2 rounded-xl">
            <button onClick={zoomOut} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer">
              <ZoomOut size={16} />
            </button>
            <button onClick={resetZoom} className="px-2 py-1 text-xs font-mono font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1">
              <span>{Math.round(zoomLevel * 100)}%</span>
              <RotateCcw size={11} className="text-gray-500" />
            </button>
            <button onClick={zoomIn} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer">
              <ZoomIn size={16} />
            </button>
          </div>
        </section>

        {/* Feature Badges */}
        <section className="h-[600vh] relative pointer-events-none">
          <div className="sticky top-0 h-screen flex flex-col justify-end px-8 md:px-12 pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 border-t border-white/10 pt-6 max-w-4xl">
              {[
                { icon: "◱", title: "CNC ALUMINUM", desc: "Premium Build" },
                { icon: "💠", title: "GASKET MOUNT", desc: "Softer Typing Feel" },
                { icon: "⌨️", title: "PBT KEYCAPS", desc: "Durable & Fade Proof" },
                { icon: "🔆", title: "RGB LIGHTING", desc: "16.8M Colors" },
                { icon: "🔋", title: "4000mAh BATTERY", desc: "Long Lasting Power" },
              ].map((badge, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="text-orange-500 text-lg leading-none font-bold">{badge.icon}</div>
                  <div>
                    <div className="text-white font-bold text-[10px] tracking-wider uppercase">{badge.title}</div>
                    <div className="text-[9px] text-gray-400">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Full-Screen Studio Overlay */}
      <StudioPanel />

      {/* Right Sidebar */}
      <div className="hidden lg:flex w-[22rem] h-screen sticky top-0 border-l border-white/10 flex-col py-6 px-6 bg-black/40 pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-orange-400 text-xs tracking-widest uppercase font-bold">
            DISASSEMBLY JOURNEY
          </div>
          <button
            onClick={toggleAnnotations}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border transition flex items-center gap-1.5 cursor-pointer ${
              showAnnotations
                ? 'border-orange-500 bg-orange-500/20 text-orange-400'
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
