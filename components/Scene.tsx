import { CameraRig } from './CameraRig';
import { DepthMapImage } from './DepthMapImage';
import { Dragon2D } from './Dragon2D';
import { DragonParticles } from './DragonParticles';
import { Fog } from './Fog';
import { Effects } from './Effects';
import { Preloader } from './Preloader';

export function Scene({ onReady }: { onReady: () => void }) {
  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#B0C4DE', 10, 50]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <CameraRig />
      <DepthMapImage />
      <Dragon2D />
      <DragonParticles />
      <Fog />
      <Effects />

      {/*
        Preloader MUST be last: gl.compile(scene, camera) walks the scene
        graph as it exists at the moment it runs. Mounting it after every
        textured mesh above guarantees they're already in the tree, so the
        GPU warm-up actually compiles their shaders/textures instead of
        an empty/partial scene.
      */}
      <Preloader onReady={onReady} />
    </>
  );
}
