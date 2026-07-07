import * as THREE from 'three';

/**
 * Generates a bat-winged dragon silhouette on a transparent canvas,
 * inspired by the reference artwork (wide swept wings, small body, long tail).
 * This removes the dependency on an external dragon_silhouette.png asset.
 */
export function generateDragonSilhouette(color = '#8B4513'): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;

  const cx = w * 0.5;
  const cy = h * 0.55;

  // Body + neck + head (small, since the wings dominate the silhouette)
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy + 10);
  ctx.bezierCurveTo(cx - 20, cy - 30, cx + 30, cy - 30, cx + 70, cy - 10); // neck/head
  ctx.bezierCurveTo(cx + 90, cy, cx + 60, cy + 30, cx + 20, cy + 25); // chest
  ctx.bezierCurveTo(cx - 10, cy + 22, cx - 30, cy + 20, cx - 40, cy + 10);
  ctx.closePath();
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 15);
  ctx.quadraticCurveTo(cx - 160, cy + 60, cx - 230, cy + 30);
  ctx.quadraticCurveTo(cx - 170, cy + 45, cx - 45, cy + 25);
  ctx.closePath();
  ctx.fill();

  // Wing drawing helper (bat-like, jagged trailing edge), mirrored for left/right
  const drawWing = (mirror: 1 | -1) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(mirror, 1);
    ctx.beginPath();
    ctx.moveTo(10, -10); // shoulder
    ctx.lineTo(-90, -140); // wing tip 1 (outer)
    ctx.lineTo(-160, -90); // finger tip
    ctx.lineTo(-230, -60); // wing tip 2 (far outer)
    ctx.lineTo(-190, -20); // notch
    ctx.lineTo(-260, 10); // wing tip 3
    ctx.lineTo(-150, 40); // notch
    ctx.lineTo(-100, 20); // trailing edge
    ctx.quadraticCurveTo(-40, 30, 10, 15); // back to body
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  drawWing(1); // right wing
  drawWing(-1); // left wing

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
