import { ContactShadows, OrbitControls } from "@react-three/drei";
import { KeyboardModel } from "./KeyboardModel";
import { useAppStore } from "../store";
import { THEME_CONFIGS } from "../utils/keycapTexture";

export default function Scene() {
  const { colorTheme } = useAppStore();
  const themeConfig = THEME_CONFIGS[colorTheme] || THEME_CONFIGS.ember;

  return (
    <>
      <color attach="background" args={["#050505"]} />

      {/* THREE-POINT STUDIO LIGHTING */}
      <ambientLight intensity={1.2} />

      {/* Key Light */}
      <directionalLight
        position={[14, 20, 14]}
        intensity={3.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={35}
        shadow-bias={-0.0001}
      />

      {/* Left Rim Light */}
      <directionalLight
        position={[-16, 12, -10]}
        intensity={3.5}
        color="#94a3b8"
      />

      {/* Warm Golden/Amber Rim Light */}
      <directionalLight
        position={[16, 6, -8]}
        intensity={3.2}
        color="#ff8800"
      />

      {/* Front Fill Light */}
      <directionalLight
        position={[0, 8, 18]}
        intensity={2.8}
        color="#ffffff"
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
        <ContactShadows
          position={[0, -2.8, 0]}
          opacity={0.6}
          scale={28}
          blur={2.0}
          far={5}
          color="#000000"
        />
      </group>
    </>
  );
}
