'use client';

import { useEffect } from 'react';

/** Tells the parent page (widget.js) how tall the embedded content is. */
export function EmbedResizer() {
  useEffect(() => {
    if (window.parent === window) return;
    const send = () =>
      window.parent.postMessage({ type: 'hirekit:height', height: document.documentElement.scrollHeight }, '*');
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  return null;
}
