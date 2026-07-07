import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { prefersReducedMotion } from '@/lib/reducedMotion';

function getDeviceTier(): 'high' | 'medium' | 'low' {
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;
  if (memory >= 8 && cores >= 6) return 'high';
  if (memory >= 4 && cores >= 4) return 'medium';
  return 'low';
}

const TIER_COUNTS = { high: 8000, medium: 5000, low: 2000 };

function generateParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 200, 100, 1)');
  grad.addColorStop(0.4, 'rgba(205, 133, 63, 0.5)');
  grad.addColorStop(1, 'rgba(205, 133, 63, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export function DragonParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => generateParticleTexture(), []);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const PARTICLE_COUNT = useMemo(
    () => (reducedMotion ? 0 : TIER_COUNTS[getDeviceTier()]),
    [reducedMotion]
  );

  const { positions, dragonShape, phases } = useMemo(() => {
    const pos = new Float32Array(Math.max(PARTICLE_COUNT, 1) * 3);
    const shape = new Float32Array(Math.max(PARTICLE_COUNT, 1) * 3);
    const pha = new Float32Array(Math.max(PARTICLE_COUNT, 1));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const t = i / PARTICLE_COUNT;
      shape[i * 3] = Math.sin(t * Math.PI * 4) * 3 + (Math.random() - 0.5) * 0.5;
      shape[i * 3 + 1] = Math.cos(t * Math.PI * 2) * 1 + (Math.random() - 0.5) * 0.5;
      shape[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      pha[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, dragonShape: shape, phases: pha };
  }, [PARTICLE_COUNT]);

  useFrame((state) => {
    if (!pointsRef.current || PARTICLE_COUNT === 0) return;

    const progress = window.scrollProgress?.value || 0;

    if (progress < 0.7) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;

    const phase3Progress = Math.min((progress - 0.7) / 0.3, 1);
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const targetX = dragonShape[i3];
      const targetY =
        dragonShape[i3 + 1] + Math.sin(state.clock.elapsedTime + phases[i]) * 0.3;
      const targetZ = dragonShape[i3 + 2];

      const lerpFactor = phase3Progress * 0.05;
      posArray[i3] +=
        (targetX - posArray[i3]) * lerpFactor +
        Math.sin(state.clock.elapsedTime * 2 + phases[i]) * 0.01;
      posArray[i3 + 1] += (targetY - posArray[i3 + 1]) * lerpFactor;
      posArray[i3 + 2] += (targetZ - posArray[i3 + 2]) * lerpFactor;

      if (phase3Progress > 0.5) {
        posArray[i3 + 2] -= 0.05;
      }
    }

    posAttr.needsUpdate = true;
  });

  if (PARTICLE_COUNT === 0) return null;

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.15}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color="#CD853F"
      />
    </points>
  );
}
