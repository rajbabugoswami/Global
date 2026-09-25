"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
      <MeshDistortMaterial 
        color="#3b82f6" 
        attach="material" 
        distort={0.4} 
        speed={2} 
        roughness={0.2}
        metalness={0.8}
        wireframe={true}
      />
    </Sphere>
  );
}

export default function GlobeCanvas() {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} color="#60a5fa" intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AnimatedSphere />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
