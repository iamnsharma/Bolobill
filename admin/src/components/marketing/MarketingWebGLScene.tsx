import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

type SceneProps = {
  intensity?: "hero" | "subtle";
};

function Orbs({ intensity = "hero" }: SceneProps) {
  const group = useRef<Group>(null);
  const scale = intensity === "hero" ? 1 : 0.75;
  const opacity = intensity === "hero" ? 0.5 : 0.32;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={group} scale={scale}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.1}>
        <Sphere args={[1.5, 64, 64]} position={[-2.6, 0.2, -4]}>
          <MeshDistortMaterial
            color="#ff9a88"
            emissive="#B71C1C"
            emissiveIntensity={0.4}
            distort={0.48}
            speed={2}
            transparent
            opacity={opacity}
          />
        </Sphere>
      </Float>
      <Float speed={2.2} rotationIntensity={0.55} floatIntensity={0.85}>
        <Sphere args={[1, 48, 48]} position={[3, -0.5, -3.2]}>
          <MeshDistortMaterial
            color="#ffd9cf"
            emissive="#7A1515"
            emissiveIntensity={0.28}
            distort={0.58}
            speed={2.8}
            transparent
            opacity={opacity * 0.85}
          />
        </Sphere>
      </Float>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={1.4}>
        <Sphere args={[0.55, 32, 32]} position={[0.2, 1.6, -2.2]}>
          <MeshDistortMaterial
            color="#ffffff"
            emissive="#E66239"
            emissiveIntensity={0.22}
            distort={0.35}
            speed={3.5}
            transparent
            opacity={opacity * 0.7}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function MarketingWebGLScene({
  intensity = "hero",
}: SceneProps) {
  return (
    <div className="marketing-backdrop-canvas">
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={0.85} color="#fff8f6" />
      <pointLight position={[-5, -2, 3]} intensity={0.55} color="#B71C1C" />
      <Orbs intensity={intensity} />
    </Canvas>
    </div>
  );
}
