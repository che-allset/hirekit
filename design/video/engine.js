// Tiny deterministic animation engine. Each scene: { dur, setup(root), draw(t, d) }.
// window.SCENES must be defined by the page. window.renderAt(sceneIndex, t) draws one frame.
const E = {
  clamp: (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)),
  // progress of t through [a,b] -> 0..1
  p(t, a, b) { return E.clamp((t - a) / (b - a)); },
  easeOut: (x) => 1 - Math.pow(1 - x, 3),
  easeInOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  lerp: (a, b, x) => a + (b - a) * x,
  // fade+rise helper: returns style string
  rise(t, a, dur = 0.5, dist = 24) {
    const x = E.easeOut(E.p(t, a, a + dur));
    return `opacity:${x};transform:translateY(${(1 - x) * dist}px)`;
  },
  fade(t, a, dur = 0.4) { return E.easeOut(E.p(t, a, a + dur)); },
  out(t, a, dur = 0.35) { return 1 - E.easeInOut(E.p(t, a, a + dur)); },
  typed(text, t, a, cps = 28) { const n = Math.floor(E.clamp((t - a) * cps, 0, text.length)); return text.slice(0, n); },
  h(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; },
};
window.E = E;

window.renderAt = (i, t) => {
  const scenes = window.SCENES;
  scenes.forEach((s, j) => { s.root.style.display = j === i ? 'block' : 'none'; });
  const s = scenes[i];
  s.draw(t, s.dur);
};

window.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  window.SCENES.forEach((s) => {
    s.root = document.createElement('section');
    s.root.className = 'scene';
    stage.appendChild(s.root);
    s.setup(s.root);
  });
  window.READY = true;
});
