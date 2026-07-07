'use client';

import { Scene } from '@/components/Scene';
import { Preloader } from '@/components/Preloader';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReady && canvasWrapperRef.current) {
      gsap.to(canvasWrapperRef.current, {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    }
  }, [isReady]);

  return (
    <main className="relative w-full h-[500vh] bg-[#0a0e14] overflow-x-hidden">
      <Preloader onReady={() => setIsReady(true)} />
      
      <div 
        ref={canvasWrapperRef}
        className="fixed inset-0 w-full h-full"
        style={{ opacity: isReady ? 1 : 0 }}
      >
        <Scene isReady={isReady} />
      </div>

      <div className="relative z-10 w-full">
        <section className="h-screen flex items-center justify-center pointer-events-none">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter opacity-0 animate-fade-in">
              THE DRAGON'S CALL
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto opacity-0 animate-fade-in delay-300">
              Scroll to enter the painting
            </p>
          </div>
        </section>
        <div className="h-[400vh]" />
      </div>
    </main>
  );
}
