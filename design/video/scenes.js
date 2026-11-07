// Scene factories. Each returns { dur, setup(root), draw(t) } that re-renders root.innerHTML per frame.
const { p, easeOut, easeInOut, back, lerp, rise, fade, out, typed, clamp } = window.E;
const S = window.S;

const MARK = (size, tile = '#FFD12E', ink = '#23272D') => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${tile}"/>
<path d="M20 14v20a12 12 0 0 0 24 0V14" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>
<path d="M22 30h20" stroke="${ink}" stroke-width="7"/><path d="M32 46v8" stroke="${ink}" stroke-width="6" stroke-linecap="round"/></svg>`;

function scene(dur, render) {
  return { dur, setup() {}, draw(t) { this.root.innerHTML = render(t, dur); } };
}

// Caption block (bottom-left), appears at a, leaves at dur-0.4
function caption(t, dur, text, a = 0.3, color = '#fff', sub = '') {
  const o = Math.min(fade(t, a, 0.45), out(t, dur - 0.45));
  const y = (1 - easeOut(p(t, a, a + 0.45))) * 18;
  return `<div class="abs" style="left:80px;bottom:72px;max-width:450px;opacity:${o};transform:translateY(${y}px);color:${color}">
    <div class="cn" style="font-size:44px">${text}</div>
    ${sub ? `<div style="margin-top:14px;font-size:21px;line-height:1.4;opacity:.75">${sub}</div>` : ''}</div>`;
}

// Whole-scene fade from/to a colour for clean cuts
function veil(t, dur, color = '#23272D', inDur = 0.3, outDur = 0.3) {
  const o = Math.max(1 - p(t, 0, inDur), p(t, dur - outDur, dur));
  return `<div class="abs" style="inset:0;background:${color};opacity:${o};pointer-events:none"></div>`;
}

/* ── A. Logo plugs in ───────────────────────────── */
window.logoScene = (dur, tagline = S.tagline, bg = '#FFD12E') =>
  scene(dur, (t) => {
    const plug = easeOut(p(t, 0.2, 1.0));
    const snap = p(t, 1.0, 1.15);
    const word = easeOut(p(t, 1.15, 1.7));
    const tag = fade(t, 1.6, 0.5);
    const markY = lerp(160, 0, plug) + Math.sin(snap * Math.PI) * -6;
    return `<div class="abs" style="inset:0;background:${bg}"></div>
      <div class="abs row" style="left:50%;top:50%;transform:translate(-50%,-60%);gap:${lerp(0, 26, word)}px">
        <div style="transform:translateY(${markY}px)">${MARK(150, '#23272D', '#FFD12E')}</div>
        <div class="cn" style="font-size:124px;color:#23272D;overflow:hidden;max-width:${word * 640}px;white-space:nowrap;padding-bottom:6px">HireKit</div>
      </div>
      <div class="abs" style="left:0;right:0;top:470px;text-align:center;font-size:30px;font-weight:700;color:#23272D;opacity:${tag}">${tagline}</div>
      ${veil(t, dur, bg, 0.01, 0.35)}`;
  });

/* ── B. Post a role ───────────────────────────── */
window.postScene = (dur, cap = S.postCap, sub = S.postSub) =>
  scene(dur, (t) => {
    const title = typed(S.jobTitle, t, 0.6, 30);
    const notes = typed(S.notes, t, 1.6, 34);
    const press = p(t, 3.1, 3.3);
    const lines = [0, 1, 2, 3, 4, 5].map((i) => fade(t, 3.5 + i * 0.12, 0.3));
    const live = back(p(t, dur - 2.4, dur - 1.9));
    const btnScale = 1 - Math.sin(press * Math.PI) * 0.06;
    const desc = S.desc;
    return `<div class="abs" style="inset:0;background:#23272D"></div>
      <div class="abs card" style="left:620px;top:70px;width:580px;height:580px;padding:34px">
        <div class="mute" style="font-size:16px;font-weight:700">${S.newJob}</div>
        <div style="margin-top:14px;border:2px solid #23272D;border-radius:10px;padding:12px 14px;font-size:22px;font-weight:700;min-height:52px">${title}<span style="opacity:${t < 1.6 ? (Math.floor(t * 2) % 2) : 0}">|</span></div>
        <div style="margin-top:12px;background:#F4F5F7;border-radius:10px;padding:12px 14px;font-size:17px;min-height:48px;color:#454B54">${notes || `<span class="mute">${S.notesPh}</span>`}</div>
        <div class="row" style="margin-top:14px;gap:10px">
          <div style="background:#FFD12E;border-radius:10px;padding:10px 16px;font-weight:700;font-size:16px;transform:scale(${btnScale})">${S.writeIt}</div>
          <div class="mute" style="font-size:14px;opacity:${fade(t, 3.3)}">${S.draftReady}</div>
        </div>
        <div style="margin-top:20px;font-size:15.5px;line-height:1.5;color:#23272D">
          ${desc.map((d, i) => `<div style="opacity:${lines[i]};${i === 1 || i === 4 ? 'font-weight:700;margin-top:8px' : ''}">${d}</div>`).join('')}
        </div>
        <div class="abs row" style="right:30px;bottom:28px;gap:12px">
          <div class="chip" style="background:#DCEBE4;color:#1D5C47;opacity:${live};transform:scale(${0.6 + live * 0.4})">${S.live}</div>
          <div style="background:#23272D;color:#fff;border-radius:10px;padding:11px 18px;font-weight:700;font-size:16px">${S.publish}</div>
        </div>
      </div>
      ${caption(t, dur, cap, 0.3, '#fff', sub)}
      ${veil(t, dur)}`;
  });

/* ── C. Plug into your website ───────────────────────────── */
window.widgetScene = (dur, cap = S.widgetCap, sub = S.widgetSub) =>
  scene(dur, (t) => {
    const code = typed('<script src="hirekit.app/widget.js" data-company="northwind-labs"></script>', t, 0.8, 55);
    const drop = easeOut(p(t, 2.6, 3.2));
    const jobs = S.siteJobs;
    return `<div class="abs" style="inset:0;background:#E7E9EC"></div>
      <div class="abs card" style="left:560px;top:60px;width:660px;height:600px;overflow:hidden">
        <div class="row" style="height:44px;background:#F4F5F7;padding:0 16px;gap:8px;border-bottom:1px solid #D9DCE1">
          <span style="width:11px;height:11px;border-radius:50%;background:#D9DCE1"></span><span style="width:11px;height:11px;border-radius:50%;background:#D9DCE1"></span>
          <span style="margin-left:14px;font-size:14px" class="mute">northwind.de/careers</span></div>
        <div style="padding:30px 36px;font-family:Georgia,serif;color:#1b2a22">
          <div style="font-size:30px">${S.siteHead}</div>
          <div style="margin-top:22px;background:#23272D;border-radius:10px;padding:14px 16px;font-family:monospace;font-size:13.5px;color:#FFD12E;min-height:48px;opacity:${out(t, 2.4, 0.4)}">${code.replace(/</g, '&lt;')}</div>
          <div style="margin-top:-48px;transform:translateY(${(1 - drop) * 30}px);opacity:${drop}">
            ${jobs.map(([j, m], i) => `<div class="row" style="justify-content:space-between;margin-top:14px;background:#fff;border:1px solid #D9DCE1;border-radius:12px;padding:16px 18px;font-family:H;opacity:${fade(t, 2.8 + i * 0.18, 0.3)}">
              <div><div style="font-weight:700;font-size:19px;color:#23272D">${j}</div><div class="mute" style="font-size:14px;margin-top:4px">${m}</div></div>
              <div style="background:#1D5C47;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;font-size:14px">${S.apply}</div></div>`).join('')}
          </div>
        </div>
      </div>
      ${caption(t, dur, cap, 0.3, '#23272D', sub)}
      ${veil(t, dur, '#E7E9EC')}`;
  });

/* ── D. Screening ───────────────────────────── */
window.screeningScene = (dur, cap = S.screenCap, sub = S.screenSub) =>
  scene(dur, (t) => {
    const arrive = easeOut(p(t, 0.3, 0.9));
    const sc = Math.round(92 * easeOut(p(t, 1.3, 2.8)));
    const ring = easeOut(p(t, 1.3, 2.8));
    const C = 2 * Math.PI * 58;
    const items = S.evidence.map((e, i) => [i < 3 ? '#1D5C47' : '#F2BC00', e]);
    return `<div class="abs" style="inset:0;background:#23272D"></div>
      <div class="abs card" style="left:600px;top:${lerp(140, 70, arrive)}px;width:600px;padding:34px;opacity:${arrive}">
        <div class="row" style="justify-content:space-between">
          <div><div class="mute" style="font-size:16px">${S.jobTitle}</div><div style="font-size:30px;font-weight:700;margin-top:4px">Amara Okafor</div>
          <div class="chip" style="margin-top:10px;background:#DCEBE4;color:#1D5C47;opacity:${fade(t, 2.8)}">${S.strong}</div></div>
          <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="58" fill="none" stroke="#E7E9EC" stroke-width="12"/>
            <circle cx="70" cy="70" r="58" fill="none" stroke="#1D5C47" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - 0.92 * ring)}" transform="rotate(-90 70 70)"/>
            <text x="70" y="86" text-anchor="middle" font-family="D" font-weight="600" font-size="44" fill="#23272D">${sc}</text></svg>
        </div>
        <div style="margin-top:22px">${items.map(([c, s], i) => `<div class="row" style="gap:12px;margin-top:12px;font-size:19px;opacity:${fade(t, 3.0 + i * 0.35, 0.35)}"><span style="width:10px;height:10px;border-radius:50%;background:${c};flex:none"></span>${s}</div>`).join('')}</div>
        <div style="margin-top:24px;background:#F4F5F7;border-radius:12px;padding:16px 18px;font-size:18px;opacity:${fade(t, 4.8, 0.4)}"><b>${S.askLabel}</b> ${S.askQ}</div>
      </div>
      ${caption(t, dur, cap, 0.3, '#fff', sub)}
      ${veil(t, dur)}`;
  });

/* ── E. Ranked shortlist ───────────────────────────── */
window.rankScene = (dur, cap = S.rankCapIntro, sub = '') =>
  scene(dur, (t) => {
    const people = [['Jonas Becker', 64, '#F2BC00'], ['Amara Okafor', 92, '#1D5C47'], ['Hannah Weber', 41, '#D7442F'], ['Diego Ramírez', 84, '#1D5C47']];
    const sorted = [...people].sort((a, b) => b[1] - a[1]);
    const s = easeInOut(p(t, 1.8, 2.6));
    return `<div class="abs" style="inset:0;background:#23272D"></div>
      <div class="abs" style="left:620px;top:120px;width:580px">
        ${people.map(([n, v, c], i) => {
          const j = sorted.findIndex((x) => x[0] === n);
          const y = lerp(i, j, s) * 112;
          const a = easeOut(p(t, 0.2 + i * 0.22, 0.6 + i * 0.22));
          return `<div class="abs card row" style="left:0;right:0;top:${y}px;height:94px;padding:0 28px;justify-content:space-between;opacity:${a};transform:translateX(${(1 - a) * 60}px)">
            <div><div style="font-size:23px;font-weight:700">${n}</div><div class="mute" style="font-size:15px;margin-top:3px">${S.applied[i]}</div></div>
            <div class="score" style="font-size:40px;color:${c}">${v}</div></div>`;
        }).join('')}
      </div>
      ${caption(t, dur, cap, 0.3, '#fff', sub)}
      ${veil(t, dur)}`;
  });

/* ── F. Hire ───────────────────────────── */
window.hireScene = (dur, cap = S.hireCap, sub = S.hireSub) =>
  scene(dur, (t) => {
    const cols = S.cols;
    const mv = easeInOut(p(t, 0.9, 2.4));
    const pos = mv * 3; // column index float
    const stamp = back(p(t, 2.5, 2.9));
    const colW = 150, gap = 12, x0 = 600;
    return `<div class="abs" style="inset:0;background:#E7E9EC"></div>
      ${cols.map((c, i) => `<div class="abs" style="left:${x0 + i * (colW + gap)}px;top:120px;width:${colW}px;height:430px;background:${i === 3 ? '#FFF3C7' : '#fff'};border-radius:14px;padding:14px">
        <div style="font-weight:700;font-size:16px">${c}</div>
        ${i < 3 ? `<div style="margin-top:14px;height:58px;border-radius:10px;background:#F4F5F7"></div><div style="margin-top:10px;height:58px;border-radius:10px;background:#F4F5F7;opacity:${i === 0 ? 1 : 0.6}"></div>` : ''}
      </div>`).join('')}
      <div class="abs card" style="left:${x0 + 8 + pos * (colW + gap)}px;top:${300 - Math.sin(mv * Math.PI) * 30}px;width:${colW - 16}px;padding:12px;transform:rotate(${Math.sin(mv * Math.PI) * -4}deg)">
        <div style="font-weight:700;font-size:15px">Amara Okafor</div><div class="row" style="justify-content:space-between;margin-top:6px"><span class="mute" style="font-size:12px">${S.role}</span><span class="score" style="font-size:20px;color:#1D5C47">92</span></div>
      </div>
      <div class="abs cn" style="right:34px;top:440px;font-size:${S.stamp.length > 9 ? 42 : 52}px;color:#23272D;background:#FFD12E;padding:6px 16px 6px;border-radius:10px;white-space:nowrap;transform:rotate(-8deg) scale(${stamp});opacity:${clamp(stamp)}">${S.stamp}</div>
      ${caption(t, dur, cap, 0.3, '#23272D', sub)}
      ${veil(t, dur, '#E7E9EC')}`;
  });

/* ── G. Big type lines ───────────────────────────── */
window.linesScene = (dur, lines, { bg = '#23272D', color = '#fff', size = 68, gapT = 1.1 } = {}) =>
  scene(dur, (t) => `<div class="abs" style="inset:0;background:${bg}"></div>
    <div class="abs" style="left:80px;top:50%;transform:translateY(-50%);max-width:1100px;color:${color}">
      ${lines.map((l, i) => `<div class="cn" style="font-size:${size}px;margin-top:${i ? 14 : 0}px;${rise(t, 0.25 + i * gapT, 0.55, 30)};${i < lines.length - 1 ? `color:${color};opacity:${Math.min(fade(t, 0.25 + i * gapT), 1 - 0.55 * p(t, 0.25 + (i + 1) * gapT, 0.25 + (i + 1) * gapT + 0.4))}` : ''}">${l}</div>`).join('')}
    </div>${veil(t, dur, bg)}`);

/* ── H. Inbox overflow ───────────────────────────── */
window.inboxScene = (dur) =>
  scene(dur, (t) => {
    const n = Math.round(lerp(23, 148, easeInOut(p(t, 0.4, dur - 3))));
    const names = S.mails;
    const scroll = (t * 70) % 66;
    return `<div class="abs" style="inset:0;background:#23272D"></div>
      <div class="abs card" style="left:600px;top:70px;width:600px;height:580px;overflow:hidden">
        <div class="row" style="position:relative;z-index:2;background:#fff;justify-content:space-between;padding:22px 26px;border-bottom:1px solid #E7E9EC">
          <div style="font-weight:700;font-size:20px">jobs@yourcompany.de</div>
          <div class="chip" style="background:#D7442F;color:#fff;font-size:17px">${S.unread(n)}</div></div>
        <div style="transform:translateY(${-scroll}px)">
        ${Array.from({ length: 11 }).map((_, i) => `<div style="padding:16px 26px;border-bottom:1px solid #F4F5F7"><div style="font-weight:700;font-size:17px">${names[(i + Math.floor(t * 70 / 66)) % names.length]}</div><div class="mute" style="font-size:14px;margin-top:4px">${S.unreadRow}</div></div>`).join('')}
        </div>
      </div>
      ${caption(t, dur, S.inboxCap, 0.6, '#fff', S.inboxSub)}
      ${veil(t, dur)}`;
  });

/* ── I. Trust ───────────────────────────── */
window.trustScene = (dur) =>
  scene(dur, (t) => {
    const pts = S.trust;
    return `<div class="abs" style="inset:0;background:#FFD12E"></div>
      <div class="abs cn" style="left:80px;top:90px;font-size:72px;max-width:1100px;${rise(t, 0.2)}">${S.trustTitle}</div>
      ${pts.map(([a, b], i) => `<div class="abs" style="left:${80 + i * 380}px;top:420px;width:340px;${rise(t, 1.4 + i * 0.6)}"><div style="height:4px;width:60px;background:#23272D"></div><div style="margin-top:18px;font-size:24px;font-weight:700">${a}</div><div style="margin-top:8px;font-size:19px;line-height:1.4">${b}</div></div>`).join('')}
      ${veil(t, dur, '#FFD12E')}`;
  });

/* ── J. Call to action ───────────────────────────── */
window.ctaScene = (dur) =>
  scene(dur, (t) => `<div class="abs" style="inset:0;background:#23272D"></div>
    <div class="abs row" style="left:80px;top:120px;gap:22px;${rise(t, 0.2)}">${MARK(96)}<span class="cn" style="font-size:80px;color:#fff">HireKit</span></div>
    <div class="abs cn" style="left:80px;top:270px;font-size:60px;color:#fff;max-width:1120px;${rise(t, 0.8)}">${S.ctaTitle}</div>
    <div class="abs" style="left:80px;top:400px;font-size:26px;color:rgba(255,255,255,.75);${rise(t, 1.3)}">${S.ctaNote}</div>
    <div class="abs row" style="left:80px;top:490px;gap:18px;${rise(t, 1.8)}">
      <div style="background:#FFD12E;border-radius:12px;padding:18px 28px;font-weight:700;font-size:24px">${S.ctaBtn}</div>
      <div style="color:#fff;font-size:22px">hirekit-ashen.vercel.app</div></div>`);

// Play a scene faster: same on-screen duration, k times the internal speed.
window.fast = (sc, k) => ({ dur: sc.dur / k, setup() {}, draw(t) { sc.root = this.root; sc.draw(t * k); } });
