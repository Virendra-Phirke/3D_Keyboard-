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
  RGBMode
} from "../store";
import { THEME_CONFIGS, getKeycapTexture } from "../utils/keycapTexture";
import { playSwitchSound } from "../utils/audio";

const mapLinear = THREE.MathUtils.mapLinear;
const clamp = THREE.MathUtils.clamp;

// Layer annotation data for exploded view with expanded vertical spacing
const LAYER_ANNOTATIONS = [
  {
    id: 'keycaps',
    title: '01. PBT DOUBLESHOT KEYCAPS',
    spec: '1.5mm Extra-Thick PBT • Cherry Sculpt • Oil-Resistant Matte Finish',
    yOffset: 6.0,
    alignRight: false,
  },
  {
    id: 'switches',
    title: '02. CUSTOM MECHANICAL SWITCHES',
    spec: 'Factory Lubed • 45g Actuation • 5-Pin Hot-Swappable',
    yOffset: 4.0,
    alignRight: true,
  },
  {
    id: 'plate',
    title: '03. CNC ANODIZED ALUMINUM PLATE',
    spec: '6063 Aircraft Alloy • Laser-Cut Switch Cutouts • Gasket Mounts',
    yOffset: 2.2,
    alignRight: false,
  },
  {
    id: 'pcb',
    title: '04. HOT-SWAP RGB CIRCUIT BOARD',
    spec: 'South-Facing SMD RGB • Kailh Sockets • 1000Hz Polling Rate • QMK/VIA',
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
    spec: 'Sandblasted & Anodized Shell • Solid Brass Internal Weight',
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
  isPressed: boolean;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

function KeycapItem({
  keyInfo,
  theme,
  isPressed,
  onPress,
  onRelease,
}: KeycapItemProps) {
  const [isHovered, setIsHovered] = useState_light();
  const keycapRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);

  const texture = useMemo(() => {
    return getKeycapTexture(
      theme,
      keyInfo.label,
      keyInfo.subLabel,
      keyInfo.type,
      isHovered,
      isPressed
    );
  }, [theme, keyInfo.label, keyInfo.subLabel, keyInfo.type, isHovered, isPressed]);

  const keycapMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.38,
      metalness: 0.04,
    });
  }, [texture]);

  const skirtMaterial = useMemo(() => {
    const colors = THEME_CONFIGS[theme] || THEME_CONFIGS.ember;
    const baseCol = keyInfo.type === 'modifier' ? colors.modBase : colors.alphaBase;
    return new THREE.MeshStandardMaterial({
      color: isPressed ? '#1c1c1f' : isHovered ? '#2c2c32' : baseCol,
      roughness: 0.42,
      metalness: 0.06,
    });
  }, [theme, keyInfo.type, isPressed, isHovered]);

  useFrame((_, delta) => {
    if (keycapRef.current) {
      const targetY = isPressed ? -0.16 : isHovered ? 0.04 : 0;
      currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 25, delta);
      keycapRef.current.position.y = 0.2 + currentY.current;
    }
  });

  const w = keyInfo.width - 0.06;
  const d = keyInfo.depth - 0.06;

  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      <group ref={keycapRef} position={[0, 0.2, 0]}>
        {/* Sculpted Bottom Skirt */}
        <RoundedBox
          args={[w, 0.32, d]}
          radius={0.05}
          smoothness={3}
          material={skirtMaterial}
          position={[0, 0.16, 0]}
        />
        {/* Sculpted Top Dish Face with High-Res Texture */}
        <RoundedBox
          args={[w - 0.08, 0.16, d - 0.08]}
          radius={0.06}
          smoothness={3}
          material={keycapMaterial}
          position={[0, 0.28, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPress(keyInfo.code);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onRelease(keyInfo.code);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'auto';
          }}
        />
      </group>
    </group>
  );
}

function useState_light(): [boolean, (v: boolean) => void] {
  const val = useRef(false);
  const [, setR] = useMemo(() => {
    let r = 0;
    return [, (fn: (v: number) => number) => { r = fn(r); }];
  }, []);
  const setter = (v: boolean) => {
    if (val.current !== v) {
      val.current = v;
      if (setR) setR((x) => x + 1);
    }
  };
  return [val.current, setter];
}

interface SwitchItemProps {
  keyInfo: KeyInfo;
  stemMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  clearMat: THREE.MeshStandardMaterial;
  metalMat: THREE.MeshStandardMaterial;
  isPressed: boolean;
}

function SwitchItem({
  keyInfo,
  stemMat,
  baseMat,
  clearMat,
  metalMat,
  isPressed
}: SwitchItemProps) {
  return (
    <group position={[keyInfo.x, 0, keyInfo.z]}>
      <Box args={[0.74, 0.22, 0.74]} position={[0, 0.11, 0]} material={baseMat} />
      <Box args={[0.7, 0.3, 0.7]} position={[0, 0.34, 0]} material={clearMat} />
      <Cylinder args={[0.09, 0.09, 0.26, 6]} position={[0, 0.23, 0]} material={metalMat} />
      <group position={[0, isPressed ? 0.36 : 0.48, 0]}>
        <Box args={[0.26, 0.28, 0.09]} material={stemMat} />
        <Box args={[0.09, 0.28, 0.26]} material={stemMat} />
      </group>
      <Box args={[0.04, 0.24, 0.04]} position={[-0.16, -0.08, 0.12]} material={metalMat} />
      <Box args={[0.04, 0.24, 0.04]} position={[0.16, -0.08, -0.12]} material={metalMat} />
    </group>
  );
}

export function KeyboardModel() {
  const { colorTheme, rgbMode, switchType, soundEnabled, showAnnotations, zoomLevel, pressedKeys } = useAppStore();
  const themeConfig = THEME_CONFIGS[colorTheme] || THEME_CONFIGS.ember;

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

  // HIGH-PERFORMANCE SHARED MATERIALS
  const caseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#27272a",
      roughness: 0.35,
      metalness: 0.8,
    });
  }, []);

  const plateMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#475569",
      roughness: 0.28,
      metalness: 0.9,
    });
  }, []);

  const pcbMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#18181b",
      roughness: 0.65,
      metalness: 0.3,
    });
  }, []);

  const goldTraceMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#fbbf24",
      roughness: 0.15,
      metalness: 0.98,
    });
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#f59e0b",
      roughness: 0.15,
      metalness: 0.98,
    });
  }, []);

  const rgbLedMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ff7700",
      emissive: "#ff7700",
      emissiveIntensity: rgbMode === "off" ? 0 : 3.5,
      roughness: 0.2,
    });
  }, [rgbMode]);

  const foamMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#334155",
      roughness: 0.95,
      metalness: 0.05,
    });
  }, []);

  const switchStemMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: themeConfig.switchStem,
      roughness: 0.25,
      metalness: 0.15
    });
  }, [themeConfig.switchStem]);

  const switchBaseMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#27272a",
      roughness: 0.5,
      metalness: 0.3
    });
  }, []);

  const switchClearMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#9ca3af",
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });
  }, []);

  const switchMetalMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#fbbf24",
      metalness: 0.98,
      roughness: 0.15
    });
  }, []);

  const screwPositions = useMemo(() => {
    const positions: [number, number][] = [];
    const xStep = totalWidth / 6;
    for (let x = -totalWidth / 2 + 1; x <= totalWidth / 2 - 1; x += xStep) {
      positions.push([x, totalDepth / 2 - 0.4]);
      positions.push([x, -totalDepth / 2 + 0.4]);
    }
    positions.push([-totalWidth / 2 + 0.6, 0]);
    positions.push([totalWidth / 2 - 0.6, 0]);
    return positions;
  }, [totalWidth, totalDepth]);

  useFrame(({ clock }, delta) => {
    const rawOffset = getScrollProgress();
    smoothedScroll.current = THREE.MathUtils.damp(smoothedScroll.current, rawOffset, 16, delta);
    smoothedZoom.current = THREE.MathUtils.damp(smoothedZoom.current, zoomLevel, 12, delta);
    const scrollOffset = smoothedScroll.current;
    const time = clock.getElapsedTime();

    const getProgress = (start: number, end: number) => {
      return clamp(mapLinear(scrollOffset, start, end, 0, 1), 0, 1);
    };

    // 1. Position, Orientation & Interactive Zoom Scaling
    if (mainGroup.current) {
      const explodeProgress = getProgress(0.08, 0.92);

      const targetX = mapLinear(explodeProgress, 0, 1, 0, 0);
      const targetY = mapLinear(explodeProgress, 0, 1, 0, 0.1);
      const targetZ = mapLinear(explodeProgress, 0, 1, 0, 0);

      mainGroup.current.position.x = targetX;
      mainGroup.current.position.y = targetY;
      mainGroup.current.position.z = targetZ;

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

    // 2. LAYER EXPLOSIONS
    const keycapsProgress = getProgress(0.10, 0.34);
    if (keycapsGroup.current) {
      const ease = 1 - Math.pow(1 - keycapsProgress, 3);
      keycapsGroup.current.position.y = ease * 6.0;
    }

    const switchesProgress = getProgress(0.22, 0.44);
    if (switchesGroup.current) {
      const ease = 1 - Math.pow(1 - switchesProgress, 2.5);
      switchesGroup.current.position.y = -0.2 + ease * 4.2;
    }

    const plateProgress = getProgress(0.34, 0.56);
    if (plateGroup.current) {
      const ease = 1 - Math.pow(1 - plateProgress, 2.5);
      plateGroup.current.position.y = -0.28 + ease * 2.48;
    }

    const pcbProgress = getProgress(0.46, 0.68);
    if (pcbGroup.current) {
      const ease = 1 - Math.pow(1 - pcbProgress, 2.5);
      pcbGroup.current.position.y = -0.48 + ease * 0.98;
    }

    const internalsProgress = getProgress(0.58, 0.78);
    if (internalsGroup.current) {
      const ease = 1 - Math.pow(1 - internalsProgress, 2.5);
      internalsGroup.current.position.y = -0.62 - ease * 0.58;
    }

    const caseProgress = getProgress(0.68, 0.88);
    if (caseGroup.current) {
      const ease = 1 - Math.pow(1 - caseProgress, 2.5);
      caseGroup.current.position.y = -0.85 - ease * 1.95;
    }

    const hardwareProgress = getProgress(0.76, 0.94);
    if (hardwareGroup.current) {
      const ease = 1 - Math.pow(1 - hardwareProgress, 2.5);
      hardwareGroup.current.position.y = -1.2 - ease * 3.3;
    }

    // 3. Dynamic Amber & Warm Backlight Glow
    if (amberBacklight.current && underglowLight.current) {
      if (rgbMode === "off") {
        amberBacklight.current.intensity = 0;
        underglowLight.current.intensity = 0;
      } else if (rgbMode === "rainbow") {
        const hue = (time * 0.25) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.55);
        amberBacklight.current.color = color;
        underglowLight.current.color = color;
        amberBacklight.current.intensity = 3.5;
        underglowLight.current.intensity = 3.5;
      } else if (rgbMode === "breathe") {
        const intensity = (Math.sin(time * 2.5) * 0.5 + 0.5) * 4.0 + 0.8;
        amberBacklight.current.color.set("#ff8800");
        underglowLight.current.color.set("#ff8800");
        amberBacklight.current.intensity = intensity;
        underglowLight.current.intensity = intensity;
      } else {
        amberBacklight.current.color.set("#ff8800");
        underglowLight.current.color.set("#ff7700");
        amberBacklight.current.intensity = 4.2;
        underglowLight.current.intensity = 3.6;
      }
    }
  });

  return (
    <group ref={mainGroup} scale={[0.48, 0.48, 0.48]} position={[0, 0, 0]}>
      {/* WARM AMBER UNDERGLOW LIGHTS */}
      <pointLight ref={amberBacklight} position={[0, 0.6, 0]} intensity={4.2} distance={24} decay={1.8} color="#ff8800" />
      <pointLight ref={underglowLight} position={[0, -0.6, 0]} intensity={3.6} distance={26} decay={1.8} color="#ff7700" />

      {/* 1. LAYER 1: KEYCAPS & ROTARY KNOB */}
      <group ref={keycapsGroup}>
        {keys.map((key) => (
          <KeycapItem
            key={`keycap-${key.id}`}
            keyInfo={key}
            theme={colorTheme}
            isPressed={pressedKeys.has(key.code)}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
        ))}

        <group position={[knob.x, 0.35, knob.z]}>
          <Cylinder args={[0.55, 0.55, 0.42, 24]} material={new THREE.MeshStandardMaterial({ color: "#3f3f46", roughness: 0.25, metalness: 0.95 })} />
          <Cylinder args={[0.44, 0.44, 0.05, 24]} position={[0, 0.22, 0]} material={new THREE.MeshStandardMaterial({ color: "#27272a", roughness: 0.2, metalness: 0.9 })} />
          <Cylinder args={[0.48, 0.48, 0.06, 24]} position={[0, 0.12, 0]} material={new THREE.MeshStandardMaterial({ color: "#ff7700", emissive: "#ff7700", emissiveIntensity: 2.5 })} />
        </group>
      </group>

      {/* 2. LAYER 2: SWITCHES ARRAY */}
      <group ref={switchesGroup} position={[0, -0.2, 0]}>
        {keys.map((key) => (
          <SwitchItem
            key={`switch-${key.id}`}
            keyInfo={key}
            stemMat={switchStemMat}
            baseMat={switchBaseMat}
            clearMat={switchClearMat}
            metalMat={switchMetalMat}
            isPressed={pressedKeys.has(key.code)}
          />
        ))}
      </group>

      {/* 3. LAYER 3: LASER-CUT SWITCH PLATE */}
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

      {/* 6. LAYER 6: CNC ALUMINUM CASE */}
      <group ref={caseGroup} position={[0, -0.85, 0]}>
        <Box args={[totalWidth + 0.6, 0.22, totalDepth + 0.6]} position={[0, -0.14, 0]} material={caseMaterial} />
        <Box args={[totalWidth + 0.6, 0.44, 0.3]} position={[0, 0.08, totalDepth / 2 + 0.15]} material={caseMaterial} />
        <Box args={[totalWidth + 0.44, 0.44, 0.3]} position={[0, 0.08, -totalDepth / 2 - 0.15]} material={caseMaterial} />
        <Box args={[0.3, 0.44, totalDepth + 0.6]} position={[totalWidth / 2 + 0.15, 0.08, 0]} material={caseMaterial} />
        <Box args={[0.3, 0.44, totalDepth + 0.6]} position={[-totalWidth / 2 - 0.15, 0.08, 0]} material={caseMaterial} />

        <Box args={[totalWidth - 3.2, 0.09, totalDepth - 1.8]} position={[0, -0.26, 0]} material={brassMaterial} />
        {[-totalWidth / 2 + 1.2, totalWidth / 2 - 1.2].map((x) => (
          <group key={`feet-${x}`}>
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, totalDepth / 2 - 0.5]} material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 })} />
            <Box args={[1.8, 0.06, 0.6]} position={[x, -0.27, -totalDepth / 2 + 0.5]} material={new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.9 })} />
          </group>
        ))}
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
                  className={`flex flex-col whitespace-nowrap px-3.5 py-2 rounded-xl bg-black/90 backdrop-blur-xl border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-opacity duration-150 ${
                    ann.alignRight ? "items-start text-left" : "items-end text-right"
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
