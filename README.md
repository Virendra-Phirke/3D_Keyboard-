# ⌨️ KeyCraft 3D — Next-Gen Interactive Mechanical Keyboard Experience

An interactive 3D web experience showcasing a custom 75% mechanical keyboard with progressive scroll disassembly, real-time Web Audio switch acoustics, 360° mouse inspection, and a live studio customizer.

---

### 11. 12 Iconic Theme Presets & UI Inspector Polish
- **12 Curated Mechanical Keyboard Themes**:
  1. 🔥 **Ember Dark**: Burnt copper & industrial amber glow with anodized dark shell.
  2. ❄️ **Arctic Frost**: Frost white & oceanic cyan accents.
  3. 🌿 **GMK Botanical**: Forest sage green alphas with deep moss dark green mods and succulent mint accents.
  4. 🌸 **GMK Olivia**: Rose gold and soft blush pink keycaps with rose gold CNC chamfer.
  5. 🌆 **Synthwave 80s**: Cyberpunk neon violet, vibrant cyan, and laser magenta.
  6. 🖤 **Stealth Black**: Matte black with industrial brass gold accents.
  7. ☕ **GMK Café**: Warm dark espresso with creamy caramel latte alphas.
  8. 🌊 **GMK Nautilus**: Deep ocean midnight navy with hazardous oceanic cyan & yellow.
  9. ⚡ **GMK Laser**: Cyber cobalt blue with neon electric magenta and violet.
  10. 🧛 **Dracula Gothic**: Gotham dark slate with vampire lilac, pink, and toxic lime.
  11. 🕹️ **Retro 1984**: IBM Model M vintage beige alphas with industrial carmine red.
  12. 🚀 **Space Apollo**: NASA lunar graphite with aerospace safety orange.
- **UI & Layout Polish**:
  - **Tri-Color Swatch Circles**: Each theme card now displays a coordinated 3-color cluster showing Alphas + Modifiers + Accent colors at a glance.
  - **Refined Switch Colorways Cards**: Solved text-clipping issues with comfortable 54px min-height cards, high-contrast labels, and dual-dot indicator badges.
  - **Active State Highlights**: Selected themes and switches feature sleek orange rings, subtle glow backgrounds, and instant 3D model synchronization.

### 15. Elimination of Mid-Scroll Bouncing & Frame-Spike Jitter
- **Root-Cause Analysis & Fix**:
  - Previously, when scroll passed 30-50%, `setScrollProgress` triggered global `notify()` upon crossing discrete stage thresholds (14%, 28%, 42%, 56%, 70%), forcing a heavy React tree re-render in mid-scroll which dropped frames and caused `useFrame` delta spikes.
  - Additionally, a nested 2nd-order spring loop in `App.tsx` and a secondary dampener in `KeyboardModel.tsx` had conflicting resonant frequencies, producing a rubber-band overshoot/bounce.
- **Monotonic 1st-Order Critical Damping**:
  - Replaced the spring momentum loop with a **critically damped 1st-order exponential filter** (`current += (target - current) * 0.135`). Mathematically, this trajectory is strictly monotonic with **0 oscillation and 0 recoil**.
- **Direct 3D Frame Sampling**:
  - `KeyboardModel.tsx` now directly samples the smoothly filtered `getScrollProgress()`, removing the secondary lagging dampener and ensuring all 7 layers move in pure mathematical lockstep.

## Verification
- Clean build verified via `npm run build` (0 TypeScript errors).
- Model and layer separation transition smoothly across 0% to 100% with zero recoil, zero bouncing, and zero frame-rate hitching.
- Pushed to GitHub main (`48f1940`).

---

## ✨ Features

- **🎮 Full 3D Mouse & Touch Interaction**:
  - **Click & Drag (Left Click)**: Free 360-degree orbital rotation and angle inspection.
  - **Right Click & Drag**: Smooth camera panning across the viewport.
  - **Interactive Zoom Controls**: Floating zoom toolbar with `Zoom In (+)`, `Zoom Out (-)`, and `100% Reset`.
- **⚡ 7-Layer Exploded Disassembly on Scroll**:
  - **01. PBT Doubleshot Keycaps**: Cherry profile, laser-etched legends, and concave dish texture.
  - **02. Custom Mechanical Switches**: Clear housings, colored stems, internal coiled springs, and gold contact pins.
  - **03. Laser-Cut Switch Plate**: Brushed 6063 aircraft alloy with square cutouts and gasket silicone tabs.
  - **04. Hot-Swap RGB PCB**: ENIG gold solder pads, Kailh sockets, MCU controller, and SMD LEDs.
  - **05. Poron & Silicone Internals**: Multi-stage acoustic dampening foam.
  - **06. CNC Aluminum Case**: Sandblasted anodized chassis with inset polished golden brass weight.
  - **07. Floating Hardware**: Precision CNC standoffs and golden M2 screws.
- **🏷️ Interactive 3D Layer Annotations**:
  - Real-time floating HTML callout badges with pulse status indicators and detailed engineering specs.
  - Dedicated **`LABELS ON / OFF`** toggle switch on the sidebar and navigation bar.
- **🔊 Real-Time Switch Acoustic Engine (Web Audio API)**:
  - Procedural sound synthesis engine simulating authentic typing sounds:
    - **Linear 45g**: Deep, thocky pop acoustics with sound dampening.
    - **Clicky Blue 55g**: Crisp high-frequency tactile click with metallic bottom-out.
    - **Silent Linear 40g**: Muffled soft-strike dampening.
  - Real-time keypress support: press any key on your physical keyboard to hear live keystroke audio.
- **🎨 Live Studio Customizer**:
  - **Colorways**: Ember Orange, Arctic Ice, Synthwave Neon, and Stealth Obsidian.
  - **RGB Lighting Modes**: Amber Warm, Rainbow Flow, Breathing Glow, Pulse Wave, and Lights Off.
  - **Switch Profiles**: Instant switch swapping with acoustic feedback.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **React 3D Ecosystem**: [@react-three/fiber](https://r3f.docs.pmnd.rs/) & [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Native HTML5 Web Audio API
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `bun` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Virendra-Phirke/3D_Keyboard-.git
   cd 3D_Keyboard-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🕹️ Controls Guide

| Action | Control |
| :--- | :--- |
| **Rotate Keyboard** | Left Click + Drag anywhere on the 3D canvas |
| **Pan Camera** | Right Click + Drag (or two-finger touch drag) |
| **Disassemble Layers** | Scroll Mouse Wheel / Touchpad Swipe / Sidebar Clicks |
| **Zoom In / Out** | Click `+` or `-` on the bottom-left zoom toolbar |
| **Reset Zoom** | Click percentage badge on the zoom toolbar |
| **Toggle Annotations** | Click `LABELS ON / OFF` in the top navbar or sidebar |
| **Type & Play Audio** | Press any physical key on your keyboard |
| **Customize Theme & RGB** | Click `STUDIO` button in the navbar |

---

## 📄 License

This project is licensed under the [Apache-2.0 License](LICENSE).
