import { RoundedBox, Box, Cylinder, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, memo } from "react";
import * as THREE from "three";
import { generateKeyboardLayout, KeyInfo } from "../utils/keyboardLayout";
import {
  getScrollProgress,
  useAppStore,
  setKeyPressed,
  isKeyPressed,
  ColorTheme,
  CustomColors,
  FontStyle
} from "../store";
import { THEME_CONFIGS, getKeycapTexture } from "../utils/keycapTexture";
import { playSwitchSound } from "../utils/audio";

// Pre-allocated static materials to eliminate per-frame garbage collection
const socketMaterial = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.5 });
const kailhSocketMat = new THREE.MeshStandardMaterial({ color: "#27272a", roughness: 0.4 });
const mcuMat = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.2, metalness: 0.85 });
const usbShieldMat = new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.98, roughness: 0.1 });
const rubberFootMat = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 });
const usbPortMat = new THREE.MeshStandardMaterial({ color: "#000000" });
const knobTopMat = new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.35, metalness: 0.85 });
const knobDishMat = new THREE.MeshStandardMaterial({ color: "#09090b", roughness: 0.45, metalness: 0.80 });
const indicatorMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.1, metalness: 0.95, emissive: "#ffffff", emissiveIntensity: 0.3 });
const brassCollarMat = new THREE.MeshStandardMaterial({ color: "#f59e0b", roughness: 0.28, metalness: 0.96 });
const goldTraceStaticMat = new THREE.MeshStandardMaterial({ color: "#fbbf24", metalness: 0.95, roughness: 0.15 });
const pcbStaticMat = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.45 });

const mapLinear = THREE.MathUtils.mapLinear;
const clamp = THREE.MathUtils.clamp;

// Layer annotation data for exploded view
const LAYER_ANNOTATIONS = [
  {
    id: 'keycaps',
    title: '01. PBT DOUBLESHOT KEYCAPS',
    spec: '1.5mm Extra-Thick PBT • Sculpted Cherry Profile • Concave Dish',
    yOffset: 6.0,
    alignRight: false,
  },
  {
    id: 'switches',
    title: '02. CUSTOM MECHANICAL SWITCHES',
    spec: 'Cherry MX / Gateron • 5-Pin Hot-Swap • 45g Actuation',
    yOffset: 4.2,
    alignRight: true,
  },
  {
    id: 'plate',
    title: '03. CNC SWITCH PLATE',
    spec: '1.5mm Anodized Aluminum / Brass • Per-Key Cutouts • Gasket Mount',
    yOffset: 2.48,
    alignRight: false,
  },
  {
    id: 'pcb',
    title: '04. HOT-SWAP PCB & MCU',
    spec: 'Kailh Hot-Swap Sockets • South-Facing RGB • 32-Bit ARM Controller',
    yOffset: 0.98,
    alignRight: true,
  },
  {
    id: 'internals',
    title: '05. ACOUSTIC PORON FOAM',
    spec: 'High-Density Sound Dampening • IXPE Switch Pads • Deep Thock Profile',
    yOffset: -0.58,
    alignRight: false,
  },
  {
    id: 'case',
    title: '06. CNC ALUMINUM CASE',
    spec: '6063 Solid Billet Aluminum • 7° Typing Angle • Beveled Chamfer Edges',
    yOffset: -1.95,
    alignRight: true,
  },
  {
    id: 'hardware',
    title: '07. BRASS WEIGHT & HARDWARE',
    spec: 'Mirror-Polished Pure Brass Weight Bar • Gold Torx Hardware • Silicone Feet',
    yOffset: -3.3,
    alignRight: false,
  },
];

interface KeycapItemProps {
  keyInfo: KeyInfo;
  theme: ColorTheme;
  customColors: CustomColors;
  fontStyle: FontStyle;
  fontSize: number;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

/**
 * Creates a single, seamless, authentic Cherry/OEM profile truncated pyramid keycap.
 * No stepped ledges or chicklet borders - pure sloped mechanical keycap geometry.
 */
const keycapGeometryCache = new Map<string, THREE.BufferGeometry>();

/* ─── SCULPTED CHERRY MX PROFILE MONOLITHIC KEYCAP GEOMETRY ─── */
function createCherryKeycapGeometry(
  widthUnits: number = 1.0,
  depthUnits: number = 1.0,
  height: number = 0.44
): THREE.BufferGeometry {
  const cacheKey = `${widthUnits}_${depthUnits}_${height}`;
  if (keycapGeometryCache.has(cacheKey)) {
    return keycapGeometryCache.get(cacheKey)!;
  }

  // Base dimensions (Cherry standard: 1u = 0.96 x 0.96)
  const unitSize = 0.96;
  const wBottom = widthUnits * unitSize - 0.04;
  const dBottom = depthUnits * unitSize - 0.04;

  // Inward taper angle (~8 degrees on all 4 sides)
  const taper = 0.085;
  const wTop = Math.max(0.35, wBottom - taper * 2);
  const dTop = Math.max(0.35, dBottom - taper * 2);

  const hw0 = wBottom / 2;
  const hd0 = dBottom / 2;
  const hw1 = wTop / 2;
  const hd1 = dTop / 2;

  const positions = new Float32Array([
    // Top face (y = height) - Counter-Clockwise
    -hw1, height,  hd1,
     hw1, height,  hd1,
     hw1, height, -hd1,
    -hw1, height, -hd1,

    // Front face
    -hw0, 0,  hd0,
     hw0, 0,  hd0,
     hw1, height,  hd1,
    -hw1, height,  hd1,

    // Back face
     hw0, 0, -hd0,
    -hw0, 0, -hd0,
    -hw1, height, -hd1,
     hw1, height, -hd1,

    // Left face
    -hw0, 0, -hd0,
    -hw0, 0,  hd0,
    -hw1, height,  hd1,
    -hw1, height, -hd1,

    // Right face
     hw0, 0,  hd0,
     hw0, 0, -hd0,
     hw1, height, -hd1,
     hw1, height,  hd1,
  ]);

  const uvs = new Float32Array([
    // Top face
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Front face
    0, 0,  1, 0,  1, 0.05,  0, 0.05,

    // Back face
    0, 0,  1, 0,  1, 0.05,  0, 0.05,

    // Left face
    0, 0,  1, 0,  1, 0.05,  0, 0.05,

    // Right face
    0, 0,  1, 0,  1, 0.05,  0, 0.05,
  ]);

  const indices = [
    0, 1, 2,  0, 2, 3,        // Top
    4, 5, 6,  4, 6, 7,        // Front
    8, 9, 10, 8, 10, 11,      // Back
    12, 13, 14, 12, 14, 15,   // Left
    16, 17, 18, 16, 18, 19,   // Right
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  keycapGeometryCache.set(cacheKey, geometry);
  return geometry;
}

/* ─── REALISTIC CHERRY PROFILE MECHANICAL KEYCAP ─── */
const KeycapItem = memo(function KeycapItem({
  keyInfo,
  theme,
  customColors,
  fontStyle,
  fontSize,
  onPress,
  onRelease,
}: KeycapItemProps) {
  const keycapRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);

  const texture = useMemo(() => {
    return getKeycapTexture(
      theme,
      keyInfo.label,
      keyInfo.subLabel,
      keyInfo.type,
      false,
      false,
      {
        keycapsAlpha: customColors.keycapsAlpha,
        keycapsMod: customColors.keycapsMod,
        keycapsAccent: customColors.keycapsAccent,
        keycapsText: customColors.keycapsText,
      },
      fontStyle,
      fontSize / 56
    );
  }, [theme, keyInfo.label, keyInfo.subLabel, keyInfo.type, customColors, fontStyle, fontSize]);

  const keycapMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.38,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  }, [texture]);

  // Seamless truncated pyramid mechanical keycap geometry
  const geometry = useMemo(() => {
    return createCherryKeycapGeometry(keyInfo.width, keyInfo.depth, 0.44);
  }, [keyInfo.width, keyInfo.depth]);

  // Cherry sculpt profile row tilts
  const rowTilt = useMemo(() => {
    switch (keyInfo.row) {
      case 0: return 0.08;  // F-row
      case 1: return 0.06;  // Number row
      case 2: return 0.02;  // QWERTY
      case 3: return -0.01; // Home row
      case 4: return -0.05; // Shift row
      case 5: return -0.07; // Bottom row / Space
      default: return 0.0;
    }
  }, [keyInfo.row]);

  useFrame((_, delta) => {
    const isPressed = isKeyPressed(keyInfo.code);
    if (keycapRef.current && (isPressed || Math.abs(currentY.current) > 0.0005)) {
      const targetY = isPressed ? -0.12 : 0;
      currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 28, delta);
      keycapRef.current.position.y = 0.2 + currentY.current;
    }
  });

  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      <group ref={keycapRef} position={[0, 0.2, 0]} rotation={[rowTilt, 0, 0]}>
        {/* Seamless Authentic Mechanical Keycap Mesh */}
        <mesh
          geometry={geometry}
          material={keycapMaterial}
          position={[0, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPress(keyInfo.code);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onRelease(keyInfo.code);
          }}
        />

        {/* Beveled Cylindrical Concave Dish Top */}
        <RoundedBox
          args={[keyInfo.width - 0.18, 0.045, keyInfo.depth - 0.16]}
          radius={0.024}
          smoothness={3}
          material={keycapMaterial}
          position={[0, 0.44, 0]}
        />

        {/* Realistic Underside MX Cross Stem Mount Socket */}
        <group position={[0, 0.08, 0]}>
          {/* Outer Cylindrical Stem Sleeve */}
          <Cylinder
            args={[0.20, 0.20, 0.16, 16]}
            material={socketMaterial}
          />
          {/* Internal MX Cross Female Slotted Ribs */}
          <Box args={[0.04, 0.16, 0.16]} material={socketMaterial} />
          <Box args={[0.16, 0.16, 0.04]} material={socketMaterial} />
          {/* Diagonal Structural Reinforcement Gussets */}
          <Box args={[0.03, 0.12, 0.10]} position={[0.11, 0, 0.11]} rotation={[0, Math.PI / 4, 0]} material={socketMaterial} />
          <Box args={[0.03, 0.12, 0.10]} position={[-0.11, 0, 0.11]} rotation={[0, -Math.PI / 4, 0]} material={socketMaterial} />
          <Box args={[0.03, 0.12, 0.10]} position={[0.11, 0, -0.11]} rotation={[0, -Math.PI / 4, 0]} material={socketMaterial} />
          <Box args={[0.03, 0.12, 0.10]} position={[-0.11, 0, -0.11]} rotation={[0, Math.PI / 4, 0]} material={socketMaterial} />
        </group>
      </group>
    </group>
  );
});

interface SwitchItemProps {
  keyInfo: KeyInfo;
  stemMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  clearMat: THREE.MeshStandardMaterial;
  springMat: THREE.MeshStandardMaterial;
  ledMat: THREE.MeshStandardMaterial;
}

/* ─── REALISTIC CHERRY MX MECHANICAL SWITCH (Matching 3D CAD Image) ─── */
const SwitchItem = memo(function SwitchItem({
  keyInfo,
  stemMat,
  baseMat,
  clearMat,
  springMat,
  ledMat,
}: SwitchItemProps) {
  const stemRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);

  useFrame((_, delta) => {
    const isPressed = isKeyPressed(keyInfo.code);
    if (stemRef.current && (isPressed || Math.abs(currentY.current) > 0.0005)) {
      const targetY = isPressed ? -0.12 : 0;
      currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 28, delta);
      stemRef.current.position.y = 0.38 + currentY.current;
    }
  });

  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      {/* 1. Lower Nylon Housing Base with Plate Flange & Side Snap Latches */}
      <Box args={[0.82, 0.05, 0.82]} position={[0, 0.025, 0]} material={baseMat} />
      <Box args={[0.74, 0.14, 0.74]} position={[0, -0.06, 0]} material={baseMat} />

      {/* Plate-Mount Retention Latch Clips (Left & Right) */}
      <Box args={[0.06, 0.12, 0.22]} position={[0.40, -0.02, 0]} material={baseMat} />
      <Box args={[0.06, 0.12, 0.22]} position={[-0.40, -0.02, 0]} material={baseMat} />

      {/* 4 Corner Latch Tabs that secure the clear top housing */}
      <Box args={[0.05, 0.10, 0.12]} position={[0.39, 0.10, 0.22]} material={baseMat} />
      <Box args={[0.05, 0.10, 0.12]} position={[0.39, 0.10, -0.22]} material={baseMat} />
      <Box args={[0.05, 0.10, 0.12]} position={[-0.39, 0.10, 0.22]} material={baseMat} />
      <Box args={[0.05, 0.10, 0.12]} position={[-0.39, 0.10, -0.22]} material={baseMat} />

      {/* 2. Crystal-Clear Polycarbonate Upper Shell (Stepped Pyramid Dome with Chimney) */}
      {/* Base Perimeter Lip */}
      <Box args={[0.78, 0.05, 0.78]} position={[0, 0.08, 0]} material={clearMat} />
      {/* 4-Side Tapered Pyramid Body */}
      <Box args={[0.68, 0.16, 0.68]} position={[0, 0.18, 0]} material={clearMat} />
      {/* Top Chimney Opening Collar with Embossed Rim */}
      <Box args={[0.48, 0.08, 0.48]} position={[0, 0.29, 0]} material={clearMat} />
      {/* Four Corner Chamfer Struts */}
      <Box args={[0.10, 0.22, 0.10]} position={[0.29, 0.16, 0.29]} material={clearMat} />
      <Box args={[0.10, 0.22, 0.10]} position={[-0.29, 0.16, 0.29]} material={clearMat} />
      <Box args={[0.10, 0.22, 0.10]} position={[0.29, 0.16, -0.29]} material={clearMat} />
      <Box args={[0.10, 0.22, 0.10]} position={[-0.29, 0.16, -0.29]} material={clearMat} />

      {/* Front South-Facing Arched LED Window Lens */}
      <Box args={[0.22, 0.09, 0.12]} position={[0, 0.11, 0.32]} material={clearMat} />

      {/* 3. Internal Coiled Spring & Copper Contact Leaves (Visible through clear housing) */}
      <Cylinder args={[0.09, 0.09, 0.26, 16]} position={[0, 0.18, 0]} material={springMat} />
      {/* Leaf Contacts inside rear chamber */}
      <Box args={[0.03, 0.18, 0.16]} position={[-0.16, 0.18, -0.10]} material={springMat} />
      <Box args={[0.03, 0.16, 0.12]} position={[0.16, 0.18, -0.10]} material={springMat} />

      {/* 4. South-Facing SMD RGB/Amber LED Bead */}
      <Box args={[0.16, 0.05, 0.08]} position={[0, 0.08, 0.30]} material={ledMat} />

      {/* 5. Precision MX Cross Stem Slider with Shoulder Platform & Guide Rails */}
      <group ref={stemRef} position={[0, 0.38, 0]}>
        {/* Rectangular Stem Shoulder Platform (Sits inside the chimney) */}
        <Box args={[0.36, 0.06, 0.36]} position={[0, -0.02, 0]} material={stemMat} />
        {/* Center Slider Guide Post */}
        <Box args={[0.24, 0.28, 0.24]} position={[0, 0.10, 0]} material={stemMat} />
        {/* Authentic Cherry MX Cross Mount (+) */}
        <Box args={[0.08, 0.28, 0.28]} position={[0, 0.18, 0]} material={stemMat} />
        <Box args={[0.28, 0.28, 0.08]} position={[0, 0.18, 0]} material={stemMat} />
        {/* Left & Right Vertical Guide Wings */}
        <Box args={[0.06, 0.22, 0.10]} position={[0.20, 0.02, 0]} material={stemMat} />
        <Box args={[0.06, 0.22, 0.10]} position={[-0.20, 0.02, 0]} material={stemMat} />
      </group>

      {/* 6. Underside 5-Pin PCB Guide Post & Metal Contact Pins */}
      <Cylinder args={[0.09, 0.09, 0.18, 12]} position={[0, -0.14, 0]} material={baseMat} />
      <Cylinder args={[0.04, 0.04, 0.16, 8]} position={[-0.24, -0.13, 0]} material={baseMat} />
      <Cylinder args={[0.04, 0.04, 0.16, 8]} position={[0.24, -0.13, 0]} material={baseMat} />
      <Box args={[0.03, 0.20, 0.03]} position={[-0.16, -0.14, 0.14]} material={springMat} />
      <Box args={[0.03, 0.20, 0.03]} position={[0.16, -0.14, -0.14]} material={springMat} />
    </group>
  );
});

/* ─── REALISTIC PLATE-MOUNTED STAINLESS STEEL STABILIZER (Matching Image 2) ─── */
function StabilizerAssembly({
  x,
  z,
  width,
  stemMat,
  baseMat,
  wireMat
}: {
  x: number;
  z: number;
  width: number;
  stemMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  wireMat: THREE.MeshStandardMaterial;
}) {
  const halfSpan = width >= 6.0 ? 2.38 : (width * 1.05 - 0.7) / 2;

  return (
    <group position={[x, 0, z]}>
      {/* Left Stabilizer Housing & MX Stem */}
      <group position={[-halfSpan, 0, 0]}>
        <Box args={[0.36, 0.32, 0.42]} position={[0, 0.16, 0]} material={baseMat} />
        {/* Stabilizer Cross Stem */}
        <Box args={[0.08, 0.24, 0.24]} position={[0, 0.32, 0]} material={stemMat} />
        <Box args={[0.24, 0.24, 0.08]} position={[0, 0.32, 0]} material={stemMat} />
      </group>

      {/* Right Stabilizer Housing & MX Stem */}
      <group position={[halfSpan, 0, 0]}>
        <Box args={[0.36, 0.32, 0.42]} position={[0, 0.16, 0]} material={baseMat} />
        {/* Stabilizer Cross Stem */}
        <Box args={[0.08, 0.24, 0.24]} position={[0, 0.32, 0]} material={stemMat} />
        <Box args={[0.24, 0.24, 0.08]} position={[0, 0.32, 0]} material={stemMat} />
      </group>

      {/* Linking Stabilizer Wire */}
      <Box args={[halfSpan * 2, 0.05, 0.05]} position={[0, 0.06, -0.16]} material={wireMat} />
      <Box args={[0.05, 0.14, 0.05]} position={[-halfSpan, 0.12, -0.16]} material={wireMat} />
      <Box args={[0.05, 0.14, 0.05]} position={[halfSpan, 0.12, -0.16]} material={wireMat} />
    </group>
  );
}

/* ─── LAYER 1: ROTATING CNC ANODIZED KNOB CAP ─── */
function RotaryKnobCap({
  x,
  z,
  color,
  chamferMat,
  ledMat,
}: {
  x: number;
  z: number;
  color: string;
  chamferMat: THREE.MeshStandardMaterial;
  ledMat: THREE.MeshStandardMaterial;
}) {
  const targetRotation = useRef(0.45);
  const knobGroupRef = useRef<THREE.Group>(null);

  const knobCoreMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color || '#6b7280',
      roughness: 0.22,
      metalness: 0.92,
    });
  }, [color]);

  const gripRibMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color || '#6b7280',
      roughness: 0.35,
      metalness: 0.88,
    });
  }, [color]);

  // 18 precision CNC milled vertical grip flutes around perimeter
  const gripFlutes = useMemo(() => {
    const ribs = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.535;
      ribs.push({
        id: i,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        rotY: -angle,
      });
    }
    return ribs;
  }, []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    targetRotation.current += Math.PI / 3;
  };

  useFrame((_, delta) => {
    if (knobGroupRef.current) {
      knobGroupRef.current.rotation.y = THREE.MathUtils.damp(
        knobGroupRef.current.rotation.y,
        targetRotation.current,
        14,
        Math.min(delta, 0.05)
      );
    }
  });

  return (
    <group position={[x, 0.38, z]}>
      <group ref={knobGroupRef} onClick={handleClick}>
        {/* 1. Translucent LED Halo Base (Underglow) */}
        <Cylinder args={[0.56, 0.56, 0.06, 36]} position={[0, -0.16, 0]} material={ledMat} />

        {/* 2. Lower Beveled Mirror Chamfer Ring */}
        <Cylinder args={[0.57, 0.54, 0.08, 36]} position={[0, -0.12, 0]} material={chamferMat} />

        {/* 3. Main Anodized Metal Barrel Core */}
        <Cylinder args={[0.525, 0.525, 0.44, 36]} position={[0, 0.08, 0]} material={knobCoreMat} />

        {/* 4. 18 Precision CNC Knurled Flute Grips */}
        {gripFlutes.map((rib) => (
          <Box
            key={rib.id}
            args={[0.032, 0.36, 0.045]}
            position={[rib.x, 0.08, rib.z]}
            rotation={[0, rib.rotY, 0]}
            material={gripRibMat}
          />
        ))}

        {/* 5. Upper Step & Beveled Lip */}
        <Cylinder args={[0.50, 0.53, 0.06, 36]} position={[0, 0.26, 0]} material={chamferMat} />

        {/* 6. Concentric Stepped Top Face Ring */}
        <Cylinder args={[0.47, 0.47, 0.04, 36]} position={[0, 0.28, 0]} material={knobCoreMat} />

        {/* 7. Ergonomic Sunken Thumb Concave Dish */}
        <Cylinder args={[0.38, 0.32, 0.05, 36]} position={[0, 0.29, 0]} material={knobDishMat} />

        {/* 8. Center Brass Pivot Accent */}
        <Cylinder args={[0.09, 0.09, 0.02, 24]} position={[0, 0.30, 0]} material={brassCollarMat} />

        {/* 9. Machined Indicator Dot / Position Notch */}
        <Box args={[0.04, 0.03, 0.14]} position={[0, 0.30, -0.32]} material={indicatorMat} />
        <Cylinder args={[0.035, 0.035, 0.03, 16]} position={[0, 0.30, -0.41]} material={indicatorMat} />

        {/* 10. Underside D-Shaft Female Socket Tube */}
        <Cylinder args={[0.18, 0.18, 0.24, 24]} position={[0, -0.06, 0]} material={kailhSocketMat} />
      </group>
    </group>
  );
}

/* ─── LAYER 3: ALPS ENCODER PLATE COLLAR & D-SHAFT ─── */
function EncoderPlateMount({
  x,
  z,
  chamferMat,
}: {
  x: number;
  z: number;
  chamferMat: THREE.MeshStandardMaterial;
}) {
  return (
    <group position={[x, 0, z]}>
      {/* Plate Retaining Bezel Ring */}
      <Cylinder args={[0.54, 0.54, 0.08, 36]} position={[0, 0.04, 0]} material={chamferMat} />
      {/* Brass Hexagonal Locking Nut */}
      <Cylinder args={[0.34, 0.34, 0.12, 6]} position={[0, 0.14, 0]} material={brassCollarMat} />
      {/* Threaded Brass Bushing Sleeve */}
      <Cylinder args={[0.24, 0.24, 0.28, 24]} position={[0, 0.28, 0]} material={brassCollarMat} />
      {/* Stainless Steel D-Profile Rotating Shaft Standing Up */}
      <group position={[0, 0.44, 0]}>
        <Cylinder args={[0.15, 0.15, 0.42, 24]} material={chamferMat} />
        <Box args={[0.06, 0.42, 0.28]} position={[0.13, 0, 0]} material={chamferMat} />
      </group>
    </group>
  );
}

/* ─── LAYER 4: ALPS EC11 SOLDERED PCB MODULE ─── */
function AlpsEncoderPcbModule({
  x,
  z,
  ledMat,
}: {
  x: number;
  z: number;
  ledMat: THREE.MeshStandardMaterial;
}) {
  return (
    <group position={[x, 0.032, z]}>
      {/* Gold Solder Landing Traces on PCB */}
      <Box args={[0.78, 0.012, 0.78]} material={goldTraceStaticMat} />
      <Box args={[0.68, 0.016, 0.68]} material={pcbStaticMat} />

      {/* South-Facing SMD RGB LED for Halo */}
      <Box args={[0.22, 0.04, 0.16]} position={[0, 0.02, -0.26]} material={ledMat} />

      {/* ALPS EC11 Metal Shielded Enclosure Box */}
      <Box args={[0.62, 0.32, 0.62]} position={[0, 0.16, 0]} material={kailhSocketMat} />
      {/* Metal Embossed Top Cover Plate */}
      <Box args={[0.60, 0.04, 0.60]} position={[0, 0.33, 0]} material={usbShieldMat} />

      {/* Grounding Wing Solder Tabs (Left & Right) */}
      <Box args={[0.08, 0.28, 0.18]} position={[-0.34, 0.08, 0]} material={usbShieldMat} />
      <Box args={[0.08, 0.28, 0.18]} position={[0.34, 0.08, 0]} material={usbShieldMat} />

      {/* 3 Pulse Channel Solder Pins (Top: A, COM, B) */}
      {[-0.20, 0, 0.20].map((px) => (
        <group key={`pin-pulse-${px}`} position={[px, -0.06, 0.34]}>
          <Cylinder args={[0.03, 0.03, 0.16, 12]} material={usbShieldMat} />
          <Cylinder args={[0.06, 0.06, 0.02, 12]} position={[0, 0.07, 0]} material={goldTraceStaticMat} />
        </group>
      ))}

      {/* 2 Push-Switch Contact Solder Pins (Bottom) */}
      {[-0.18, 0.18].map((px) => (
        <group key={`pin-sw-${px}`} position={[px, -0.06, -0.34]}>
          <Cylinder args={[0.03, 0.03, 0.16, 12]} material={usbShieldMat} />
          <Cylinder args={[0.06, 0.06, 0.02, 12]} position={[0, 0.07, 0]} material={goldTraceStaticMat} />
        </group>
      ))}
    </group>
  );
}

export function KeyboardModel() {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel, customColors, fontStyle, fontSize } = useAppStore();

  const { keys, knob } = useMemo(() => generateKeyboardLayout(), []);

  // Animation groups
  const mainGroup = useRef<THREE.Group>(null);
  const keycapsGroup = useRef<THREE.Group>(null);
  const switchesGroup = useRef<THREE.Group>(null);
  const plateGroup = useRef<THREE.Group>(null);
  const pcbGroup = useRef<THREE.Group>(null);
  const internalsGroup = useRef<THREE.Group>(null);
  const caseGroup = useRef<THREE.Group>(null);
  const hardwareGroup = useRef<THREE.Group>(null);
  const annotationsGroup = useRef<HTMLDivElement>(null);

  const smoothedScroll = useRef(0);
  const smoothedZoom = useRef(1.0);

  // RGB Light Refs
  const amberBacklight = useRef<THREE.PointLight>(null);
  const underglowLight = useRef<THREE.PointLight>(null);

  const handleKeyPress = (code: string) => {
    setKeyPressed(code, true);
    if (soundEnabled) {
      playSwitchSound(switchType);
    }
  };

  const handleKeyRelease = (code: string) => {
    setKeyPressed(code, false);
  };

  // Keyboard dimensions (75% exact proportions)
  const totalWidth = 16.8;
  const totalDepth = 6.4;

  // DYNAMIC CUSTOMIZABLE MATERIALS
  const caseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.caseColor || '#141418',
      roughness: 0.28,
      metalness: 0.88,
    });
  }, [customColors.caseColor]);

  const goldChamferMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.18,
      metalness: 0.96,
    });
  }, []);

  const plateMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.plate || '#1e1e24',
      roughness: 0.25,
      metalness: 0.90,
    });
  }, [customColors.plate]);

  const pcbMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.pcb || '#0d0d10',
      roughness: 0.65,
      metalness: 0.30,
    });
  }, [customColors.pcb]);

  const goldTraceMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#fbbf24",
      roughness: 0.15,
      metalness: 0.98,
    });
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.weightBar || '#f59e0b',
      roughness: 0.15,
      metalness: 0.98,
    });
  }, [customColors.weightBar]);

  const rgbLedMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.ledColor || '#ff8800',
      emissive: customColors.ledColor || '#ff8800',
      emissiveIntensity: rgbMode === "off" ? 0.2 : 3.8,
      roughness: 0.2,
    });
  }, [rgbMode, customColors.ledColor]);

  const foamMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#1e293b",
      roughness: 0.95,
      metalness: 0.05,
    });
  }, []);

  const switchStemMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.switchStem || '#ff7700',
      roughness: 0.25,
      metalness: 0.08
    });
  }, [customColors.switchStem]);

  const switchBaseMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.switchHousing || "#18181b",
      roughness: 0.55,
      metalness: 0.25
    });
  }, [customColors.switchHousing]);

  const switchClearMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.switchTopHousing || "#cbd5e1",
      roughness: 0.15,
      metalness: 0.10,
      transparent: true,
      opacity: 0.72
    });
  }, [customColors.switchTopHousing]);

  const switchSpringMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.switchSpring || "#f59e0b",
      metalness: 0.98,
      roughness: 0.15
    });
  }, [customColors.switchSpring]);

  const stabHousingMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.stabilizerHousing || "#18181b",
      roughness: 0.45,
      metalness: 0.20
    });
  }, [customColors.stabilizerHousing]);

  const stabStemMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.stabilizerStem || customColors.switchStem || "#ff7700",
      roughness: 0.25,
      metalness: 0.08
    });
  }, [customColors.stabilizerStem, customColors.switchStem]);

  const stabWireMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: customColors.stabilizerWire || "#f59e0b",
      metalness: 0.98,
      roughness: 0.12
    });
  }, [customColors.stabilizerWire]);

  const screwPositions = useMemo(() => {
    const positions: [number, number][] = [];
    const xStep = totalWidth / 6;
    for (let x = -totalWidth / 2 + 1; x <= totalWidth / 2 - 1; x += xStep) {
      positions.push([x, totalDepth / 2 - 0.4]);
      positions.push([x, -totalDepth / 2 + 0.4]);
    }
    return positions;
  }, [totalWidth, totalDepth]);

  // Only Spacebar has the 2 stabilizer housings & linking stainless steel wire
  const spacebarKey = useMemo(() => {
    return keys.find(k => k.type === 'space' || k.code === 'Space' || k.width >= 5.0);
  }, [keys]);

  // Render loop with smooth easing
  useFrame(({ clock }, delta) => {
    const scrollOffset = getScrollProgress();
    const clampedDelta = Math.min(delta, 0.05);
    smoothedZoom.current = THREE.MathUtils.damp(smoothedZoom.current, zoomLevel, 14, clampedDelta);
    const time = clock.getElapsedTime();

    const getProgress = (start: number, end: number) => {
      return clamp(mapLinear(scrollOffset, start, end, 0, 1), 0, 1);
    };

    // Quintic Hermite SmootherStep (C² continuity: 0 velocity & 0 acceleration at transition bounds)
    const smootherStep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

    // 1. Position, Orientation & Interactive Zoom Scaling
    if (mainGroup.current) {
      const explodeProgress = getProgress(0.04, 0.96);
      const easeExplode = smootherStep(explodeProgress);

      mainGroup.current.position.set(0, mapLinear(easeExplode, 0, 1, 0, 0.1), 0);

      const currentScale = 0.48 * smoothedZoom.current;
      mainGroup.current.scale.set(currentScale, currentScale, currentScale);

      const rotX = mapLinear(easeExplode, 0, 1, 0.52, 0.42);
      const rotY = mapLinear(easeExplode, 0, 1, -0.32, 0.22);
      const rotZ = mapLinear(easeExplode, 0, 1, 0.08, -0.04);

      mainGroup.current.rotation.x = rotX;
      mainGroup.current.rotation.y = rotY;
      mainGroup.current.rotation.z = rotZ;
    }

    // Direct DOM Opacity update
    const annotationsVisibility = showAnnotations ? getProgress(0.65, 0.88) : 0;
    if (annotationsGroup.current) {
      annotationsGroup.current.style.opacity = `${annotationsVisibility}`;
      annotationsGroup.current.style.display = annotationsVisibility > 0.01 ? 'block' : 'none';
    }

    // 2. LAYER EXPLOSIONS WITH CONTINUOUS QUINTIC SMOOTHERSTEP EASING
    const keycapsProgress = getProgress(0.04, 0.38);
    if (keycapsGroup.current) {
      const ease = smootherStep(keycapsProgress);
      keycapsGroup.current.position.y = ease * 6.0;
    }

    const switchesProgress = getProgress(0.16, 0.50);
    if (switchesGroup.current) {
      const ease = smootherStep(switchesProgress);
      switchesGroup.current.position.y = -0.2 + ease * 4.2;
    }

    const plateProgress = getProgress(0.28, 0.62);
    if (plateGroup.current) {
      const ease = smootherStep(plateProgress);
      plateGroup.current.position.y = -0.28 + ease * 2.48;
    }

    const pcbProgress = getProgress(0.40, 0.74);
    if (pcbGroup.current) {
      const ease = smootherStep(pcbProgress);
      pcbGroup.current.position.y = -0.48 + ease * 0.98;
    }

    const internalsProgress = getProgress(0.52, 0.82);
    if (internalsGroup.current) {
      const ease = smootherStep(internalsProgress);
      internalsGroup.current.position.y = -0.62 - ease * 0.58;
    }

    const caseProgress = getProgress(0.62, 0.90);
    if (caseGroup.current) {
      const ease = smootherStep(caseProgress);
      caseGroup.current.position.y = -0.85 - ease * 1.95;
    }

    const hardwareProgress = getProgress(0.70, 0.98);
    if (hardwareGroup.current) {
      const ease = smootherStep(hardwareProgress);
      hardwareGroup.current.position.y = -1.2 - ease * 3.3;
    }

    // 3. Dynamic Backlight Glow with custom LED color
    if (amberBacklight.current && underglowLight.current) {
      if (rgbMode === "off") {
        amberBacklight.current.intensity = 0.5;
        underglowLight.current.intensity = 0.5;
        amberBacklight.current.color.set(customColors.ledColor || '#ff8800');
        underglowLight.current.color.set(customColors.ledColor || '#ff8800');
      } else if (rgbMode === "rainbow") {
        const hue = (time * 0.25) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.55);
        amberBacklight.current.color = color;
        underglowLight.current.color = color;
        amberBacklight.current.intensity = 3.5;
        underglowLight.current.intensity = 3.5;
      } else if (rgbMode === "breathe") {
        const intensity = (Math.sin(time * 2.5) * 0.5 + 0.5) * 4.0 + 0.8;
        amberBacklight.current.color.set(customColors.ledColor || '#ff8800');
        underglowLight.current.color.set(customColors.ledColor || '#ff8800');
        amberBacklight.current.intensity = intensity;
        underglowLight.current.intensity = intensity;
      } else {
        amberBacklight.current.color.set(customColors.ledColor || '#ff8800');
        underglowLight.current.color.set(customColors.ledColor || '#ff8800');
        amberBacklight.current.intensity = 4.2;
        underglowLight.current.intensity = 3.6;
      }
    }
  });

  return (
    <group ref={mainGroup} scale={[0.48, 0.48, 0.48]} position={[0, 0, 0]}>
      {/* 1. LAYER 1: SCULPTED CHERRY KEYCAPS & CNC ROTARY KNOB */}
      <group ref={keycapsGroup} position={[0, 0, 0]}>
        {keys.map((key) => (
          <KeycapItem
            key={`key-${key.id}`}
            keyInfo={key}
            theme={colorTheme}
            customColors={customColors}
            fontStyle={fontStyle}
            fontSize={fontSize}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
        ))}

        {/* 1. Real CNC Machined Rotary Encoder Knob Cap */}
        <RotaryKnobCap
          x={knob.x}
          z={knob.z}
          color={customColors.knobColor}
          chamferMat={goldChamferMaterial}
          ledMat={rgbLedMaterial}
        />
      </group>

      {/* 2. LAYER 2: GATERON/CHERRY MX SWITCHES ARRAY & STABILIZERS */}
      <group ref={switchesGroup} position={[0, -0.2, 0]}>
        {keys.map((key) => (
          <SwitchItem
            key={`switch-${key.id}`}
            keyInfo={key}
            stemMat={switchStemMat}
            baseMat={switchBaseMat}
            clearMat={switchClearMat}
            springMat={switchSpringMat}
            ledMat={rgbLedMaterial}
          />
        ))}

        {/* Real Plate-Mounted Stainless Steel Stabilizer (Only 2 on Spacebar) */}
        {spacebarKey && (
          <StabilizerAssembly
            x={spacebarKey.x}
            z={spacebarKey.z}
            width={spacebarKey.width}
            stemMat={stabStemMat}
            baseMat={stabHousingMat}
            wireMat={stabWireMat}
          />
        )}
      </group>

      {/* 3. LAYER 3: LASER-CUT CNC SWITCH PLATE */}
      <group ref={plateGroup} position={[0, -0.28, 0]}>
        <Box args={[totalWidth, 0.09, 0.25]} position={[0, 0, totalDepth / 2 - 0.125]} material={plateMaterial} />
        <Box args={[totalWidth, 0.09, 0.25]} position={[0, 0, -totalDepth / 2 + 0.125]} material={plateMaterial} />
        <Box args={[0.25, 0.09, totalDepth]} position={[totalWidth / 2 - 0.125, 0, 0]} material={plateMaterial} />
        <Box args={[0.25, 0.09, totalDepth]} position={[-totalWidth / 2 + 0.125, 0, 0]} material={plateMaterial} />

        {/* Encoder Plate Retaining Bezel Ring & D-Shaft */}
        <EncoderPlateMount
          x={knob.x}
          z={knob.z}
          chamferMat={goldChamferMaterial}
        />

        {keys.map((k) => (
          <group key={`plate-hole-${k.id}`} position={[k.x, 0, k.z]}>
            <Box args={[k.width + 0.02, 0.08, 0.08]} position={[0, 0, 0.44]} material={plateMaterial} />
            <Box args={[k.width + 0.02, 0.08, 0.08]} position={[0, 0, -0.44]} material={plateMaterial} />
            <Box args={[0.08, 0.08, 0.82]} position={[k.width / 2 + 0.01, 0, 0]} material={plateMaterial} />
            <Box args={[0.08, 0.08, 0.82]} position={[-k.width / 2 - 0.01, 0, 0]} material={plateMaterial} />
          </group>
        ))}

        {[-totalWidth / 2 + 2, -totalWidth / 4, 0, totalWidth / 4, totalWidth / 2 - 2].map((x, idx) => (
          <group key={`gasket-tab-${idx}`}>
            <Box args={[1.0, 0.09, 0.2]} position={[x, 0, totalDepth / 2 + 0.1]} material={foamMaterial} />
            <Box args={[1.0, 0.09, 0.2]} position={[x, 0, -totalDepth / 2 - 0.1]} material={foamMaterial} />
          </group>
        ))}
      </group>

      {/* 4. LAYER 4: HOT-SWAP PCB */}
      <group ref={pcbGroup} position={[0, -0.48, 0]}>
        <Box args={[totalWidth, 0.06, totalDepth]} material={pcbMaterial} />

        {/* Soldered ALPS EC11 Rotary Encoder Module */}
        <AlpsEncoderPcbModule
          x={knob.x}
          z={knob.z}
          ledMat={rgbLedMaterial}
        />

        {keys.map((k) => (
          <group key={`pcb-key-${k.id}`} position={[k.x, 0.032, k.z]}>
            <Box args={[0.58, 0.012, 0.58]} material={goldTraceMaterial} />
            <Box args={[0.36, 0.016, 0.36]} material={pcbMaterial} />
            <Box args={[0.2, 0.035, 0.14]} position={[0, 0.018, -0.22]} material={rgbLedMaterial} />
            <Box args={[0.48, 0.07, 0.28]} position={[0, -0.07, 0]} material={kailhSocketMat} />
          </group>
        ))}

        <group position={[3.2, 0.045, 0]}>
          <Box args={[1.4, 0.07, 1.4]} material={mcuMat} />
          <Box args={[0.85, 0.075, 0.45]} position={[0, 0, 0]} material={goldTraceMaterial} />
        </group>

        <Box args={[1.2, 0.24, 0.7]} position={[-totalWidth / 2 + 2, 0.09, -totalDepth / 2 - 0.12]} material={usbShieldMat} />

        {[-6, -3, 0, 4, 7].map((px) => (
          <Box key={`trace-${px}`} args={[0.1, 0.025, totalDepth - 0.6]} position={[px, 0.034, 0]} material={goldTraceMaterial} />
        ))}
      </group>

      {/* 5. LAYER 5: PORON & SILICONE INTERNALS */}
      <group ref={internalsGroup} position={[0, -0.62, 0]}>
        <Box args={[totalWidth, 0.14, totalDepth]} material={foamMaterial} />
        {/* Encoder Base Cutout */}
        <Box args={[0.74, 0.02, 0.74]} position={[knob.x, 0.072, knob.z]} material={pcbMaterial} />
        {keys.map((k) => (
          <Box key={`foam-hole-${k.id}`} args={[0.62, 0.02, 0.62]} position={[k.x, 0.072, k.z]} material={pcbMaterial} />
        ))}
      </group>

      {/* 6. LAYER 6: CNC ALUMINUM CASE WITH GOLD PINSTRIPE BEVEL */}
      <group ref={caseGroup} position={[0, -0.85, 0]}>
        {/* Bottom Tray */}
        <Box args={[totalWidth + 0.6, 0.22, totalDepth + 0.6]} position={[0, -0.14, 0]} material={caseMaterial} />

        {/* Outer Frame Walls */}
        <Box args={[totalWidth + 0.6, 0.44, 0.3]} position={[0, 0.08, totalDepth / 2 + 0.15]} material={caseMaterial} />
        <Box args={[totalWidth + 0.6, 0.44, 0.3]} position={[0, 0.08, -totalDepth / 2 - 0.15]} material={caseMaterial} />
        <Box args={[0.3, 0.44, totalDepth + 0.6]} position={[totalWidth / 2 + 0.15, 0.08, 0]} material={caseMaterial} />
        <Box args={[0.3, 0.44, totalDepth + 0.6]} position={[-totalWidth / 2 - 0.15, 0.08, 0]} material={caseMaterial} />

        {/* Solid Brass Internal Resonance Weight Bar */}
        <Box args={[totalWidth - 3.2, 0.09, totalDepth - 1.8]} position={[0, -0.26, 0]} material={brassMaterial} />

        {/* Rubber Feet */}
        {[-totalWidth / 2 + 1.2, totalWidth / 2 - 1.2].map((x) => (
          <group key={`feet-${x}`}>
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, totalDepth / 2 - 0.5]} material={rubberFootMat} />
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, -totalDepth / 2 + 0.5]} material={rubberFootMat} />
          </group>
        ))}

        {/* USB-C Port Cutout */}
        <Box args={[1.2, 0.3, 0.1]} position={[-totalWidth / 2 + 2, 0.06, -totalDepth / 2 - 0.31]} material={usbPortMat} />
      </group>

      {/* 7. LAYER 7: FLOATING BRASS HARDWARE */}
      <group ref={hardwareGroup} position={[0, -1.2, 0]}>
        {screwPositions.map(([sx, sz], i) => (
          <group key={`screw-${i}`} position={[sx, 0, sz]}>
            <Cylinder args={[0.2, 0.2, 0.09, 12]} material={brassMaterial} />
            <Cylinder args={[0.09, 0.09, 0.3, 12]} position={[0, 0.18, 0]} material={brassMaterial} />
          </group>
        ))}
      </group>

      {/* 8. FLOATING 3D ANNOTATION BADGES */}
      {showAnnotations && (
        <group>
          {LAYER_ANNOTATIONS.map((ann) => (
            <group
              key={ann.id}
              position={[ann.alignRight ? totalWidth / 2 + 2.0 : -totalWidth / 2 - 2.0, ann.yOffset, 0]}
            >
              <Html
                center
                distanceFactor={14}
                style={{
                  pointerEvents: "none",
                }}
              >
                <div
                  ref={ann.id === 'keycaps' ? annotationsGroup : undefined}
                  className={`flex flex-col whitespace-nowrap px-3.5 py-2 rounded-xl bg-[#0c0a14] border border-orange-500/40 shadow-xl transition-opacity duration-150 ${ann.alignRight ? "items-start text-left" : "items-end text-right"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10.5px] font-black tracking-wider text-orange-400 uppercase">
                      {ann.title}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-medium mt-0.5 tracking-normal">
                    {ann.spec}
                  </div>
                </div>
              </Html>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
