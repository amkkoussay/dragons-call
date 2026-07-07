# The Dragon's Call — v2.1 (Implemented)

Scroll-driven cinematic experience built with Next.js + React Three Fiber + GSAP.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 and scroll. For the gyroscope tilt on iOS, tap the
"Enable Motion" button that appears at the bottom of the screen.

## What was implemented (the 5 agreed fixes)

1. **`THREE.MathUtils.damp` instead of fixed `* 0.08` lerp**
   `components/CameraRig.tsx` — camera position/rotation now use `delta`,
   so the dolly speed is identical on a 30fps and a 120fps device.

2. **GPU warm-up Preloader**
   `components/Preloader.tsx` — calls `gl.compile(scene, camera)` (with the
   required `scene`/`camera` arguments) to force-upload textures/shaders
   before the reveal. It is mounted **last** inside `Scene.tsx`, after every
   textured mesh, so the scene graph is complete when it compiles.

3. **`CatmullRomCurve3` for position, manual damp for rotation**
   `components/CameraRig.tsx` — the camera's XYZ position follows a smooth
   spline through four control points (start / end of each phase). Since
   `getPointAt(t)` is arc-length-normalized (not phase-duration-aware), a
   `remapProgressToCurveT()` function remaps the narrative's 30/40/30% phase
   split onto the curve's uniform parameter space — otherwise "Enter Valley"
   (the longest phase) would visually move faster than intended. Rotation
   (the tilt-up in Phase 3) stays a manual damped lerp for precise control.

4. **SVG noise overlay**
   `components/NoiseOverlay.tsx` — an inline `feTurbulence` SVG as a `data:`
   URI, composited with `mix-blend-mode: soft-light` at 3% opacity, fixed
   above the canvas. Zero WebGL cost, zero extra HTTP requests.

5. **Gyro permission via DOM escape hatch**
   `hooks/useGyroPermission.ts` — the "Enable Motion" button is created with
   `document.createElement`, outside the React tree, so it stays clickable
   regardless of Canvas/Suspense state. Also unlocks the Web Audio wind
   ambience on the same tap (browsers require a user gesture for that).

## Notable substitutions from the original design doc

- **`dragon_silhouette.png` does not exist as a file.** It's generated
  procedurally in `lib/generateDragonSilhouette.ts` (Canvas 2D API, bezier
  wings) — consistent with the project's "no external texture load
  failures" philosophy. Swap in a real PNG later by replacing the
  `useMemo(() => generateDragonSilhouette(...))` call in `Dragon2D.tsx`
  with `useTexture('/images/dragon_silhouette.png')` if you commission a
  proper illustration.
- **Particle texture** was already Canvas-generated in the original design
  (`DragonParticles.tsx`) — no changes needed there.
- **`public/images/hero_landscape.jpg`** and **`public/images/depth_map.png`**
  are your uploaded artwork and its grayscale depth map.

## Accessibility

`prefersReducedMotion()` (`lib/reducedMotion.ts`) is checked in
`CameraRig`, `Fog`, and `DragonParticles`. When active: the camera stays
static (no dolly, no gyro-tilt), fog stops drifting, and particles are
skipped entirely (`PARTICLE_COUNT = 0`) — the image and its fade
transitions remain, per the original design doc's accessibility section.

## Known follow-ups (not yet done, flagged in the earlier audit)

- `hooks/useScrollProgress.ts`, `useHaptic.ts` as separate reusable hooks
  (logic currently inlined in `CameraRig.tsx`, which is fine at this scale).
- Wiring `audioManager.setWindIntensity()` to scroll progress for wind that
  intensifies during "The Pass" (currently only started/unlocked on the
  gyro-permission tap).
