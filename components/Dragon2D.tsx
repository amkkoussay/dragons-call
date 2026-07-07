import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateDragonSilhouette } from '@/lib/generateDragonSilhouette';

export function Dragon2D() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generated once, no external dragon_silhouette.png dependency.
  const texture = useMemo(() => generateDragonSilhouette('#8B4513'), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const progress = window.scrollProgress?.value || 0;

    // Visible from 40% to 70%, peaking at 55%, matching the source artwork's
    // dragon position (upper-left, above the mountain ridge).
    const opacity =
      progress > 0.4 && progress < 0.7 ? 1 - Math.abs(progress - 0.55) / 0.15 : 0;

    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity);
  });

  return (
    <mesh ref={meshRef} position={[-1.8, 4.2, -6]} scale={[3, 1.5, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
