import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFogTexture } from '@/lib/generateFogTexture';
import { prefersReducedMotion } from '@/lib/reducedMotion';

export function Fog() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => generateFogTexture(), []);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const progress = window.scrollProgress?.value || 0;

    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.min(progress * 0.8, 0.6);

    if (!reducedMotion) {
      texture.offset.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -2, 1]}>
      <planeGeometry args={[20, 10]} />
      <meshBasicMaterial map={texture} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
