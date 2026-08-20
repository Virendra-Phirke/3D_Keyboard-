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
    desc: "Deep ocean midnight navy with yellow",
  },
  {
    id: "laser",
    label: "GMK Laser",
    dotColor: "#3b82f6",
    dotMod: "#581c87",
    dotAccent: "#ec4899",
    border: "border-pink-500",
    desc: "Cyber cobalt blue with neon magenta",
  },
  {
    id: "dracula",
    label: "Dracula Gothic",
    dotColor: "#f8fafc",
    dotMod: "#1e1e2e",
    dotAccent: "#bd93f9",
    border: "border-purple-400",
    desc: "Gotham dark slate with vampire lilac",
  },
  {
    id: "retro",
    label: "Retro 1984",
    dotColor: "#f5f5f4",
    dotMod: "#78716c",
    dotAccent: "#dc2626",
    border: "border-stone-400",
    desc: "IBM Model M beige & industrial red",
  },
  {
    id: "apollo",
    label: "Space Apollo",
    dotColor: "#cbd5e1",
    dotMod: "#1e293b",
    dotAccent: "#f97316",
    border: "border-orange-500",
    desc: "NASA lunar graphite with safety orange",
  },
];

const SWITCH_TYPES: { id: SwitchType; label: string; desc: string }[] = [
  { id: "linear", label: "Linear Red", desc: "Smooth 45g • Silent & Fast" },
  { id: "tactile", label: "Tactile Brown", desc: "Bumpy 55g • Tactile Feedback" },
  { id: "clicky", label: "Clicky Blue", desc: "Crisp 60g • Acoustic Snap" },
];

const LEGEND_COLORS = [
  '#f8fafc', '#ffffff', '#fbbf24', '#f97316', '#ef4444',
  '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#71717a'
];

const PER_KEY_COLORS = [
  '#ff8800', '#f97316', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#0ea5e9',
  '#6366f1', '#d946ef', '#ffffff', '#a1a1aa'
];

const SWITCH_COLOR_PRESETS = [
  {
    id: "tangerine",
    name: "C³ Tangerine",
    stem: "#06b6d4",
    housing: "#ea580c",
    topHousing: "#fb923c",
    spring: "#f59e0b",
    desc: "Vibrant orange casing with teal linear stem",
    accent: "#ea580c",
  },
  {
    id: "oil-king",
    name: "Gateron Oil King",
    stem: "#09090b",
    housing: "#18181b",
    topHousing: "#27272a",
    spring: "#f59e0b",
    desc: "All-black nylon body with gold spring",
    accent: "#18181b",
  },
  {
    id: "holy-panda",
    name: "Holy Panda",
    stem: "#fb923c",
    housing: "#f8fafc",
    topHousing: "#ffffff",
    spring: "#f59e0b",
    desc: "Milky pearl base with salmon tactile stem",
    accent: "#fb923c",
  },
  {
    id: "ink-black",
    name: "Gateron Ink V2",
    stem: "#18181b",
    housing: "#1e1e24",
    topHousing: "#334155",
    spring: "#f59e0b",
    desc: "Smoky translucent casing with black stem",
    accent: "#334155",
  },
  {
    id: "boba-u4t",
    name: "Boba U4T",
    stem: "#eab308",
    housing: "#f1f5f9",
    topHousing: "#ffffff",
    spring: "#f59e0b",
    desc: "Pearl white casing with tactile yellow stem",
    accent: "#eab308",
  },
  {
    id: "cream",
    name: "NovelKeys Cream",
    stem: "#fef3c7",
    housing: "#fef3c7",
    topHousing: "#fffbeb",
    spring: "#d97706",
    desc: "Full POM solid butter-cream aesthetic",
    accent: "#fef3c7",
  },
  {
    id: "aqua-king",
    name: "Aqua King",
    stem: "#38bdf8",
    housing: "#ffffff",
    topHousing: "#f0f9ff",
    spring: "#e2e8f0",
    desc: "Ultra-clear water ice transparency",
    accent: "#38bdf8",
  },
  {
    id: "lavender",
    name: "Durock Lavender",
    stem: "#a855f7",
    housing: "#e9d5ff",
    topHousing: "#f3e8ff",
    spring: "#f59e0b",
    desc: "Pastel lilac housing with violet stem",
    accent: "#a855f7",
  },
  {
    id: "sakura",
    name: "Akko Sakura",
    stem: "#f43f5e",
    housing: "#fce7f3",
    topHousing: "#fdf2f8",
    spring: "#fb7185",
    desc: "Japanese cherry blossom pink with rose stem",
    accent: "#f43f5e",
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

/* ─── Studio Custom Slider ─── */
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
      className="h-5 flex items-center cursor-pointer select-none group relative"
    >
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: accentColor }}
        />
      </div>
      <div
        className="w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform group-hover:scale-125"
        style={{ left: `${value}%`, borderColor: accentColor }}
      />
    </div>
  );
}

/* ─── Mini Keyboard Thumbnail Card ─── */
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
          ? 'border-orange-500 ring-2 ring-orange-500/30 bg-[#161324]'
          : 'border-white/10 hover:border-white/25 bg-[#100e1c] hover:bg-[#151224]'
      }`}
    >
      {/* Mini Keyboard Graphical Preview */}
      <div className="h-16 p-2 flex flex-col justify-between relative overflow-hidden bg-black/40">
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
                className="absolute inset-x-2 top-0.5 bottom-0.5 rounded-full"
                style={{ backgroundColor: layout.customColors.ledColor || '#ff8800' }}
              />
            </div>
            <div
              className="w-2.5 h-1.5 rounded-xs"
              style={{ backgroundColor: layout.customColors.keycapsMod || '#121215' }}
            />
          </div>
        </div>

        {/* Ambient Underglow Light Spill */}
        <div
          className="absolute inset-x-0 bottom-0 h-1 blur-xs opacity-70"
          style={{ backgroundColor: layout.customColors.ledColor || '#ff8800' }}
        />
      </div>

      {/* Info Footer */}
      <div className="px-2.5 py-1.5 flex items-center justify-between bg-[#0d0b17]">
        <div className="truncate flex-grow mr-2">
          {isEditing ? (
            <input 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (editName.trim() && onRename) onRename(editName.trim());
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (editName.trim() && onRename) onRename(editName.trim());
                }
              }}
              autoFocus
              className="w-full bg-white/10 text-[11px] font-bold text-white px-1 py-0.5 rounded outline-none"
            />
          ) : (
            <div className="text-[11px] font-bold text-gray-200 truncate group-hover:text-white" onDoubleClick={() => onRename && setIsEditing(true)}>
              {layout.name}
            </div>
          )}
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">{layout.colorTheme}</div>
        </div>
        {isActive && (
          <span className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-500/40 shrink-0" />
        )}
      </div>

      {/* Hover Actions */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded-md bg-black/60 text-white hover:bg-gray-700 cursor-pointer backdrop-blur-md"
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
            className="p-1 rounded-md bg-red-600/90 text-white hover:bg-red-500 cursor-pointer shadow-md"
            title="Delete preset"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Full-Screen Studio Panel ─── */
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

  const [layoutScroll, setLayoutScroll] = useState(0);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLayouts = savedLayouts.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const maxScroll = Math.max(0, filteredLayouts.length - 4);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
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
        } else {
          setShowStudio(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  if (!showStudio) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col">
      {/* ─── TOP BAR ─── */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-[#2a2640]/70 shrink-0 bg-[#0c0a1a] pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl font-bold">⬡</span>
            <span className="text-sm font-black tracking-wider text-white uppercase hidden sm:inline">
              Keycraft <span className="text-orange-400">Studio</span>
            </span>
          </div>

          {/* Workspace vs Saved Sets Tabs */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setStudioTab("workspace")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 ${
                studioTab === "workspace"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <SlidersHorizontal size={13} />
              Workspace
            </button>
            <button
              onClick={() => setStudioTab("saved")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 ${
                studioTab === "saved"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Grid size={13} />
              Saved Sets ({savedLayouts.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Annotations Toggle */}
          <button
            onClick={toggleAnnotations}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
              showAnnotations
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
            }`}
          >
            <Info size={13} />
            {showAnnotations ? "Labels ON" : "Labels OFF"}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
            }`}
            title={soundEnabled ? "Mute Acoustics" : "Unmute Acoustics"}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Quick theme indicator badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="capitalize font-bold text-orange-400">{colorTheme}</span> Edition
          </div>

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
            className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-black font-black text-xs tracking-wider uppercase rounded-lg transition shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} /> Export Preset
          </button>

          <button
            onClick={() => setShowShortcuts(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Info size={18} />
          </button>

          {/* Close Studio Button */}
          <button
            onClick={() => setShowStudio(false)}
            className="p-1.5 px-2.5 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Close Studio (ESC)"
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="bg-[#0e0c1a] border border-[#2a2640] rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black uppercase tracking-wider">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Undo</span>
                <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs border border-white/20 text-white">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Redo</span>
                <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs border border-white/20 text-white">Ctrl + Shift + Z</kbd>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Save Preset</span>
                <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs border border-white/20 text-white">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Toggle Shortcuts</span>
                <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs border border-white/20 text-white">?</kbd>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-300 pt-2 border-t border-white/10 mt-2">
                <span>Typing</span>
                <span className="text-xs text-gray-400">Keys animate and click!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 1: WORKSPACE VIEW ─── */}
      {studioTab === "workspace" ? (
        <div className="flex-grow flex min-h-0">
          {/* ── LEFT: 3D Keyboard Viewport ── */}
          <div className="flex-grow relative flex flex-col pointer-events-none">
            {/* Floating Top Controls in Viewport */}
            <div className="absolute top-4 left-6 z-10 pointer-events-auto flex items-center gap-2">
              <div className="flex items-center bg-[#0e0c1a] border border-[#2a2640]/70 rounded-xl p-1 shadow-xl">
                <button
                  onClick={() => setZoomLevel(zoomLevel * 1.15)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => setZoomLevel(zoomLevel / 1.15)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1.0);
                    resetCamera();
                  }}
                  className="px-2.5 py-1 text-xs font-mono font-bold text-orange-400 hover:bg-white/10 rounded-lg transition cursor-pointer"
                  title="Reset View"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
              </div>

              <div className="flex items-center bg-[#0e0c1a] border border-[#2a2640]/70 rounded-xl p-1 shadow-xl">
                <button
                  onClick={() => undo()}
                  disabled={!canUndo()}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => redo()}
                  disabled={!canRedo()}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Shift+Z)"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              {/* Explode / Assembly Interactive Slider */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0c1a] border border-[#2a2640]/70 rounded-xl shadow-xl">
                <Layers size={13} className="text-orange-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Explode</span>
                <div className="w-20">
                  <StudioSlider value={Math.round(scrollProgress * 100)} onChange={(v) => setScrollProgress(v / 100)} />
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-bold w-7 text-right">{Math.round(scrollProgress * 100)}%</span>
              </div>

              <button
                onClick={() => setScrollProgress(0)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e0c1a] border border-[#2a2640]/70 text-xs font-bold text-gray-300 hover:text-white hover:border-orange-500/40 transition shadow-xl cursor-pointer"
                title="Reset to fully assembled view"
              >
                <Eye size={12} className="text-orange-400" />
                Assemble View
              </button>
            </div>

            {/* Viewport Center (Transparent - Three.js canvas visible behind) */}
            <div className="flex-grow pointer-events-none" />
          </div>

          {/* ── RIGHT SIDEBAR: Config Controls ── */}
          <div className="allow-internal-scroll w-[350px] shrink-0 border-l border-[#2a2640]/60 overflow-y-auto no-scrollbar bg-[#0c0a1a] flex flex-col pointer-events-auto">
            
            {/* Inspector Tabs */}
            <div className="p-4 pb-0 shrink-0">
              <div className="flex bg-[#13111f] rounded-xl p-1 border border-[#2a2640]/60">
                <button
                  onClick={() => setInspectorTab('basic')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    inspectorTab === 'basic' 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md" 
                    : "text-gray-400 hover:text-white"
                  }`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setInspectorTab('advanced')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    inspectorTab === 'advanced' 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md" 
                    : "text-gray-400 hover:text-white"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-grow">
              {/* If basic, show Presets and Legend. If advanced, show Lighting and per-component Colors */}
              
              {inspectorTab === 'basic' ? (
                <>
                  {/* Basic: Theme Presets */}
                  <div className="bg-[#13111f]/90 border border-[#2a2640]/60 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Palette size={14} className="text-orange-400" />
                        <span className="text-xs font-black text-white tracking-wider uppercase">
                          Theme Presets
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono font-medium">{THEMES.length} Presets</span>
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
                                ? `${th.border} bg-orange-500/10 text-white shadow-md ring-1 ring-orange-500/50`
                                : "border-white/10 bg-black/40 text-gray-400 hover:border-white/25 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[11px] font-bold text-white truncate flex-grow mr-1">{th.label}</span>
                              <div className="flex items-center -space-x-1 shrink-0">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: th.dotColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: th.dotMod }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: th.dotAccent }} />
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-400 line-clamp-1">{th.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Basic: 4. SWITCH PROFILE & COLORWAYS Section */}
                  <div className="bg-[#13111f]/90 border border-[#2a2640]/60 rounded-2xl p-4 shadow-lg space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-orange-400" />
                        <span className="text-xs font-black text-white tracking-wider uppercase">
                          Switch Profile & Sound
                        </span>
                      </div>
                      <span className="text-[10px] text-orange-400 font-mono font-bold uppercase">{switchType}</span>
                    </div>

                    <div className="space-y-1.5">
                      {SWITCH_TYPES.map((sw) => (
                        <button
                          key={sw.id}
                          onClick={() => {
                            setSwitchType(sw.id);
                            playSwitchSound(sw.id);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                            switchType === sw.id
                              ? "border-orange-500 bg-orange-500/15 text-white"
                              : "border-white/10 bg-black/40 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <div>
                            <div className="text-[11px] font-bold text-white">{sw.label}</div>
                            <div className="text-[9px] text-gray-400">{sw.desc}</div>
                          </div>
                          {switchType === sw.id && (
                            <Check size={13} className="text-orange-400" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Switch Colorway Presets */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={11} className="text-orange-400" />
                          Switch Colorways
                        </label>
                        <span className="text-[9px] text-gray-500">1-Click Apply</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
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
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[54px] ${
                                isSelected
                                  ? "border-orange-500 bg-orange-500/15 shadow-xs ring-1 ring-orange-500/50"
                                  : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-0.5">
                                <span className="text-[10.5px] font-bold text-white truncate mr-1">{preset.name}</span>
                                <div className="flex items-center -space-x-1 shrink-0">
                                  <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: preset.housing }} title="Base Housing" />
                                  <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: preset.stem }} title="Stem Slider" />
                                </div>
                              </div>
                              <span className="text-[8.5px] text-gray-400 line-clamp-1 leading-tight">{preset.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Switch Part Color Tuners */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">
                        Custom Switch Parts
                      </div>

                      {/* Stem */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-medium">Stem Slider</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchStem}
                            onChange={(e) => setCustomColor("switchStem", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-gray-300 text-[9px] w-14 text-right">{customColors.switchStem}</span>
                        </div>
                      </div>

                      {/* Housing Base */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-medium">Base Housing</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchHousing}
                            onChange={(e) => setCustomColor("switchHousing", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-gray-300 text-[9px] w-14 text-right">{customColors.switchHousing}</span>
                        </div>
                      </div>

                      {/* Top Shell */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-medium">Top Clear Shell</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchTopHousing}
                            onChange={(e) => setCustomColor("switchTopHousing", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-gray-300 text-[9px] w-14 text-right">{customColors.switchTopHousing}</span>
                        </div>
                      </div>

                      {/* Internal Spring */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-medium">Internal Spring</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColors.switchSpring}
                            onChange={(e) => setCustomColor("switchSpring", e.target.value)}
                            className="w-5 h-5 rounded border border-white/20 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-gray-300 text-[9px] w-14 text-right">{customColors.switchSpring}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Advanced: 1. LEGEND DESIGN Section */}
                  <div className="bg-[#13111f]/90 border border-[#2a2640]/60 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-3.5">
                      <Type size={14} className="text-orange-400" />
                      <span className="text-xs font-black text-white tracking-wider uppercase">
                        Legend Design
                      </span>
                    </div>

                {/* Font Style */}
                <div className="mb-3.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Font Style
                  </label>
                  <div className="flex gap-1.5">
                    {(["modern", "classic", "script"] as FontStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setFontStyle(style)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                          fontStyle === style
                            ? "border-orange-500 bg-orange-500/15 text-orange-400 shadow-xs"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Font Size
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
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

              {/* 2. LIGHTING FX Section */}
              <div className="bg-[#13111f]/90 border border-[#2a2640]/60 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3.5">
                  <Lightbulb size={14} className="text-orange-400" />
                  <span className="text-xs font-black text-white tracking-wider uppercase">
                    Lighting FX
                  </span>
                </div>

                {/* Effect Type */}
                <div className="mb-3.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Effect Type
                  </label>
                  <div className="flex gap-1.5">
                    {(["static", "wave", "breathe"] as LightingEffect[]).map((fx) => (
                      <button
                        key={fx}
                        onClick={() => setLightingEffect(fx)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide capitalize transition cursor-pointer border ${
                          lightingEffect === fx
                            ? "border-orange-500 bg-orange-500/15 text-orange-400"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Speed
                    </label>
                    <span className="text-[10px] font-mono text-orange-400 font-black">
                      {lightingSpeed}%
                    </span>
                  </div>
                  <StudioSlider value={lightingSpeed} onChange={setLightingSpeed} />
                </div>

                {/* Brightness */}
                <div className="mb-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Brightness
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    RGB Glow Swatch
                  </label>
                  <div className="grid grid-cols-8 gap-1.5">
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
                    <span className="text-[10px] font-mono text-gray-300">
                      {customColors.ledColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. COMPONENT COLORS Section */}
              <div className="bg-[#13111f]/90 border border-[#2a2640]/60 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3.5">
                  <Layers size={14} className="text-orange-400" />
                  <span className="text-xs font-black text-white tracking-wider uppercase">
                    Component Colors
                  </span>
                </div>

                {/* Theme Presets */}
                <div className="mb-3.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Base Presets
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setColorTheme(th.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-[11px] font-bold transition cursor-pointer ${
                          colorTheme === th.id
                            ? `${th.border} bg-white/10 text-white shadow-xs`
                            : "border-white/10 bg-black/40 text-gray-400 hover:border-white/30"
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
                <div className="space-y-2">
                  {PART_CUSTOMIZERS.map((part) => (
                    <div key={part.key} className="flex items-center gap-2">
                      <div className="w-24 text-[10px] font-bold text-gray-400 truncate">
                        {part.label}
                      </div>
                      <div className="flex items-center gap-1 flex-grow overflow-x-auto no-scrollbar">
                        {part.presetColors.slice(0, 5).map((hex) => (
                          <button
                            key={hex}
                            onClick={() => setCustomColor(part.key, hex)}
                            className={`w-5 h-5 rounded-md shrink-0 transition cursor-pointer border ${
                              customColors[part.key].toLowerCase() === hex.toLowerCase()
                                ? "border-orange-400 ring-1 ring-orange-500/50 scale-110"
                                : "border-white/10 hover:scale-105"
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
              </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── TAB 2: SAVED SETS FULL GRID GALLERY ─── */
        <div className="flex-grow p-8 overflow-y-auto no-scrollbar bg-[#080614] pointer-events-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Saved Keyboard Sets & Themes
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage and load your personalized custom colorways and layout configurations
                </p>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search presets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-48 outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => setStudioTab("workspace")}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Back to Workspace
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="bg-[#100e1c] border border-white/10 hover:border-orange-500/50 rounded-2xl p-4 transition-all hover:shadow-xl flex flex-col justify-between group"
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

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-400 font-mono font-bold">
                      {layout.lightingEffect.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        loadLayout(layout);
                        setStudioTab("workspace");
                      }}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-orange-500 hover:text-black text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
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

/* ─── Main Landing UI Export ─── */
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
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#050505]/90 border-b border-white/5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="text-orange-500 text-xl font-bold">⬡</span>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              Keycraft <span className="text-gray-500 font-medium text-xs">3D</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Annotations Toggle */}
            <button
              onClick={toggleAnnotations}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                showAnnotations
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
              }`}
            >
              <Info size={13} />
              {showAnnotations ? "Labels ON" : "Labels OFF"}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              title={soundEnabled ? "Mute Acoustics" : "Unmute Acoustics"}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Studio Mode Button */}
            <button
              onClick={() => {
                setScrollProgress(0);
                setShowStudio(true);
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Palette size={14} />
              Studio Configurator
            </button>
          </div>
        </header>
      )}

      {/* FLOATING BOTTOM LEFT ZOOM & VIEW CONTROLS (When Studio is closed) */}
      {!showStudio && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center bg-[#0a0a0d] border border-white/10 rounded-xl p-1 shadow-2xl">
            <button
              onClick={() => setZoomLevel(zoomLevel * 1.15)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1.0);
                resetCamera();
              }}
              className="px-3 py-1 text-xs font-mono font-bold text-orange-400 hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}% ↺
            </button>
            <button
              onClick={() => setZoomLevel(zoomLevel / 1.15)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0d] border border-white/10 rounded-xl shadow-2xl">
            <Layers size={13} className="text-orange-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Explode</span>
            <div className="w-20">
              <StudioSlider value={Math.round(scrollProgress * 100)} onChange={(v) => setScrollProgress(v / 100)} />
            </div>
            <span className="text-[10px] font-mono text-orange-400 font-bold w-7 text-right">{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      )}
    </>
  );
}
