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

/** The 90-second sales video. Poster with a play button; plays with sound and controls. */
export function SalesVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[14px] bg-signal shadow-lift ring-1 ring-white/10">
      <video
        ref={ref}
        className="block aspect-video w-full"
        src="/video/hirekit-tour.mp4"
        poster="/video/tour-poster.jpg"
        controls={started}
        playsInline
        preload="none"
        aria-label="HireKit tour: the hiring problem, how HireKit works and pricing, told in on-screen text."
      />
      {!started && (
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            ref.current?.play().catch(() => {});
          }}
          className="group absolute inset-0 flex items-end justify-start p-[5%]"
          aria-label="Play the HireKit tour, 1 minute 26 seconds"
        >
          <span className="flex items-center gap-3 rounded-full bg-graphite py-2.5 pl-2.5 pr-6 font-bold text-white shadow-lift transition-transform group-hover:scale-[1.03]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-signal">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-graphite" aria-hidden="true">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
            Watch the tour (1:26)
          </span>
        </button>
      )}
    </div>
  );
}
