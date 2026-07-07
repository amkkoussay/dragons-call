import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { triggerHaptic } from '@/lib/haptics';
import { prefersReducedMotion } from '@/lib/reducedMotion';

// Scroll phase boundaries, matching the narrative design:
// Phase 1 "Approach": 0-30%, Phase 2 "Enter Valley": 30-70%, Phase 3 "The Pass": 70-100%
const PHASE_1_END = 0.3;
const PHASE_2_END = 0.7;

/**
 * Remaps narrative scroll progress (0-1, split 30/40/30 across three phases)
 * to a uniform curve parameter t (0-1), so CatmullRomCurve3.getPointAt(t)
 * -- which is arc-length-normalized and assumes evenly spaced control points --
 * doesn't distort the intended pacing between phases.
 */
function remapProgressToCurveT(progress: number): number {
  if (progress < PHASE_1_END) {
    return (progress / PHASE_1_END) * 0.333;
  }
  if (progress < PHASE_2_END) {
    return 0.333 + ((progress - PHASE_1_END) / (PHASE_2_END - PHASE_1_END)) * 0.333;
  }
  return 0.666 + ((progress - PHASE_2_END) / (1 - PHASE_2_END)) * 0.334;
}

export function CameraRig() {
  const { camera } = useThree();
  const gyroRef = useRef({ x: 0, y: 0 });
  const hasVibrated = useRef(false);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Position path: one smooth spline covering the whole journey.
  // Control points correspond to phase boundaries from the original design:
  // start (z=2) -> end of Approach (z=1.5) -> end of Enter Valley (z=1.0) -> end of The Pass (z=0.5, slight rise)
  const positionPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 2), // Start
        new THREE.Vector3(0, -0.2, 1.5), // Phase 1 end
        new THREE.Vector3(0, -0.5, 1.0), // Phase 2 end
        new THREE.Vector3(0, 0.3, 0.5), // Phase 3 end
      ]),
    []
  );

  useEffect(() => {
    if (reducedMotion) return; // Don't attach gyro listeners at all

    const handler = (e: DeviceOrientationEvent) => {
      gyroRef.current.x = (e.gamma || 0) * 0.03;
      gyroRef.current.y = (e.beta || 0) * 0.02;
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [reducedMotion]);

  useFrame((_state, delta) => {
    const progress = window.scrollProgress?.value || 0;

    if (reducedMotion) {
      // Static, accessible fallback: no dolly, no gyro, no tilt.
      return;
    }

    // ── Position: follow the spline (Fix #1 + #3) ──
    const t = remapProgressToCurveT(progress);
    const targetPos = positionPath.getPointAt(t);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 4, delta);

    // ── Rotation: manual, phase-based tilt (kept precise, not curve-driven) ──
    const p3 = progress > PHASE_2_END ? Math.min((progress - PHASE_2_END) / 0.3, 1) : 0;
    const rotX = THREE.MathUtils.lerp(0, -0.6, p3);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, rotX, 4, delta);

    // ── Gyroscope free-look (subtle, always active, also frame-rate independent) ──
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, gyroRef.current.x, 5, delta);
    camera.rotation.x = THREE.MathUtils.damp(
      camera.rotation.x,
      camera.rotation.x + gyroRef.current.y * 0.3,
      3,
      delta
    );

    // ── Haptic trigger at 70% (climax entry) ──
    if (progress > PHASE_2_END && !hasVibrated.current) {
      triggerHaptic([50, 100, 50]);
      hasVibrated.current = true;
    }
    if (progress <= PHASE_2_END && hasVibrated.current) {
      hasVibrated.current = false; // allow re-trigger on scroll back up + down again
    }
  });

  return null;
}
