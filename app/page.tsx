'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from '@/components/Scene';
import { NoiseOverlay } from '@/components/NoiseOverlay';
import { useGyroPermission } from '@/hooks/useGyroPermission';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    scrollProgress: { value: number };
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useGyroPermission();

  // Safety net: if the scene never signals ready (e.g. a texture 404
  // from a basePath misconfiguration), surface a visible error instead
  // of an infinite silent "LOADING…" screen.
  useEffect(() => {
    const t = setTimeout(() => {
      console.log("Home: Loading timeout reached.");
      setTimedOut(true);
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.scrollProgress = { value: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(window.scrollProgress, {
      value: 1,
      ease: 'none',
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    if (ready && canvasWrapperRef.current) {
      console.log("Home: Scene is ready, revealing canvas.");
      gsap.to(canvasWrapperRef.current, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    }
  }, [ready]);

  return (
    <div ref={containerRef} style={{ height: '300vh' }}>
      <div
        ref={canvasWrapperRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          opacity: 0,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 2], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          {/* Required so useTexture()'s suspense integration resolves
              correctly instead of throwing into the void when a texture
              is loading (or 404s, e.g. from a basePath misconfiguration). */}
          <Suspense fallback={null}>
            <Scene onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      </div>
      <NoiseOverlay />
      {!ready && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            background: '#0a0e14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            letterSpacing: '0.1em',
            cursor: timedOut ? 'pointer' : 'default'
          }}
          onClick={() => { if (timedOut) setReady(true); }}
        >
          {timedOut ? (
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <p>Taking longer than expected.</p>
              <p style={{ opacity: 0.6, marginTop: 8 }}>
                Click here to try revealing the scene anyway.
              </p>
              <p style={{ fontSize: 10, opacity: 0.4, marginTop: 16 }}>
                Check console for basePath errors.
              </p>
            </div>
          ) : (
            'LOADING…'
          )}
        </div>
      )}
    </div>
  );
}
