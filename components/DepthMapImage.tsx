import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { withBasePath } from '@/lib/assetPath';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D colorMap;
  uniform sampler2D depthMap;
  uniform float progress;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Read depth (white = close, black = far)
    float depth = texture2D(depthMap, uv).r;

    // Radial displacement from center simulates a camera dolly
    // forward through a single flat image.
    vec2 center = vec2(0.5);
    vec2 dir = uv - center;

    uv += dir * depth * progress * 0.25;

    vec4 color = texture2D(colorMap, uv);
    gl_FragColor = color;
  }
`;

export function DepthMapImage() {
  const meshRef = useRef<THREE.Mesh>(null);

  const colorMap = useTexture(withBasePath('/images/hero_landscape.jpg'));
  const depthMap = useTexture(withBasePath('/images/depth_map.png'));

  colorMap.minFilter = THREE.LinearFilter;
  depthMap.minFilter = THREE.LinearFilter;
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const uniforms = useMemo(
    () => ({
      colorMap: { value: colorMap },
      depthMap: { value: depthMap },
      progress: { value: 0 },
    }),
    [colorMap, depthMap]
  );

  useFrame(() => {
    uniforms.progress.value = window.scrollProgress?.value || 0;
  });

  return (
    <mesh ref={meshRef}>
      {/* 9:16-ish plane to match the portrait source image aspect ratio */}
      <planeGeometry args={[9, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
