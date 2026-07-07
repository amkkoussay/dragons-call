'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from '@/components/Scene';
import { NoiseOverlay } from '@/components/NoiseOverlay';
import { useGyroPermission } from '@/hooks/useGyroPermission';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useGyroPermission();

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
          <Scene onReady={() => setReady(true)} />
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
          }}
        >
          LOADING…
        </div>
      )}
    </div>
  );
}
