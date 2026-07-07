import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function Effects() {
  const bloomRef = useRef<any>(null);

  useFrame(() => {
    const progress = window.scrollProgress?.value || 0;
    if (bloomRef.current) {
      const targetStrength = progress > 0.7 ? 1.5 : 0.3;
      bloomRef.current.strength += (targetStrength - bloomRef.current.strength) * 0.1;
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={0.3}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
    </EffectComposer>
  );
}
