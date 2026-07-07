import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * GPU warm-up step. Must be mounted LAST inside <Scene> (after every mesh
 * that uses a texture or shader), so that when gl.compile(scene, camera)
 * runs, the scene graph already contains DepthMapImage, Dragon2D, and
 * DragonParticles. Compiling earlier would warm up an incomplete scene
 * and defeat the purpose of this step.
 */
export function Preloader({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // Force-compile all shaders/materials currently in the scene graph
    // so textures are uploaded to the GPU before the reveal.
    gl.compile(scene, camera);

    const t = setTimeout(onReady, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  return null;
}
