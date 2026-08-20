import React, { useEffect, useRef, useState } from "react";
import {
  Layers,
  Palette,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  Sliders,
  Play,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Trash2,
  Check,
  Type,
  Lightbulb,
  Sparkle,
  X,
  Save,
  Grid,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
  Maximize2,
  Settings2,
  Wand2,
} from "lucide-react";
import {
  useAppStore,
  setColorTheme,
  setSwitchType,
  toggleSound,
  toggleAnnotations,
  setScrollProgress,
  useCustomScroll,
  resetCamera,
  setZoomLevel,
  setCustomColor,
  setFontStyle,
  setFontSize,
  setLegendColor,
  setLightingEffect,
  setLightingSpeed,
  setLightingBrightness,
  setShowStudio,
  setStudioTab,
  setInspectorTab,
  saveCurrentLayout,
  loadLayout,
  deleteLayout,
  renameLayout,
  duplicateLayout,
  undo,
  redo,
  canUndo,
  canRedo,
  ColorTheme,
  RGBMode,
  SwitchType,
  FontStyle,
  LightingEffect,
  SavedLayout,
  CustomColors,
} from "../store";
import { playSwitchSound } from "../utils/audio";

interface UIProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const THEMES: {
  id: ColorTheme;
  label: string;
  dotColor: string;
  dotMod: string;
  dotAccent: string;
  border: string;
  desc: string;
}[] = [
  {
    id: "ember",
    label: "Ember Dark",
    dotColor: "#18181c",
    dotMod: "#121215",
    dotAccent: "#ea580c",
    border: "border-amber-500",
    desc: "Burnt copper & industrial amber glow",
  },
  {
    id: "arctic",
    label: "Arctic Frost",
    dotColor: "#f8fafc",
    dotMod: "#e2e8f0",
    dotAccent: "#0284c7",
    border: "border-sky-400",
    desc: "Frost white & oceanic cyan accents",
  },
  {
    id: "botanical",
    label: "GMK Botanical",
    dotColor: "#e2e8f0",
    dotMod: "#1e3a2f",
    dotAccent: "#10b981",
    border: "border-emerald-500",
    desc: "Forest sage green with succulent mint",
  },
  {
    id: "olivia",
    label: "GMK Olivia",
    dotColor: "#fdf2f8",
    dotMod: "#18181b",
    dotAccent: "#f43f5e",
    border: "border-rose-500",
    desc: "Rose gold and soft blush pink keycaps",
  },
  {
    id: "synthwave",
    label: "Synthwave 80s",
    dotColor: "#20163b",
    dotMod: "#170f2d",
    dotAccent: "#d946ef",
    border: "border-fuchsia-500",
    desc: "Cyberpunk neon violet & vibrant cyan",
  },
  {
    id: "stealth",
    label: "Stealth Black",
    dotColor: "#0d0d0f",
    dotMod: "#08080a",
    dotAccent: "#eab308",
    border: "border-zinc-500",
    desc: "Matte black with industrial brass gold",
  },
  {
    id: "cafe",
    label: "GMK Café",
    dotColor: "#fef3c7",
    dotMod: "#38220f",
    dotAccent: "#b45309",
    border: "border-amber-700",
    desc: "Warm dark espresso with creamy latte",
  },
  {
    id: "nautilus",
    label: "GMK Nautilus",
    dotColor: "#06b6d4",
    dotMod: "#0f172a",
    dotAccent: "#eab308",
    border: "border-cyan-500",
    desc: "Deep ocean midnight navy with gold",
  },
  {
    id: "laser",
    label: "Cyberpunk Laser",
    dotColor: "#1e1b4b",
    dotMod: "#3b0764",
    dotAccent: "#06b6d4",
    border: "border-pink-500",
    desc: "Retro synth outrun purple & hot pink",
  },
  {
    id: "hyperfuse",
    label: "HyperFuse",
    dotColor: "#e2e8f0",
    dotMod: "#334155",
    dotAccent: "#a855f7",
    border: "border-purple-500",
    desc: "Classic light gray with electric violet",
  },
  {
    id: "midnight",
    label: "Midnight Blue",
    dotColor: "#0284c7",
    dotMod: "#0f172a",
    dotAccent: "#38bdf8",
    border: "border-blue-500",
    desc: "Deep celestial blue with sapphire accents",
  },
  {
    id: "matrix",
    label: "Matrix Terminal",
    dotColor: "#022c22",
    dotMod: "#050505",
    dotAccent: "#22c55e",
    border: "border-green-500",
    desc: "Phosphor monochrome cyber CRT green",
  },
];

const SWITCH_TYPES: { id: SwitchType; label: string; desc: string; force: string; soundType: string }[] = [
  {
    id: "linear",
    label: "Linear Red",
    desc: "Smooth 45g • Silent & Fast Actuation",
    force: "45g",
    soundType: "Smooth Clack",
  },
  {
    id: "tactile",
    label: "Tactile Brown",
    desc: "Bumpy 55g • Tactile Mechanical Feedback",
    force: "55g",
    soundType: "Medium Thock",
  },
  {
    id: "clicky",
    label: "Clicky Blue",
    desc: "Crisp 60g • Acoustic Snap & Click",
    force: "60g",
    soundType: "High Click",
  },
];

const LEGEND_COLORS = [
  "#ffffff",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#f59e0b",
  "#ff7700",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#06b6d4",
  "#10b981",
  "#000000",
];

const PER_KEY_COLORS = [
  "#ff7700",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#22c55e",
  "#eab308",
  "#ffffff",
  "#000000",
];

const SWITCH_COLOR_PRESETS = [
  {
    id: "tangerine",
    name: "C³ Tangerine",
    stem: "#06b6d4",
    housing: "#ff6600",
    topHousing: "#ff8533",
    spring: "#f59e0b",
    desc: "Vibrant orange casing with turquoise stem",
    accent: "#ff6600",
  },
  {
    id: "oil_king",
    name: "Gateron Oil King",
    stem: "#18181b",
    housing: "#09090b",
    topHousing: "#27272a",
    spring: "#22c55e",
    desc: "All-black nylon body with golden factory lube",
    accent: "#18181b",
  },
  {
    id: "holy_panda",
    name: "Holy Panda",
    stem: "#ff7700",
    housing: "#f8fafc",
    topHousing: "#ffffff",
    spring: "#f59e0b",
    desc: "Ivory white base with salmon tactile stem",
    accent: "#ff7700",
  },
  {
    id: "ink_black",
    name: "Gateron Ink V2",
    stem: "#18181b",
    housing: "#1e1e24",
    topHousing: "#3f3f46",
    spring: "#f59e0b",
    desc: "Smoky translucent casing with pitch stem",
    accent: "#3f3f46",
  },
  {
    id: "banana_split",
    name: "Banana Split",
    stem: "#fbbf24",
    housing: "#f472b6",
    topHousing: "#fbcfe8",
    spring: "#eab308",
    desc: "Pastel pink housing with creamy banana stem",
    accent: "#f472b6",
  },
  {
    id: "alpacas",
    name: "Silent Alpaca",
    stem: "#38bdf8",
    housing: "#334155",
    topHousing: "#64748b",
    spring: "#94a3b8",
    desc: "Slate grey housing with sky blue stem",
    accent: "#38bdf8",
  },
  {
    id: "lavender",
    name: "JWK Lavender",
    stem: "#c084fc",
    housing: "#7e22ce",
    topHousing: "#a855f7",
    spring: "#f59e0b",
    desc: "Deep violet nylon shell with lilac stem",
    accent: "#a855f7",
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    stem: "#15803d",
    housing: "#dcfce7",
    topHousing: "#f0fdf4",
    spring: "#eab308",
    desc: "Refreshing sage and forest matcha tones",
    accent: "#15803d",
  },
];

const PART_CUSTOMIZERS: { key: keyof CustomColors; label: string; presetColors: string[] }[] = [
  { key: 'caseColor', label: 'CNC Case', presetColors: ['#141418', '#08080a', '#1e293b', '#e2e8f0', '#130e24', '#1c1917'] },
  { key: 'keycapsAlpha', label: 'Keycaps Alpha', presetColors: ['#18181c', '#0d0d0f', '#20163b', '#f8fafc', '#052e16', '#1e1b4b'] },
  { key: 'keycapsMod', label: 'Keycaps Mod', presetColors: ['#121215', '#08080a', '#170f2d', '#e2e8f0', '#022c22', '#0f172a'] },
  { key: 'keycapsAccent', label: 'Keycaps Accent', presetColors: ['#ea580c', '#d946ef', '#0284c7', '#eab308', '#10b981', '#ef4444'] },
  { key: 'switchStem', label: 'Switch Stem', presetColors: ['#ff7700', '#ef4444', '#0284c7', '#a855f7', '#eab308', '#22c55e', '#ec4899', '#f8fafc'] },
  { key: 'switchHousing', label: 'Switch Base Housing', presetColors: ['#18181b', '#09090b', '#e2e8f0', '#20163b', '#052e16', '#7c2d12', '#1e1b4b', '#f8fafc'] },
  { key: 'switchTopHousing', label: 'Switch Top Housing', presetColors: ['#cbd5e1', '#ffffff', '#ff7700', '#06b6d4', '#d946ef', '#22c55e', '#ef4444', '#18181b'] },
  { key: 'switchSpring', label: 'Internal Spring & Pins', presetColors: ['#f59e0b', '#e2e8f0', '#fb923c', '#94a3b8', '#06b6d4', '#d946ef', '#eab308'] },
  { key: 'stabilizerHousing', label: 'Stabilizer Housing', presetColors: ['#18181b', '#cbd5e1', '#170f2d', '#09090b', '#ff7700', '#0284c7', '#d946ef'] },
  { key: 'stabilizerStem', label: 'Stabilizer Stem', presetColors: ['#ff7700', '#0284c7', '#d946ef', '#eab308', '#22c55e', '#f8fafc', '#ef4444'] },
  { key: 'stabilizerWire', label: 'Stabilizer Wire', presetColors: ['#f59e0b', '#e2e8f0', '#71717a', '#fb923c', '#d946ef', '#38bdf8'] },
  { key: 'plate', label: 'Switch Plate', presetColors: ['#475569', '#1e1e24', '#fbbf24', '#cbd5e1', '#4c1d95', '#065f46', '#334155'] },
  { key: 'pcb', label: 'Hot-Swap PCB', presetColors: ['#18181b', '#0d0d10', '#1e293b', '#2e1065', '#052e16', '#3f3f46'] },
  { key: 'knobColor', label: 'Rotary Knob', presetColors: ['#6b7280', '#3f3f46', '#141416', '#f59e0b', '#0284c7', '#d946ef', '#e2e8f0', '#ef4444'] },
  { key: 'weightBar', label: 'Brass Weight Bar', presetColors: ['#f59e0b', '#e2e8f0', '#06b6d4', '#d946ef', '#10b981', '#3b82f6'] },
  { key: 'bgColor', label: 'Studio Background', presetColors: ['#18181b', '#27272a', '#3f3f46', '#0f172a', '#1e293b', '#09090b', '#050505', '#f1f5f9'] },
];

/* ─── Studio Custom Slider (Block Style) ─── */
function StudioSlider({
  value,
  onChange,
  accentColor = '#f97316'
}: {
  value: number;
  onChange: (v: number) => void;
  accentColor?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointer = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(pos * 100));
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointer}
      className="h-6 flex items-center cursor-pointer select-none group relative py-1"
    >
      <div className="w-full h-2 bg-zinc-800/80 rounded-md overflow-hidden relative border border-white/5">
        <div
          className="h-full rounded-md transition-all"
          style={{ width: `${value}%`, backgroundColor: accentColor }}
        />
      </div>
      <div
        className="w-4 h-4 rounded-md bg-white shadow-lg border-2 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform group-hover:scale-110"
        style={{ left: `${value}%`, borderColor: accentColor }}
      />
    </div>
  );
}

/* ─── Mini Keyboard Thumbnail Card (Block Bento Style) ─── */
function MiniKeyboardCard({
  layout,
  isActive,
  onClick,
  onDelete,
  onRename,
  onDuplicate,
}: {
  layout: SavedLayout;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  onDuplicate?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layout.name);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden text-left ${
        isActive
          ? 'border-orange-500 ring-1 ring-orange-500/40 bg-zinc-900/90 shadow-lg shadow-orange-500/10'
          : 'border-zinc-800/90 hover:border-zinc-700 bg-zinc-950/80 hover:bg-zinc-900/60'
      }`}
    >
      {/* Mini Keyboard Graphical Preview */}
      <div className="h-16 p-2 flex flex-col justify-between relative overflow-hidden bg-black/50 border-b border-white/5">
        {/* Chassis outline */}
        <div
          className="w-full h-full rounded-lg p-1 flex flex-col justify-between border shadow-inner transition-colors"
          style={{
            backgroundColor: layout.customColors.caseColor || '#141418',
            borderColor: `${layout.customColors.ledColor || '#ff8800'}40`,
          }}
        >
          {/* F-Row & Numbers representation */}
          <div className="flex gap-0.5 justify-between">
            <div
              className="w-2.5 h-1.5 rounded-xs"
              style={{ backgroundColor: layout.customColors.keycapsAccent || '#ea580c' }}
            />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-xs opacity-80"
                  style={{ backgroundColor: layout.customColors.keycapsAlpha || '#18181c' }}
                />
              ))}
            </div>
            <div
              className="w-2 h-2 rounded-full border border-amber-500/60 shrink-0"
              style={{ backgroundColor: layout.customColors.knobColor || '#141416' }}
            />
          </div>

          {/* Alpha grid representation */}
          <div className="flex gap-0.5 justify-center">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-2 h-1.5 rounded-xs"
                style={{ backgroundColor: layout.customColors.keycapsAlpha || '#18181c' }}
              />
            ))}
          </div>

          {/* Spacebar row & LED glow bar */}
          <div className="flex gap-0.5 items-center justify-between">
            <div
              className="w-2.5 h-1.5 rounded-xs"
              style={{ backgroundColor: layout.customColors.keycapsMod || '#121215' }}
            />
            <div
              className="w-10 h-1.5 rounded-xs relative"
              style={{ backgroundColor: layout.customColors.keycapsMod || '#121215' }}
            >
              <div
                className="absolute inset-0 rounded-xs blur-[2px] opacity-70"
                style={{ backgroundColor: layout.customColors.ledColor || '#ff8800' }}
              />
            </div>
            <div
              className="w-2.5 h-1.5 rounded-xs"
              style={{ backgroundColor: layout.customColors.keycapsAccent || '#ea580c' }}
            />
          </div>
        </div>
      </div>

      {/* Card Info & Meta */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (onRename && editName.trim()) {
                  onRename(editName.trim());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (onRename && editName.trim()) {
                    onRename(editName.trim());
                  }
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="bg-black/60 border border-orange-500 rounded px-1.5 py-0.5 text-xs text-white font-bold w-full outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-xs font-bold text-white tracking-wide truncate group-hover:text-orange-400 transition"
              title="Double click to rename"
            >
              {layout.name}
            </span>
          )}

          {isActive && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span className="capitalize font-mono">{layout.colorTheme}</span>
          <span className="font-mono text-zinc-500 text-[9px]">
            {new Date(layout.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded bg-black/70 text-white hover:bg-zinc-800 cursor-pointer backdrop-blur-md border border-white/10"
            title="Duplicate preset"
          >
            <Layers size={11} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded bg-red-950/80 text-red-300 hover:bg-red-900 cursor-pointer border border-red-500/40"
            title="Delete preset"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Full-Screen Responsive Block Studio Panel ─── */
function StudioPanel() {
  const {
    colorTheme,
    rgbMode,
    switchType,
    customColors,
    fontStyle,
    fontSize,
    legendColor,
    lightingEffect,
    lightingSpeed,
    lightingBrightness,
    savedLayouts,
    studioTab,
    inspectorTab,
    showStudio,
    zoomLevel,
    soundEnabled,
    showAnnotations,
  } = useAppStore();

  const scrollProgress = useCustomScroll();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLayouts = savedLayouts.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveInput(true);
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
        } else {
          setShowStudio(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, mobileDrawerOpen]);

  if (!showStudio) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col font-sans">
      {/* ─── BLOCK HEADER: TOP BAR ─── */}
      <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-zinc-800/80 shrink-0 bg-[#090812]/95 backdrop-blur-xl pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Brand Block */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-orange-500 text-lg font-black">⬡</span>
            <span className="text-xs font-black tracking-wider text-white uppercase hidden sm:inline">
              Keycraft <span className="text-orange-400">Studio</span>
            </span>
          </div>

          {/* Mode Switch Block (Workspace vs Saved Sets) */}
          <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setStudioTab("workspace")}
              className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 ${
                studioTab === "workspace"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <SlidersHorizontal size={12} />
              <span className="hidden xs:inline">Workspace</span>
            </button>
            <button
              onClick={() => setStudioTab("saved")}
              className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 ${
                studioTab === "saved"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Grid size={12} />
              <span>Saved ({savedLayouts.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Annotations Toggle Block */}
          <button
            onClick={toggleAnnotations}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide transition cursor-pointer ${
              showAnnotations
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Info size={12} />
            <span>{showAnnotations ? "Labels ON" : "Labels OFF"}</span>
          </button>

          {/* Sound Toggle Block */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
            title={soundEnabled ? "Mute Switch Sound" : "Unmute Switch Sound"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Current Theme Edition Block */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="capitalize font-bold text-orange-400">{colorTheme}</span>
          </div>

          {/* Save Current Preset Block Button */}
          <button
            onClick={() => setShowSaveInput(true)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition cursor-pointer"
            title="Save layout preset"
          >
            <Save size={12} className="text-orange-400" />
            <span>Save</span>
          </button>

          {/* Export Preset Block Button */}
          <button
            onClick={() => {
              const data = JSON.stringify(
                {
                  colorTheme,
                  customColors,
                  rgbMode,
                  fontStyle,
                  fontSize,
                  legendColor,
                  lightingEffect,
                  lightingSpeed,
                  lightingBrightness,
                },
                null,
                2
              );
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `keycraft-${colorTheme}-config.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-black font-black text-[11px] tracking-wider uppercase rounded-lg transition shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
            title="Export JSON Config"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Mobile Inspector Drawer Trigger Button (Only visible on < lg screens) */}
          <button
            onClick={() => setMobileDrawerOpen(prev => !prev)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
              mobileDrawerOpen
                ? "bg-orange-500 text-black border-orange-500"
                : "bg-orange-500/20 text-orange-400 border-orange-500/40"
            }`}
          >
            <Sliders size={13} />
            <span>{mobileDrawerOpen ? "Close" : "Customize"}</span>
          </button>

          {/* Close Studio Button */}
          <button
            onClick={() => setShowStudio(false)}
            className="p-1.5 px-2.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-red-500/20 border border-zinc-800 hover:border-red-500/40 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Close Studio (ESC)"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* Save Preset Dialog Modal */}
      {showSaveInput && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-[#0f0e1a] border border-zinc-800 rounded-2xl p-5 shadow-2xl max-w-sm w-full">
            <h3 className="text-white font-black uppercase tracking-wider text-sm mb-1 flex items-center gap-2">
              <Save size={15} className="text-orange-400" />
              Save Preset Configuration
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Give your personalized custom build a name to access in Saved Sets.
            </p>
            <input
              type="text"
              placeholder="e.g. Amber Cyberpunk V1"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveInput(false);
                  setSaveName("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (saveName.trim()) {
                    saveCurrentLayout(saveName.trim());
                    setShowSaveInput(false);
                    setSaveName("");
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-orange-400 text-black cursor-pointer shadow-md shadow-orange-500/20"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-[#0f0e1a] border border-zinc-800 rounded-2xl p-5 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black uppercase tracking-wider text-sm flex items-center gap-2">
                <Info size={15} className="text-orange-400" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="text-zinc-400 hover:text-white"><X size={15}/></button>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Undo Action</span>
                <kbd className="px-2 py-0.5 bg-zinc-900 rounded font-mono text-[10px] border border-zinc-700 text-zinc-200">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Redo Action</span>
                <kbd className="px-2 py-0.5 bg-zinc-900 rounded font-mono text-[10px] border border-zinc-700 text-zinc-200">Ctrl + Shift + Z</kbd>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Save Preset</span>
                <kbd className="px-2 py-0.5 bg-zinc-900 rounded font-mono text-[10px] border border-zinc-700 text-zinc-200">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Toggle Shortcuts</span>
                <kbd className="px-2 py-0.5 bg-zinc-900 rounded font-mono text-[10px] border border-zinc-700 text-zinc-200">?</kbd>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                <span>Interactive Typing</span>
                <span className="text-[10px] text-orange-400 font-bold">Physical Switches & Acoustics</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 1: WORKSPACE VIEW ─── */}
      {studioTab === "workspace" ? (
        <div className="flex-grow flex min-h-0 relative">
          
          {/* ── VIEWPORT CONTAINER (With Responsive Floating Bento Controls) ── */}
          <div className="flex-grow relative flex flex-col pointer-events-none">
            
            {/* FLOATING BENTO CONTROLS: DESKTOP (Top-Left) & MOBILE (Bottom Center) */}
            <div className="absolute top-4 left-3 sm:left-6 z-10 pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[calc(100vw-24px)]">
              {/* Zoom Block */}
              <div className="flex items-center bg-[#090812]/95 border border-zinc-800/90 rounded-xl p-0.5 shadow-xl backdrop-blur-md">
                <button
                  onClick={() => setZoomLevel(zoomLevel * 1.15)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoomLevel(zoomLevel / 1.15)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1.0);
                    resetCamera();
                  }}
                  className="px-2 py-1 text-[11px] font-mono font-bold text-orange-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
              </div>

              {/* History Undo/Redo Block */}
              <div className="flex items-center bg-[#090812]/95 border border-zinc-800/90 rounded-xl p-0.5 shadow-xl backdrop-blur-md">
                <button
                  onClick={() => undo()}
                  disabled={!canUndo()}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => redo()}
                  disabled={!canRedo()}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Shift+Z)"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Explode / Assembly Interactive Slider Block */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#090812]/95 border border-zinc-800/90 rounded-xl shadow-xl backdrop-blur-md">
                <Layers size={13} className="text-orange-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">Explode</span>
                <div className="w-16 sm:w-20">
                  <StudioSlider value={Math.round(scrollProgress * 100)} onChange={(v) => setScrollProgress(v / 100)} />
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-bold w-7 text-right">{Math.round(scrollProgress * 100)}%</span>
              </div>

              {/* Assemble Quick Reset Button */}
              <button
                onClick={() => setScrollProgress(0)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090812]/95 border border-zinc-800/90 text-[11px] font-bold text-zinc-300 hover:text-white hover:border-orange-500/40 transition shadow-xl backdrop-blur-md cursor-pointer"
                title="Reset to fully assembled view"
              >
                <Eye size={12} className="text-orange-400" />
                Assemble View
              </button>
            </div>

            {/* Mobile Bottom Quick-Action Floating Pill (When drawer is closed on < lg) */}
            {!mobileDrawerOpen && (
              <div className="lg:hidden absolute bottom-5 right-4 z-20 pointer-events-auto">
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-2xl shadow-orange-500/40 cursor-pointer hover:bg-orange-400 active:scale-95 transition"
                >
                  <Settings2 size={16} />
                  <span>Customize Build</span>
                </button>
              </div>
            )}

            {/* Viewport Center Canvas area */}
            <div className="flex-grow pointer-events-none" />
          </div>

          {/* ── MOBILE BACKDROP OVERLAY (When drawer is open on mobile) ── */}
          {mobileDrawerOpen && (
            <div
              onClick={() => setMobileDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 pointer-events-auto transition-opacity"
            />
          )}

          {/* ── RIGHT STUDIO INSPECTOR (Desktop Sidebar & Mobile Drawer) ── */}
          <aside
            className={`
              allow-internal-scroll
              pointer-events-auto
              flex flex-col
              bg-[#0a0914]/98
              border-zinc-800/90
              backdrop-blur-2xl
              transition-all duration-300 ease-out
              z-50
              
              /* Desktop Sidebar Style */
              lg:static lg:w-[370px] xl:w-[410px] lg:shrink-0 lg:border-l lg:max-h-none lg:translate-y-0 lg:rounded-none lg:shadow-none

              /* Mobile Slide-Up Drawer Style */
              fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t shadow-2xl
              ${mobileDrawerOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"}
            `}
          >
            {/* Mobile Drawer Top Drag Bar & Close */}
            <div className="lg:hidden flex flex-col items-center pt-2.5 pb-1 px-4 border-b border-zinc-800/60 shrink-0">
              <div className="w-12 h-1 bg-zinc-700 rounded-full mb-2" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 size={14} className="text-orange-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">Studio Inspector</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Inspector Tab Switcher Block (Basic vs Advanced) */}
            <div className="p-3 sm:p-4 pb-0 shrink-0">
              <div className="flex bg-zinc-950/90 rounded-xl p-1 border border-zinc-800/80">
                <button
                  onClick={() => setInspectorTab('basic')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    inspectorTab === 'basic' 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs" 
                    : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Palette size={12} />
                  Basic Craft
                </button>
                <button
                  onClick={() => setInspectorTab('advanced')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    inspectorTab === 'advanced' 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs" 
                    : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sliders size={12} />
                  Advanced Studio
                </button>
              </div>
            </div>

            {/* Inspector Bento Cards Container */}
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto no-scrollbar flex-grow">
              
              {inspectorTab === 'basic' ? (
                <>
                  {/* BENTO BLOCK 1: Theme Presets */}
                  <div className="bg-[#100f1c]/95 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Palette size={13} className="text-orange-400" />
                        <span className="text-xs font-black text-white tracking-wider uppercase">
                          Theme Colorways
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {THEMES.length} Presets
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                      {THEMES.map((th) => {
                        const isSelected = colorTheme === th.id;
                        return (
                          <button
                            key={th.id}
                            onClick={() => setColorTheme(th.id)}
                            className={`flex flex-col gap-1 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              isSelected
                                ? `${th.border} bg-orange-500/15 text-white shadow-md ring-1 ring-orange-500/40`
                                : "border-zinc-800/80 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[11px] font-bold text-white truncate flex-grow mr-1">{th.label}</span>
                              <div className="flex items-center -space-x-1 shrink-0">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: th.dotColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: th.dotMod }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-xs" style={{ backgroundColor: th.dotAccent }} />
                              </div>
                            </div>
                            <span className="text-[9px] text-zinc-400 line-clamp-1">{th.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BENTO BLOCK 2: Switch Profile & Sound */}
                  <div className="bg-[#100f1c]/95 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders size={13} className="text-orange-400" />
                        <span className="text-xs font-black text-white tracking-wider uppercase">
                          Mechanical Switches
                        </span>
                      </div>
                      <span className="text-[10px] text-orange-400 font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                        {switchType}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {SWITCH_TYPES.map((sw) => (
                        <button
                          key={sw.id}
                          onClick={() => {
                            setSwitchType(sw.id);
                            playSwitchSound(sw.id);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            switchType === sw.id
                              ? "border-orange-500 bg-orange-500/15 text-white shadow-xs ring-1 ring-orange-500/30"
                              : "border-zinc-800/80 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <div>
                            <div className="text-[11px] font-bold text-white flex items-center gap-2">
                              <span>{sw.label}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">{sw.force}</span>
                            </div>
                            <div className="text-[9px] text-zinc-400 mt-0.5">{sw.desc}</div>
                          </div>
                          {switchType === sw.id && (
                            <Check size={14} className="text-orange-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Switch Colorway Presets */}
                    <div className="pt-2.5 border-t border-zinc-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={11} className="text-orange-400" />
                          Switch Colorways
                        </label>
                        <span className="text-[9px] text-zinc-500">1-Click Apply</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto no-scrollbar pr-0.5">
                        {SWITCH_COLOR_PRESETS.map((preset) => {
                          const isSelected = 
                            customColors.switchStem.toLowerCase() === preset.stem.toLowerCase() &&
                            customColors.switchHousing.toLowerCase() === preset.housing.toLowerCase();

                          return (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setCustomColor("switchStem", preset.stem);
                                setCustomColor("switchHousing", preset.housing);
                                setCustomColor("switchTopHousing", preset.topHousing);
                                setCustomColor("switchSpring", preset.spring);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[52px] ${
                                isSelected
                                  ? "border-orange-500 bg-orange-500/15 shadow-xs ring-1 ring-orange-500/30"
                                  : "border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/50"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-0.5">
                                <span className="text-[10.5px] font-bold text-white truncate mr-1">{preset.name}</span>
                                <div className="flex items-center -space-x-1 shrink-0">
                                  <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: preset.housing }} title="Base Housing" />
                                  <span className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-xs" style={{ backgroundColor: preset.stem }} title="Stem Slider" />
                                </div>
                              </div>
                              <span className="text-[8.5px] text-zinc-400 line-clamp-1">{preset.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Switch Part Color Tuners */}
                    <div className="pt-2.5 border-t border-zinc-800/80 space-y-2">
                      <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">
                        Precision Switch Parts
                      </div>

                      {/* Stem */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-medium">Stem Slider</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchStem}
                            onChange={(e) => setCustomColor("switchStem", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-zinc-300 text-[9px] w-14 text-right">{customColors.switchStem}</span>
                        </div>
                      </div>

                      {/* Housing Base */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-medium">Base Housing</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchHousing}
                            onChange={(e) => setCustomColor("switchHousing", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-zinc-300 text-[9px] w-14 text-right">{customColors.switchHousing}</span>
                        </div>
                      </div>

                      {/* Top Shell */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-medium">Top Clear Shell</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchTopHousing}
                            onChange={(e) => setCustomColor("switchTopHousing", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-zinc-300 text-[9px] w-14 text-right">{customColors.switchTopHousing}</span>
                        </div>
                      </div>

                      {/* Internal Spring */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-medium">Internal Spring</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchSpring}
                            onChange={(e) => setCustomColor("switchSpring", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-zinc-300 text-[9px] w-14 text-right">{customColors.switchSpring}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* BENTO BLOCK 3: Legend & Typography */}
                  <div className="bg-[#100f1c]/95 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Type size={13} className="text-orange-400" />
                      <span className="text-xs font-black text-white tracking-wider uppercase">
                        Keycap Typography
                      </span>
                    </div>

                    {/* Font Style */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                        Font Family
                      </label>
                      <div className="flex gap-1.5">
                        {(["modern", "classic", "script"] as FontStyle[]).map((style) => (
                          <button
                            key={style}
                            onClick={() => setFontStyle(style)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                              fontStyle === style
                                ? "border-orange-500 bg-orange-500/15 text-orange-400 shadow-xs"
                                : "border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Legend Scale
                        </label>
                        <span className="text-[10px] font-mono text-orange-400 font-black">
                          {fontSize}px
                        </span>
                      </div>
                      <StudioSlider
                        value={((fontSize - 24) / 56) * 100}
                        onChange={(v) => setFontSize(Math.round(24 + (v / 100) * 56))}
                      />
                    </div>

                    {/* Legend Color */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                        Legend Color
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {LEGEND_COLORS.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => setLegendColor(hex)}
                            className={`w-6 h-6 rounded-md transition shrink-0 cursor-pointer border ${
                              legendColor.toLowerCase() === hex.toLowerCase()
                                ? "border-orange-400 ring-2 ring-orange-500/50 scale-110"
                                : "border-white/15 hover:scale-105"
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        <input
                          type="color"
                          value={legendColor}
                          onChange={(e) => setLegendColor(e.target.value)}
                          className="w-6 h-6 rounded-md border border-white/20 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BENTO BLOCK 4: Lighting FX & Underglow */}
                  <div className="bg-[#100f1c]/95 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb size={13} className="text-orange-400" />
                      <span className="text-xs font-black text-white tracking-wider uppercase">
                        RGB Backlight & Glow
                      </span>
                    </div>

                    {/* Effect Type */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                        Lighting Animation
                      </label>
                      <div className="flex gap-1.5">
                        {(["static", "wave", "breathe"] as LightingEffect[]).map((fx) => (
                          <button
                            key={fx}
                            onClick={() => setLightingEffect(fx)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                              lightingEffect === fx
                                ? "border-orange-500 bg-orange-500/15 text-orange-400 shadow-xs"
                                : "border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            {fx}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Animation Speed
                        </label>
                        <span className="text-[10px] font-mono text-orange-400 font-black">
                          {lightingSpeed}%
                        </span>
                      </div>
                      <StudioSlider value={lightingSpeed} onChange={setLightingSpeed} />
                    </div>

                    {/* Brightness Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          LED Lumens
                        </label>
                        <span className="text-[10px] font-mono text-orange-400 font-black">
                          {lightingBrightness}%
                        </span>
                      </div>
                      <StudioSlider
                        value={lightingBrightness}
                        onChange={setLightingBrightness}
                        accentColor="#f59e0b"
                      />
                    </div>

                    {/* Per Key Color Grid */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                        RGB Glow Palette
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                        {PER_KEY_COLORS.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => setCustomColor("ledColor", hex)}
                            className={`w-full aspect-square rounded-md transition cursor-pointer border ${
                              customColors.ledColor.toLowerCase() === hex.toLowerCase()
                                ? "border-white ring-2 ring-orange-500/60 scale-110"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={customColors.ledColor}
                          onChange={(e) => setCustomColor("ledColor", e.target.value)}
                          className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-300">
                          {customColors.ledColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BENTO BLOCK 5: Component Colors & Chassis Finishes */}
                  <div className="bg-[#100f1c]/95 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={13} className="text-orange-400" />
                      <span className="text-xs font-black text-white tracking-wider uppercase">
                        Component Parts & Finishes
                      </span>
                    </div>

                    {/* Theme Presets Quick Swatches */}
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                        Quick Base Themes
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {THEMES.map((th) => (
                          <button
                            key={th.id}
                            onClick={() => setColorTheme(th.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-[11px] font-bold transition cursor-pointer ${
                              colorTheme === th.id
                                ? `${th.border} bg-white/10 text-white shadow-xs`
                                : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex -space-x-1 shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.dotColor }} />
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.dotAccent }} />
                            </div>
                            <span className="truncate">{th.label}</span>
                            {colorTheme === th.id && (
                              <Check size={12} className="ml-auto text-orange-400 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Individual Part Pickers */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">
                        Individual Part Swatches
                      </div>
                      {PART_CUSTOMIZERS.map((part) => {
                        const currentVal = customColors[part.key] || part.presetColors[0] || '#18181b';
                        return (
                          <div key={part.key} className="flex items-center gap-2">
                            <div className="w-24 text-[10px] font-bold text-zinc-400 truncate">
                              {part.label}
                            </div>
                            <div className="flex items-center gap-1 flex-grow overflow-x-auto no-scrollbar">
                              {part.presetColors.slice(0, 5).map((hex) => (
                                <button
                                  key={hex}
                                  onClick={() => setCustomColor(part.key, hex)}
                                  className={`w-5 h-5 rounded-md shrink-0 transition cursor-pointer border ${
                                    currentVal.toLowerCase() === hex.toLowerCase()
                                      ? "border-orange-400 ring-1 ring-orange-500/50 scale-110"
                                      : "border-white/10 hover:scale-105"
                                  }`}
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            <input
                              type="color"
                              value={currentVal}
                              onChange={(e) => setCustomColor(part.key, e.target.value)}
                              className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* ─── TAB 2: SAVED SETS FULL GRID GALLERY (BENTO CARDS) ─── */
        <div className="flex-grow p-4 sm:p-8 overflow-y-auto no-scrollbar bg-[#080614] pointer-events-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Grid size={16} className="text-orange-400" />
                  Saved Keyboard Sets & Themes
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage and load your custom crafted keyboard colorways and configurations
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Search presets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white w-full sm:w-48 outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setStudioTab("workspace")}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-orange-500/20"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="bg-[#0f0e1a] border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-3.5 transition-all hover:shadow-xl flex flex-col justify-between group"
                >
                  <MiniKeyboardCard
                    layout={layout}
                    isActive={colorTheme === layout.colorTheme}
                    onClick={() => {
                      loadLayout(layout);
                      setStudioTab("workspace");
                    }}
                    onDelete={
                      layout.id.startsWith("custom_")
                        ? () => deleteLayout(layout.id)
                        : undefined
                    }
                    onRename={(newName) => renameLayout(layout.id, newName)}
                    onDuplicate={() => duplicateLayout(layout)}
                  />

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold">
                      {layout.lightingEffect.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        loadLayout(layout);
                        setStudioTab("workspace");
                      }}
                      className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-orange-500 hover:text-black text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer border border-zinc-800 hover:border-orange-500"
                    >
                      Load Config
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── Main Landing UI Export (Responsive Block Design) ─── */
export default function UI({ scrollContainerRef }: UIProps) {
  const {
    colorTheme,
    soundEnabled,
    showAnnotations,
    zoomLevel,
    showStudio,
  } = useAppStore();

  const scrollProgress = useCustomScroll();

  return (
    <>
      {/* FULL-SCREEN STUDIO PANEL */}
      <StudioPanel />

      {/* CLEAN HEADER (When Studio is closed) */}
      {!showStudio && (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-[#050505]/90 backdrop-blur-xl border-b border-zinc-800/80 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-orange-500 text-lg font-black">⬡</span>
            <h1 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
              Keycraft <span className="text-zinc-500 font-medium text-xs">3D</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Annotations Toggle */}
            <button
              onClick={toggleAnnotations}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                showAnnotations
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                  : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Info size={12} />
              <span className="hidden sm:inline">{showAnnotations ? "Labels ON" : "Labels OFF"}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              title={soundEnabled ? "Mute Acoustics" : "Unmute Acoustics"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Studio Mode Button */}
            <button
              onClick={() => {
                setScrollProgress(0);
                setShowStudio(true);
              }}
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-black font-black text-[11px] uppercase tracking-wider shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Palette size={13} />
              <span>Studio Configurator</span>
            </button>
          </div>
        </header>
      )}

      {/* FLOATING BOTTOM ZOOM & VIEW CONTROLS (When Studio is closed) */}
      {!showStudio && (
        <div className="fixed bottom-4 sm:bottom-6 left-3 sm:left-6 z-40 flex flex-wrap items-center gap-2 pointer-events-auto max-w-[calc(100vw-24px)]">
          <div className="flex items-center bg-[#090812]/95 border border-zinc-800 rounded-xl p-0.5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setZoomLevel(zoomLevel * 1.15)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1.0);
                resetCamera();
              }}
              className="px-2.5 py-1 text-xs font-mono font-bold text-orange-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}% ↺
            </button>
            <button
              onClick={() => setZoomLevel(zoomLevel / 1.15)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090812]/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl">
            <Layers size={13} className="text-orange-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">Explode</span>
            <div className="w-16 sm:w-20">
              <StudioSlider value={Math.round(scrollProgress * 100)} onChange={(v) => setScrollProgress(v / 100)} />
            </div>
            <span className="text-[10px] font-mono text-orange-400 font-bold w-7 text-right">{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      )}
    </>
  );
}
