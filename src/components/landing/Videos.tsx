'use client';

import { useEffect, useRef, useState } from 'react';

/** Silent looping brand film for the hero. Pauses for reduced-motion users. */
export function IntroFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
      return;
    }
    v.play().catch(() => {
      /* autoplay blocked: poster stays visible */
    });
  }, []);
  return (
    <video
      ref={ref}
      className="block aspect-video w-full rounded-[14px] bg-graphite object-cover"
      src="/video/intro.mp4"
      poster="/video/intro-poster.jpg"
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label="HireKit intro: a job goes live, applications arrive and get ranked, a candidate is hired."
    />
  );
}

/** The sales video. Play button sits below the cover so it never hides the cover text. */
export function SalesVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const play = () => {
    setStarted(true);
    ref.current?.play().catch(() => {});
  };
  return (
    <div>
      <div className="relative overflow-hidden rounded-[14px] bg-signal shadow-lift">
        <video ref={ref} className="block aspect-video w-full" src="/video/hirekit-tour.mp4" poster="/video/tour-poster.jpg" controls={started} playsInline preload="none" aria-label="HireKit tour, told in on-screen text." />
        {!started && <button type="button" onClick={play} className="absolute inset-0" aria-label="Play the HireKit tour, 1 minute 26 seconds" />}
      </div>
      {!started && (
        <button type="button" onClick={play} className="mt-5 flex items-center gap-3 rounded-full bg-signal py-2.5 pl-2.5 pr-6 font-bold text-graphite transition-transform hover:scale-[1.02]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-graphite">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-signal" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
          </span>
          Watch the tour (1:26)
        </button>
      )}
    </div>
  );
}
