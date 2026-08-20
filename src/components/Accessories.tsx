import { RoundedBox, Box, Cylinder, Torus } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export function DeskAccessories() {
  const metalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#71717a", roughness: 0.3, metalness: 0.9 }),
    []
  );

  const blackMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.5, metalness: 0.5 }),
    []
  );

  const orangeStemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ff7700", roughness: 0.3, metalness: 0.1 }),
    []
  );

  const clearHousingMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#444449",
        transmission: 0.85,
        opacity: 1,
        transparent: true,
        roughness: 0.2,
        ior: 1.5,
      }),
    []
  );

  return (
    <group position={[0, -0.6, 0]}>
      {/* 1. BRAIDED USB-C CABLE (Back Left) */}
      <group position={[-6.5, 0.2, -4.5]} rotation={[0, -0.4, 0]}>
        {/* Metal USB-C Housing */}
        <RoundedBox args={[0.7, 0.35, 1.4]} radius={0.08} material={metalMat} position={[0, 0, 0]} />
        {/* Rubber Strain Relief */}
        <Cylinder args={[0.2, 0.24, 0.8, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.0]} material={blackMat} />
        {/* Curved Braided Cable */}
        <Torus args={[2.5, 0.14, 16, 32, Math.PI / 1.8]} rotation={[Math.PI / 2, 0, 0.5]} position={[2.0, 0, -3.2]} material={blackMat} />
      </group>

      {/* 2. WIRE KEYCAP & SWITCH PULLER TOOL (Right of Keyboard) */}
      <group position={[9.2, -0.15, 2.0]} rotation={[-0.05, 0.45, -0.05]}>
        {/* Puller Black Handle Body */}
        <RoundedBox args={[0.8, 0.18, 3.2]} radius={0.06} material={blackMat} position={[0, 0, 0]} />
        {/* Switch Puller Metal Prong End */}
        <Box args={[0.6, 0.06, 1.4]} position={[0, 0, 2.2]} material={metalMat} />
        <Box args={[0.06, 0.2, 0.3]} position={[0.27, -0.08, 2.8]} material={metalMat} />
        <Box args={[0.06, 0.2, 0.3]} position={[-0.27, -0.08, 2.8]} material={metalMat} />

        {/* Keycap Puller Dual Wire Loops End */}
        <Cylinder args={[0.03, 0.03, 2.2, 8]} rotation={[0, 0, 0.15]} position={[0.25, 0, -2.4]} material={metalMat} />
        <Cylinder args={[0.03, 0.03, 2.2, 8]} rotation={[0, 0, -0.15]} position={[-0.25, 0, -2.4]} material={metalMat} />
        <Torus args={[0.25, 0.03, 8, 16, Math.PI]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3.5]} material={metalMat} />
      </group>

      {/* 3. LOOSE MECHANICAL SWITCH ON DESK (Next to Puller) */}
      <group position={[7.5, -0.18, 4.2]} rotation={[0, 0.35, 0]}>
        {/* Switch Base */}
        <Box args={[0.8, 0.4, 0.8]} position={[0, 0.2, 0]} material={blackMat} />
        {/* Transparent Top Housing */}
        <Box args={[0.76, 0.38, 0.76]} position={[0, 0.48, 0]} material={clearHousingMat} />
        {/* Orange Cross Stem */}
        <Box args={[0.24, 0.3, 0.24]} position={[0, 0.75, 0]} material={orangeStemMat} />
        {/* Contact Pins */}
        <Box args={[0.05, 0.2, 0.05]} position={[-0.2, 0.0, 0.15]} material={metalMat} />
        <Box args={[0.05, 0.2, 0.05]} position={[0.2, 0.0, -0.15]} material={metalMat} />
      </group>
    </group>
  );
}
