import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateKeyboardLayout, KeyInfo } from "../utils/keyboardLayout";
import {
  getScrollProgress,
  useAppStore,
  setKeyPressed,
  ColorTheme,
  CustomColors,
  FontStyle
} from "../store";
import { getKeycapTexture } from "../utils/keycapTexture";
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
  fontStyle: FontStyle;
  fontSize: number;
  isPressed: boolean;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

/* ─── GLOBAL GEOMETRY SINGLETONS FOR MAXIMUM 60FPS PERFORMANCE ─── */
const keycapGeometryCache = new Map<string, THREE.BufferGeometry>();
const dishGeometryCache = new Map<string, THREE.BufferGeometry>();

const socketGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 8);
const switchBaseGeom = new THREE.BoxGeometry(0.82, 0.10, 0.82);
const switchClearGeom = new THREE.BoxGeometry(0.72, 0.18, 0.72);
const switchStemPlatformGeom = new THREE.BoxGeometry(0.36, 0.06, 0.36);
const switchStemCrossH = new THREE.BoxGeometry(0.28, 0.24, 0.08);
const switchStemCrossV = new THREE.BoxGeometry(0.08, 0.24, 0.28);
const switchLedGeom = new THREE.BoxGeometry(0.16, 0.05, 0.08);

const stabHousingGeom = new THREE.BoxGeometry(0.36, 0.32, 0.42);
const stabStemHGeom = new THREE.BoxGeometry(0.24, 0.24, 0.08);
const stabStemVGeom = new THREE.BoxGeometry(0.08, 0.24, 0.24);

const screwHeadGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.09, 10);
const screwShaftGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 8);
const rubberFootGeom = new THREE.BoxGeometry(1.8, 0.06, 0.6);
const usbPortGeom = new THREE.BoxGeometry(1.2, 0.3, 0.1);

// Pre-allocated static materials
const socketMaterial = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.5 });
const darkComponentMat = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.2, metalness: 0.85 });
const rubberFootMat = new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 });
const usbPortMat = new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.4 });

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

  const unitSize = 0.96;
  const wBottom = widthUnits * unitSize - 0.04;
  const dBottom = depthUnits * unitSize - 0.04;

  const taper = 0.085;
  const wTop = Math.max(0.35, wBottom - taper * 2);
  const dTop = Math.max(0.35, dBottom - taper * 2);

  const hw0 = wBottom / 2;
  const hd0 = dBottom / 2;
  const hw1 = wTop / 2;
  const hd1 = dTop / 2;

  const positions = new Float32Array([
    // Top face (y = height)
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
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 0.05,  0, 0.05,
    0, 0,  1, 0,  1, 0.05,  0, 0.05,
    0, 0,  1, 0,  1, 0.05,  0, 0.05,
    0, 0,  1, 0,  1, 0.05,  0, 0.05,
  ]);

  const indices = [
    0, 1, 2,  0, 2, 3,
    4, 5, 6,  4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  keycapGeometryCache.set(cacheKey, geometry);
  return geometry;
}

function getDishGeometry(widthUnits: number, depthUnits: number): THREE.BufferGeometry {
  const cacheKey = `${widthUnits}_${depthUnits}`;
  if (dishGeometryCache.has(cacheKey)) {
    return dishGeometryCache.get(cacheKey)!;
  }
  const geom = new THREE.BoxGeometry(widthUnits - 0.20, 0.04, depthUnits - 0.18);
  dishGeometryCache.set(cacheKey, geom);
  return geom;
}

/* ─── REALISTIC CHERRY PROFILE MECHANICAL KEYCAP ─── */
function KeycapItem({
  keyInfo,
  theme,
  customColors,
  fontStyle,
  fontSize,
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
      },
      fontStyle,
      fontSize / 56
    );
  }, [theme, keyInfo.label, keyInfo.subLabel, keyInfo.type, isPressed, customColors, fontStyle, fontSize]);

  const keycapMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.44,
      metalness: 0.04,
      side: THREE.FrontSide,
    });
  }, [texture]);

  const geometry = useMemo(() => {
    return createCherryKeycapGeometry(keyInfo.width, keyInfo.depth, 0.44);
  }, [keyInfo.width, keyInfo.depth]);

  const dishGeom = useMemo(() => {
    return getDishGeometry(keyInfo.width, keyInfo.depth);
  }, [keyInfo.width, keyInfo.depth]);

  const rowTilt = useMemo(() => {
    switch (keyInfo.row) {
      case 0: return 0.08;
      case 1: return 0.06;
      case 2: return 0.02;
      case 3: return -0.01;
      case 4: return -0.05;
      case 5: return -0.07;
      default: return 0.0;
    }
  }, [keyInfo.row]);

  useFrame((_, delta) => {
    if (keycapRef.current && (isPressed || Math.abs(currentY.current) > 0.0005)) {
      const targetY = isPressed ? -0.12 : 0;
      currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 28, delta);
      keycapRef.current.position.y = 0.2 + currentY.current;
    }
  });

  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      <group ref={keycapRef} position={[0, 0.2, 0]} rotation={[rowTilt, 0, 0]}>
        <mesh
          geometry={geometry}
          material={keycapMaterial}
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
        <mesh
          geometry={dishGeom}
          material={keycapMaterial}
          position={[0, 0.44, 0]}
        />

        {/* Underside Switch Stem Socket */}
        <mesh
          geometry={socketGeom}
          material={socketMaterial}
          position={[0, 0.06, 0]}
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
  ledMat: THREE.MeshStandardMaterial;
  isPressed: boolean;
}

/* ─── OPTIMIZED CHERRY MX MECHANICAL SWITCH ─── */
function SwitchItem({
  keyInfo,
  stemMat,
  baseMat,
  clearMat,
  ledMat,
  isPressed
}: SwitchItemProps) {
  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      {/* Lower Nylon Housing Base */}
      <mesh geometry={switchBaseGeom} material={baseMat} position={[0, -0.02, 0]} />

      {/* Crystal-Clear Polycarbonate Upper Shell */}
      <mesh geometry={switchClearGeom} material={clearMat} position={[0, 0.12, 0]} />

      {/* South-Facing SMD RGB LED Bead */}
      <mesh geometry={switchLedGeom} material={ledMat} position={[0, 0.08, 0.30]} />

      {/* Precision MX Cross Stem Slider */}
      <group position={[0, isPressed ? 0.24 : 0.36, 0]}>
        <mesh geometry={switchStemPlatformGeom} material={stemMat} position={[0, -0.02, 0]} />
        <mesh geometry={switchStemCrossH} material={stemMat} position={[0, 0.12, 0]} />
        <mesh geometry={switchStemCrossV} material={stemMat} position={[0, 0.12, 0]} />
      </group>
    </group>
  );
}

/* ─── OPTIMIZED PLATE-MOUNTED STAINLESS STEEL STABILIZER ─── */
function StabilizerAssembly({
  x,
  z,
  width,
  stemMat,
  baseMat,
}: {
  x: number;
  z: number;
  width: number;
  stemMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
}) {
  const halfSpan = width >= 6.0 ? 2.38 : (width * 1.05 - 0.7) / 2;

  return (
    <group position={[x, 0, z]}>
      <group position={[-halfSpan, 0, 0]}>
        <mesh geometry={stabHousingGeom} material={baseMat} position={[0, 0.16, 0]} />
        <mesh geometry={stabStemHGeom} material={stemMat} position={[0, 0.28, 0]} />
        <mesh geometry={stabStemVGeom} material={stemMat} position={[0, 0.28, 0]} />
      </group>

      <group position={[halfSpan, 0, 0]}>
        <mesh geometry={stabHousingGeom} material={baseMat} position={[0, 0.16, 0]} />
        <mesh geometry={stabStemHGeom} material={stemMat} position={[0, 0.28, 0]} />
        <mesh geometry={stabStemVGeom} material={stemMat} position={[0, 0.28, 0]} />
      </group>
    </group>
  );
}

export function KeyboardModel() {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel, customColors, pressedKeys, fontStyle, fontSize } = useAppStore();
  const { keys, knob } = useMemo(() => generateKeyboardLayout(), []);

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
  const amberBacklight = useRef<THREE.PointLight>(null);
  const underglowLight = useRef<THREE.PointLight>(null);

  const handleKeyPress = (code: string) => {
    setKeyPressed(code, true);
    if (soundEnabled) playSwitchSound(switchType);
  };

  const handleKeyRelease = (code: string) => {
    setKeyPressed(code, false);
  };

  const totalWidth = 16.8;
  const totalDepth = 6.4;

  const caseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.caseColor || '#141418', roughness: 0.28, metalness: 0.88 }), [customColors.caseColor]);
  const goldChamferMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.18, metalness: 0.96 }), []);
  const plateMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.plate || '#1e1e24', roughness: 0.25, metalness: 0.90 }), [customColors.plate]);
  const pcbMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.pcb || '#0d0d10', roughness: 0.65, metalness: 0.30 }), [customColors.pcb]);
  const goldTraceMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fbbf24", roughness: 0.15, metalness: 0.98 }), []);
  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.weightBar || '#f59e0b', roughness: 0.15, metalness: 0.98 }), [customColors.weightBar]);
  const rgbLedMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.ledColor || '#ff8800', emissive: customColors.ledColor || '#ff8800', emissiveIntensity: rgbMode === "off" ? 0.2 : 3.8, roughness: 0.2 }), [rgbMode, customColors.ledColor]);
  const foamMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.95, metalness: 0.05 }), []);
  const switchStemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.switchStem || '#ff7700', roughness: 0.25, metalness: 0.08 }), [customColors.switchStem]);
  const switchBaseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.55, metalness: 0.25 }), []);
  const switchClearMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.15, metalness: 0.10, transparent: true, opacity: 0.65 }), []);
  const knobCoreMat = useMemo(() => new THREE.MeshStandardMaterial({ color: customColors.knobColor || "#141416", roughness: 0.22, metalness: 0.90 }), [customColors.knobColor]);

  const layerGeometries = useMemo(() => {
    return {
      plateMain: new THREE.BoxGeometry(totalWidth, 0.09, totalDepth),
      gasketTab: new THREE.BoxGeometry(1.0, 0.09, 0.2),
      pcbMain: new THREE.BoxGeometry(totalWidth, 0.06, totalDepth),
      pcbTrace: new THREE.BoxGeometry(0.1, 0.025, totalDepth - 0.6),
      mcuBox: new THREE.BoxGeometry(1.4, 0.07, 1.4),
      mcuChip: new THREE.BoxGeometry(0.85, 0.075, 0.45),
      usbShield: new THREE.BoxGeometry(1.2, 0.24, 0.7),
      foamMain: new THREE.BoxGeometry(totalWidth, 0.14, totalDepth),
      caseBottom: new THREE.BoxGeometry(totalWidth + 0.6, 0.22, totalDepth + 0.6),
      caseWallH: new THREE.BoxGeometry(totalWidth + 0.6, 0.44, 0.3),
      caseWallV: new THREE.BoxGeometry(0.3, 0.44, totalDepth + 0.6),
      caseBevelH: new THREE.BoxGeometry(totalWidth + 0.62, 0.04, 0.04),
      caseBevelV: new THREE.BoxGeometry(0.04, 0.04, totalDepth + 0.62),
      weightBar: new THREE.BoxGeometry(totalWidth - 3.2, 0.09, totalDepth - 1.8),
      knobRing: new THREE.CylinderGeometry(0.58, 0.58, 0.42, 32),
      knobCore: new THREE.CylinderGeometry(0.52, 0.52, 0.46, 32),
      knobTop: new THREE.CylinderGeometry(0.45, 0.45, 0.05, 32),
      knobHalo: new THREE.CylinderGeometry(0.56, 0.56, 0.06, 32),
    };
  }, [totalWidth, totalDepth]);

  const screwPositions = useMemo(() => {
    const positions: [number, number][] = [];
    const xStep = totalWidth / 6;
    for (let x = -totalWidth / 2 + 1; x <= totalWidth / 2 - 1; x += xStep) {
      positions.push([x, totalDepth / 2 - 0.4]);
      positions.push([x, -totalDepth / 2 + 0.4]);
    }
    return positions;
  }, [totalWidth, totalDepth]);

  const spacebarKey = useMemo(() => {
    return keys.find(k => k.type === 'space' || k.code === 'Space' || k.width >= 5.0);
  }, [keys]);

  useFrame(({ clock }, delta) => {
    const rawOffset = getScrollProgress();
    smoothedScroll.current = THREE.MathUtils.damp(smoothedScroll.current, rawOffset, 14, delta);
    smoothedZoom.current = THREE.MathUtils.damp(smoothedZoom.current, zoomLevel, 12, delta);
    const scrollOffset = smoothedScroll.current;
    const time = clock.getElapsedTime();

    const getProgress = (start: number, end: number) => clamp(mapLinear(scrollOffset, start, end, 0, 1), 0, 1);

    if (mainGroup.current) {
      const explodeProgress = getProgress(0.06, 0.94);
      mainGroup.current.position.set(0, mapLinear(explodeProgress, 0, 1, 0, 0.1), 0);
      const currentScale = 0.48 * smoothedZoom.current;
      mainGroup.current.scale.set(currentScale, currentScale, currentScale);
      mainGroup.current.rotation.x = mapLinear(explodeProgress, 0, 1, 0.52, 0.42);
      mainGroup.current.rotation.y = mapLinear(explodeProgress, 0, 1, -0.32, 0.22);
      mainGroup.current.rotation.z = mapLinear(explodeProgress, 0, 1, 0.08, -0.04);
    }

    const annotationsVisibility = showAnnotations ? getProgress(0.65, 0.88) : 0;
    if (annotationsGroup.current) {
      annotationsGroup.current.style.opacity = `${annotationsVisibility}`;
      annotationsGroup.current.style.display = annotationsVisibility > 0.01 ? 'block' : 'none';
    }

    const smoothStep = (t: number) => t * t * (3 - 2 * t);
    if (keycapsGroup.current) keycapsGroup.current.position.y = smoothStep(getProgress(0.06, 0.40)) * 6.0;
    if (switchesGroup.current) switchesGroup.current.position.y = -0.2 + smoothStep(getProgress(0.18, 0.52)) * 4.2;
    if (plateGroup.current) plateGroup.current.position.y = -0.28 + smoothStep(getProgress(0.30, 0.64)) * 2.48;
    if (pcbGroup.current) pcbGroup.current.position.y = -0.48 + smoothStep(getProgress(0.42, 0.76)) * 0.98;
    if (internalsGroup.current) internalsGroup.current.position.y = -0.62 - smoothStep(getProgress(0.54, 0.84)) * 0.58;
    if (caseGroup.current) caseGroup.current.position.y = -0.85 - smoothStep(getProgress(0.64, 0.92)) * 1.95;
    if (hardwareGroup.current) hardwareGroup.current.position.y = -1.2 - smoothStep(getProgress(0.72, 0.98)) * 3.3;

    if (amberBacklight.current && underglowLight.current) {
        if (rgbMode === "off") {
            amberBacklight.current.intensity = 0.5; underglowLight.current.intensity = 0.5;
            amberBacklight.current.color.set(customColors.ledColor || '#ff8800'); underglowLight.current.color.set(customColors.ledColor || '#ff8800');
        } else if (rgbMode === "rainbow") {
            const color = new THREE.Color().setHSL((time * 0.25) % 1, 1, 0.55);
            amberBacklight.current.color = color; underglowLight.current.color = color;
            amberBacklight.current.intensity = 3.5; underglowLight.current.intensity = 3.5;
        } else if (rgbMode === "breathe") {
            const intensity = (Math.sin(time * 2.5) * 0.5 + 0.5) * 4.0 + 0.8;
            amberBacklight.current.intensity = intensity; underglowLight.current.intensity = intensity;
        } else {
            amberBacklight.current.intensity = 4.2; underglowLight.current.intensity = 3.6;
        }
    }
  });

  return (
    <group ref={mainGroup} scale={[0.48, 0.48, 0.48]} position={[0, 0, 0]}>
      <group ref={keycapsGroup} position={[0, 0, 0]}>
        {keys.map((key) => (
          <KeycapItem key={`key-${key.id}`} keyInfo={key} theme={colorTheme} customColors={customColors} fontStyle={fontStyle} fontSize={fontSize} isPressed={pressedKeys.has(key.code)} onPress={handleKeyPress} onRelease={handleKeyRelease} />
        ))}
        <group position={[knob.x, 0.38, knob.z]}>
          <mesh geometry={layerGeometries.knobRing} material={goldChamferMaterial} />
          <mesh geometry={layerGeometries.knobCore} material={knobCoreMat} />
          <mesh geometry={layerGeometries.knobTop} material={darkComponentMat} position={[0, 0.24, 0]} />
          <mesh geometry={layerGeometries.knobHalo} material={rgbLedMaterial} position={[0, -0.16, 0]} />
        </group>
      </group>

      <group ref={switchesGroup} position={[0, -0.2, 0]}>
        {keys.map((key) => (
          <SwitchItem key={`switch-${key.id}`} keyInfo={key} stemMat={switchStemMat} baseMat={switchBaseMat} clearMat={switchClearMat} ledMat={rgbLedMaterial} isPressed={pressedKeys.has(key.code)} />
        ))}
        {spacebarKey && (
          <StabilizerAssembly x={spacebarKey.x} z={spacebarKey.z} width={spacebarKey.width} stemMat={switchStemMat} baseMat={switchBaseMat} />
        )}
      </group>

      <group ref={plateGroup} position={[0, -0.28, 0]}>
        <mesh geometry={layerGeometries.plateMain} material={plateMaterial} />
        {[-totalWidth / 2 + 2, -totalWidth / 4, 0, totalWidth / 4, totalWidth / 2 - 2].map((x, idx) => (
          <group key={`gasket-tab-${idx}`}>
            <mesh geometry={layerGeometries.gasketTab} material={foamMaterial} position={[x, 0, totalDepth / 2 + 0.1]} />
            <mesh geometry={layerGeometries.gasketTab} material={foamMaterial} position={[x, 0, -totalDepth / 2 - 0.1]} />
          </group>
        ))}
      </group>

      <group ref={pcbGroup} position={[0, -0.48, 0]}>
        <mesh geometry={layerGeometries.pcbMain} material={pcbMaterial} />
        <group position={[3.2, 0.045, 0]}>
          <mesh geometry={layerGeometries.mcuBox} material={darkComponentMat} />
          <mesh geometry={layerGeometries.mcuChip} material={goldTraceMaterial} position={[0, 0, 0]} />
        </group>
        <mesh geometry={layerGeometries.usbShield} material={darkComponentMat} position={[-totalWidth / 2 + 2, 0.09, -totalDepth / 2 - 0.12]} />
        {[-6, -3, 0, 4, 7].map((px) => (
          <mesh key={`trace-${px}`} geometry={layerGeometries.pcbTrace} material={goldTraceMaterial} position={[px, 0.034, 0]} />
        ))}
      </group>

      <group ref={internalsGroup} position={[0, -0.62, 0]}>
        <mesh geometry={layerGeometries.foamMain} material={foamMaterial} />
      </group>

      <group ref={caseGroup} position={[0, -0.85, 0]}>
        <mesh geometry={layerGeometries.caseBottom} material={caseMaterial} position={[0, -0.14, 0]} />
        <mesh geometry={layerGeometries.caseWallH} material={caseMaterial} position={[0, 0.08, totalDepth / 2 + 0.15]} />
        <mesh geometry={layerGeometries.caseWallH} material={caseMaterial} position={[0, 0.08, -totalDepth / 2 - 0.15]} />
        <mesh geometry={layerGeometries.caseWallV} material={caseMaterial} position={[totalWidth / 2 + 0.15, 0.08, 0]} />
        <mesh geometry={layerGeometries.caseWallV} material={caseMaterial} position={[-totalWidth / 2 - 0.15, 0.08, 0]} />
        <mesh geometry={layerGeometries.caseBevelH} material={goldChamferMaterial} position={[0, 0.28, totalDepth / 2 + 0.28]} />
        <mesh geometry={layerGeometries.caseBevelH} material={goldChamferMaterial} position={[0, 0.28, -totalDepth / 2 - 0.28]} />
        <mesh geometry={layerGeometries.caseBevelV} material={goldChamferMaterial} position={[totalWidth / 2 + 0.28, 0.28, 0]} />
        <mesh geometry={layerGeometries.caseBevelV} material={goldChamferMaterial} position={[-totalWidth / 2 - 0.28, 0.28, 0]} />
        <mesh geometry={layerGeometries.weightBar} material={brassMaterial} position={[0, -0.26, 0]} />
        {[-totalWidth / 2 + 1.2, totalWidth / 2 - 1.2].map((x) => (
          <group key={`feet-${x}`}>
            <mesh geometry={rubberFootGeom} material={rubberFootMat} position={[x, -0.27, totalDepth / 2 - 0.5]} />
            <mesh geometry={rubberFootGeom} material={rubberFootMat} position={[x, -0.27, -totalDepth / 2 + 0.5]} />
          </group>
        ))}
        <mesh geometry={usbPortGeom} material={usbPortMat} position={[-totalWidth / 2 + 2, 0.06, -totalDepth / 2 - 0.31]} />
      </group>

      <group ref={hardwareGroup} position={[0, -1.2, 0]}>
        {screwPositions.map(([sx, sz], i) => (
          <group key={`screw-${i}`} position={[sx, 0, sz]}>
            <mesh geometry={screwHeadGeom} material={brassMaterial} />
            <mesh geometry={screwShaftGeom} material={brassMaterial} position={[0, 0.18, 0]} />
          </group>
        ))}
      </group>

      {showAnnotations && (
        <group>
          {LAYER_ANNOTATIONS.map((ann) => (
            <group key={ann.id} position={[ann.alignRight ? totalWidth / 2 + 2.0 : -totalWidth / 2 - 2.0, ann.yOffset, 0]}>
              <Html center distanceFactor={14} style={{ pointerEvents: "none" }}>
                <div ref={ann.id === 'keycaps' ? annotationsGroup : undefined} className={`flex flex-col whitespace-nowrap px-3.5 py-2 rounded-xl bg-[#0c0a14] border border-orange-500/40 shadow-xl transition-opacity duration-150 ${ann.alignRight ? "items-start text-left" : "items-end text-right"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10.5px] font-black tracking-wider text-orange-400 uppercase">{ann.title}</span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-medium mt-0.5 tracking-normal">{ann.spec}</div>
                </div>
              </Html>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
