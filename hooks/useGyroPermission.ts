import { useEffect } from 'react';
import { audioManager } from '@/lib/audio';

/**
 * Requests iOS DeviceOrientation permission via a raw DOM button created
 * outside the React tree. This guarantees the button stays clickable and
 * visible regardless of Canvas/Suspense lifecycle or portal-style overlays
 * hiding parts of the React-rendered UI.
 */
export function useGyroPermission() {
  useEffect(() => {
    const needsPermission =
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function';

    if (!needsPermission) {
      // Non-iOS: no explicit permission required, gyroscope "just works"
      return;
    }

    const btn = document.createElement('button');
    btn.textContent = 'Enable Motion';
    btn.setAttribute('aria-label', 'Enable device motion for immersive camera');
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      background: rgba(0,0,0,0.8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      cursor: pointer;
    `;

    btn.onclick = async () => {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          btn.remove();
        }
      } catch {
        // Silently keep the button available for retry
      }
      // First user gesture also unlocks the AudioContext for the wind sound
      audioManager.init();
      audioManager.startWind();
    };

    document.body.appendChild(btn);

    return () => {
      if (btn.parentNode) btn.remove();
    };
  }, []);
}
