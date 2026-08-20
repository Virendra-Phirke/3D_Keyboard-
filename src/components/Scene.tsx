import { OrbitControls } from "@react-three/drei";
import { KeyboardModel } from "./KeyboardModel";
import { useAppStore } from "../store";
import { THEME_CONFIGS } from "../utils/keycapTexture";

export default function Scene() {
  const { colorTheme } = useAppStore();
  const themeConfig = THEME_CONFIGS[colorTheme] || THEME_CONFIGS.ember;

  return (
    <>
      <color attach="background" args={["#08080c"]} />

      {/* BALANCED HIGH-FIDELITY STUDIO LIGHTING */}
      <ambientLight intensity={1.8} color="#ffffff" />

      {/* Overhead Key Softbox Light */}
      <directionalLight
        position={[8, 20, 10]}
        intensity={3.8}
        color="#ffffff"
      />

      {/* Left Cool Studio Fill */}
      <directionalLight
        position={[-16, 12, -8]}
        intensity={2.8}
        color="#cbd5e1"
      />

      {/* Right Warm Amber Edge Rim Light */}
      <directionalLight
        position={[16, 8, -6]}
        intensity={3.0}
        color="#ffaa33"
      />

      {/* Front Camera Fill for Laser-Sharp Legibility */}
      <directionalLight
        position={[0, 12, 18]}
        intensity={3.2}
        color="#ffffff"
      />

      {/* Bottom Subtle Bounce Fill */}
      <directionalLight
        position={[0, -6, 6]}
        intensity={1.0}
        color="#64748b"
      />

      {/* ORBIT CONTROLS: FREE MOUSE ROTATION & PANNING */}
      <OrbitControls
        makeDefault
        enableRotate={true}
        enablePan={true}
        enableZoom={false}
        rotateSpeed={0.85}
        panSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.08}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />

      <group position={[0, 0, 0]}>
        <KeyboardModel />
      </group>
    </>
  );
}
