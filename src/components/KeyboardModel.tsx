import { RoundedBox, Box, Cylinder, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateKeyboardLayout, KeyInfo } from "../utils/keyboardLayout";
import {
  getScrollProgress,
  useAppStore,
  setKeyPressed,
  ColorTheme,
  CustomColors
} from "../store";
import { THEME_CONFIGS, getKeycapTexture } from "../utils/keycapTexture";
import { playSwitchSound } from "../utils/audio";

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
    spec: 'Clear PC Top • Lubed MX Stem • South-Facing SMD LED',
    yOffset: 4.0,
    alignRight: true,
  },
  {
    id: 'plate',
    title: '03. CNC ANODIZED ALUMINUM PLATE',
    spec: '6063 Aircraft Alloy • Stainless Steel Stabilizers • Gasket Mounts',
    yOffset: 2.2,
    alignRight: false,
  },
  {
    id: 'pcb',
    title: '04. HOT-SWAP RGB CIRCUIT BOARD',
    spec: 'South-Facing SMD RGB • Kailh Sockets • 1000Hz Polling Rate',
    yOffset: 0.5,
    alignRight: true,
  },
  {
    id: 'internals',
    title: '05. PORON & SILICONE INTERNALS',
    spec: 'Multi-Stage Acoustic Sound Barrier • Eliminates Hollow Ping',
    yOffset: -1.2,
    alignRight: false,
  },
  {
    id: 'case',
    title: '06. CNC ALUMINUM CASE & HARDWARE',
    spec: 'Sandblasted & Anodized Shell • Solid Brass Weight Bar',
    yOffset: -2.8,
    alignRight: true,
  },
  {
    id: 'hardware',
    title: '07. FLOATING BRASS HARDWARE',
    spec: 'Precision CNC Standoffs & Golden M2 Screws',
    yOffset: -4.5,
    alignRight: false,
  },
];

interface KeycapItemProps {
  keyInfo: KeyInfo;
  theme: ColorTheme;
  customColors: CustomColors;
  isPressed: boolean;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

/**
 * Creates a single, seamless, authentic Cherry/OEM profile truncated pyramid keycap.
 * No stepped ledges or chicklet borders - pure sloped mechanical keycap geometry.
 */
function createCherryKeycapGeometry(width: number, depth: number, height: number = 0.44) {
  const wBottom = width - 0.05;
  const dBottom = depth - 0.05;
  const wTop = width - 0.18;
  const dTop = depth - 0.16;

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
  return geometry;
}

/* ─── REALISTIC CHERRY PROFILE MECHANICAL KEYCAP ─── */
function KeycapItem({
  keyInfo,
  theme,
  customColors,
  isPressed,
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
      isPressed,
      {
        keycapsAlpha: customColors.keycapsAlpha,
        keycapsMod: customColors.keycapsMod,
        keycapsAccent: customColors.keycapsAccent,
        keycapsText: customColors.keycapsText,
      }
    );
  }, [theme, keyInfo.label, keyInfo.subLabel, keyInfo.type, isPressed, customColors]);

  const keycapMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.44,
      metalness: 0.04,
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
    if (keycapRef.current) {
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

        {/* Beveled Concave Dish Top */}
        <RoundedBox
          args={[keyInfo.width - 0.20, 0.04, keyInfo.depth - 0.18]}
          radius={0.02}
          smoothness={2}
          material={keycapMaterial}
          position={[0, 0.44, 0]}
        />

        {/* Underside Switch Stem Socket */}
        <Cylinder
          args={[0.16, 0.16, 0.14, 12]}
          position={[0, 0.06, 0]}
          material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.5 })}
        />
      </group>
    </group>
  );
}

interface SwitchItemProps {
  keyInfo: KeyInfo;
  stemMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  clearMat: THREE.MeshStandardMaterial;
  springMat: THREE.MeshStandardMaterial;
  ledMat: THREE.MeshStandardMaterial;
  isPressed: boolean;
}

/* ─── REALISTIC CHERRY MX MECHANICAL SWITCH (Matching 3D CAD Image) ─── */
function SwitchItem({
  keyInfo,
  stemMat,
  baseMat,
  clearMat,
  springMat,
  ledMat,
  isPressed
}: SwitchItemProps) {
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
      <pointLight position={[0, 0.14, 0.30]} intensity={0.4} distance={1.2} color="#ffaa22" />

      {/* 5. Precision MX Cross Stem Slider with Shoulder Platform & Guide Rails */}
      <group position={[0, isPressed ? 0.24 : 0.38, 0]}>
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
}

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

      {/* Solid Stainless Steel Wire Rod connecting left and right stabilizers */}
      <group position={[0, 0.08, 0.16]}>
        {/* Horizontal Main Wire Span */}
        <Cylinder
          args={[0.024, 0.024, halfSpan * 2, 12]}
          rotation={[0, 0, Math.PI / 2]}
          material={wireMat}
        />
        {/* Left 90-degree Arm */}
        <Cylinder
          args={[0.024, 0.024, 0.18, 12]}
          position={[-halfSpan, 0.06, -0.07]}
          rotation={[Math.PI / 2.5, 0, 0]}
          material={wireMat}
        />
        {/* Right 90-degree Arm */}
        <Cylinder
          args={[0.024, 0.024, 0.18, 12]}
          position={[halfSpan, 0.06, -0.07]}
          rotation={[Math.PI / 2.5, 0, 0]}
          material={wireMat}
        />
      </group>
    </group>
  );
}

export function KeyboardModel() {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel, customColors, pressedKeys } = useAppStore();

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
      color: "#18181b",
      roughness: 0.55,
      metalness: 0.25
    });
  }, []);

  const switchClearMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#cbd5e1",
      roughness: 0.15,
      metalness: 0.10,
      transparent: true,
      opacity: 0.65
    });
  }, []);

  const switchSpringMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#f59e0b",
      metalness: 0.98,
      roughness: 0.15
    });
  }, []);

  const wireMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#e2e8f0",
      metalness: 0.98,
      roughness: 0.12
    });
  }, []);

  const screwPositions = useMemo(() => {
    const positions: [number, number][] = [];
    const xStep = totalWidth / 6;
    for (let x = -totalWidth / 2 + 1; x <= totalWidth / 2 - 1; x += xStep) {
      positions.push([x, totalDepth / 2 - 0.4]);
      positions.push([x, -totalDepth / 2 + 0.4]);
    }
    return positions;
  }, [totalWidth, totalDepth]);

  // Wide keys requiring stabilizers
  const stabilizedKeys = useMemo(() => {
    return keys.filter(k => k.width >= 1.75);
  }, [keys]);

  // Render loop with smooth easing
  useFrame(({ clock }, delta) => {
    const rawOffset = getScrollProgress();
    smoothedScroll.current = THREE.MathUtils.damp(smoothedScroll.current, rawOffset, 14, delta);
    smoothedZoom.current = THREE.MathUtils.damp(smoothedZoom.current, zoomLevel, 12, delta);
    const scrollOffset = smoothedScroll.current;
    const time = clock.getElapsedTime();

    const getProgress = (start: number, end: number) => {
      return clamp(mapLinear(scrollOffset, start, end, 0, 1), 0, 1);
    };

    // 1. Position, Orientation & Interactive Zoom Scaling
    if (mainGroup.current) {
      const explodeProgress = getProgress(0.06, 0.94);

      mainGroup.current.position.set(0, mapLinear(explodeProgress, 0, 1, 0, 0.1), 0);

      const currentScale = 0.48 * smoothedZoom.current;
      mainGroup.current.scale.set(currentScale, currentScale, currentScale);

      const rotX = mapLinear(explodeProgress, 0, 1, 0.52, 0.42);
      const rotY = mapLinear(explodeProgress, 0, 1, -0.32, 0.22);
      const rotZ = mapLinear(explodeProgress, 0, 1, 0.08, -0.04);

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

    const smoothStep = (t: number) => t * t * (3 - 2 * t);

    // 2. LAYER EXPLOSIONS WITH BUTTERY SMOOTHSTEP EASING
    const keycapsProgress = getProgress(0.06, 0.40);
    if (keycapsGroup.current) {
      const ease = smoothStep(keycapsProgress);
      keycapsGroup.current.position.y = ease * 6.0;
    }

    const switchesProgress = getProgress(0.18, 0.52);
    if (switchesGroup.current) {
      const ease = smoothStep(switchesProgress);
      switchesGroup.current.position.y = -0.2 + ease * 4.2;
    }

    const plateProgress = getProgress(0.30, 0.64);
    if (plateGroup.current) {
      const ease = smoothStep(plateProgress);
      plateGroup.current.position.y = -0.28 + ease * 2.48;
    }

    const pcbProgress = getProgress(0.42, 0.76);
    if (pcbGroup.current) {
      const ease = smoothStep(pcbProgress);
      pcbGroup.current.position.y = -0.48 + ease * 0.98;
    }

    const internalsProgress = getProgress(0.54, 0.84);
    if (internalsGroup.current) {
      const ease = smoothStep(internalsProgress);
      internalsGroup.current.position.y = -0.62 - ease * 0.58;
    }

    const caseProgress = getProgress(0.64, 0.92);
    if (caseGroup.current) {
      const ease = smoothStep(caseProgress);
      caseGroup.current.position.y = -0.85 - ease * 1.95;
    }

    const hardwareProgress = getProgress(0.72, 0.98);
    if (hardwareGroup.current) {
      const ease = smoothStep(hardwareProgress);
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
            isPressed={pressedKeys.has(key.code)}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
        ))}

        {/* CNC Metallic Rotary Encoder Knob with Concentric Bevels */}
        <group position={[knob.x, 0.38, knob.z]}>
          {/* Outer Beveled Brass/Gold Chamfer Ring */}
          <Cylinder args={[0.58, 0.58, 0.42, 36]} material={goldChamferMaterial} />
          {/* Inner Textured Anodized Core */}
          <Cylinder args={[0.52, 0.52, 0.46, 36]} material={new THREE.MeshStandardMaterial({ color: customColors.knobColor || "#141416", roughness: 0.22, metalness: 0.90 })} />
          {/* Top Knurled Radial Inset */}
          <Cylinder args={[0.45, 0.45, 0.05, 36]} position={[0, 0.24, 0]} material={new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.35, metalness: 0.85 })} />
          {/* Glowing LED Halo Base */}
          <Cylinder args={[0.56, 0.56, 0.06, 36]} position={[0, -0.16, 0]} material={rgbLedMaterial} />
        </group>
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
            isPressed={pressedKeys.has(key.code)}
          />
        ))}

        {/* Real Plate-Mounted Stainless Steel Stabilizers on Wide Keys */}
        {stabilizedKeys.map((key) => (
          <StabilizerAssembly
            key={`stab-${key.id}`}
            x={key.x}
            z={key.z}
            width={key.width}
            stemMat={switchStemMat}
            baseMat={switchBaseMat}
            wireMat={wireMaterial}
          />
        ))}
      </group>

      {/* 3. LAYER 3: LASER-CUT CNC SWITCH PLATE */}
      <group ref={plateGroup} position={[0, -0.28, 0]}>
        <Box args={[totalWidth, 0.09, 0.25]} position={[0, 0, totalDepth / 2 - 0.125]} material={plateMaterial} />
        <Box args={[totalWidth, 0.09, 0.25]} position={[0, 0, -totalDepth / 2 + 0.125]} material={plateMaterial} />
        <Box args={[0.25, 0.09, totalDepth]} position={[totalWidth / 2 - 0.125, 0, 0]} material={plateMaterial} />
        <Box args={[0.25, 0.09, totalDepth]} position={[-totalWidth / 2 + 0.125, 0, 0]} material={plateMaterial} />

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

        {keys.map((k) => (
          <group key={`pcb-key-${k.id}`} position={[k.x, 0.032, k.z]}>
            <Box args={[0.58, 0.012, 0.58]} material={goldTraceMaterial} />
            <Box args={[0.36, 0.016, 0.36]} material={pcbMaterial} />
            <Box args={[0.2, 0.035, 0.14]} position={[0, 0.018, -0.22]} material={rgbLedMaterial} />
            <Box args={[0.48, 0.07, 0.28]} position={[0, -0.07, 0]} material={new THREE.MeshStandardMaterial({ color: "#27272a", roughness: 0.4 })} />
          </group>
        ))}

        <group position={[3.2, 0.045, 0]}>
          <Box args={[1.4, 0.07, 1.4]} material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.2, metalness: 0.85 })} />
          <Box args={[0.85, 0.075, 0.45]} position={[0, 0, 0]} material={goldTraceMaterial} />
        </group>

        <Box args={[1.2, 0.24, 0.7]} position={[-totalWidth / 2 + 2, 0.09, -totalDepth / 2 - 0.12]} material={new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.98, roughness: 0.1 })} />

        {[-6, -3, 0, 4, 7].map((px) => (
          <Box key={`trace-${px}`} args={[0.1, 0.025, totalDepth - 0.6]} position={[px, 0.034, 0]} material={goldTraceMaterial} />
        ))}
      </group>

      {/* 5. LAYER 5: PORON & SILICONE INTERNALS */}
      <group ref={internalsGroup} position={[0, -0.62, 0]}>
        <Box args={[totalWidth, 0.14, totalDepth]} material={foamMaterial} />
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

        {/* Gold Chamfer Accent Pinstripe along Perimeter (Matching reference image) */}
        <Box args={[totalWidth + 0.62, 0.04, 0.04]} position={[0, 0.28, totalDepth / 2 + 0.28]} material={goldChamferMaterial} />
        <Box args={[totalWidth + 0.62, 0.04, 0.04]} position={[0, 0.28, -totalDepth / 2 - 0.28]} material={goldChamferMaterial} />
        <Box args={[0.04, 0.04, totalDepth + 0.62]} position={[totalWidth / 2 + 0.28, 0.28, 0]} material={goldChamferMaterial} />
        <Box args={[0.04, 0.04, totalDepth + 0.62]} position={[-totalWidth / 2 - 0.28, 0.28, 0]} material={goldChamferMaterial} />

        {/* Solid Brass Internal Resonance Weight Bar */}
        <Box args={[totalWidth - 3.2, 0.09, totalDepth - 1.8]} position={[0, -0.26, 0]} material={brassMaterial} />

        {/* Rubber Feet */}
        {[-totalWidth / 2 + 1.2, totalWidth / 2 - 1.2].map((x) => (
          <group key={`feet-${x}`}>
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, totalDepth / 2 - 0.5]} material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 })} />
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, -totalDepth / 2 + 0.5]} material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 })} />
          </group>
        ))}

        {/* USB-C Port Cutout */}
        <Box args={[1.2, 0.3, 0.1]} position={[-totalWidth / 2 + 2, 0.06, -totalDepth / 2 - 0.31]} material={new THREE.MeshStandardMaterial({ color: "#000000" })} />
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
                  className={`flex flex-col whitespace-nowrap px-3.5 py-2 rounded-xl bg-black/90 backdrop-blur-xl border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-opacity duration-150 ${ann.alignRight ? "items-start text-left" : "items-end text-right"
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
