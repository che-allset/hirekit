// usage: node render.js page.html outdir [preview "i:t,i:t"]  |  full
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const [,, page, outdir, mode, spec] = process.argv;
  fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await pg.goto('file://' + path.resolve(page));
  await pg.waitForFunction(() => window.READY);
  await pg.evaluate(() => document.fonts.ready);
  if (mode === 'preview') {
    for (const pair of spec.split(',')) {
      const [i, t] = pair.split(':').map(Number);
      await pg.evaluate(([i, t]) => window.renderAt(i, t), [i, t]);
      await pg.screenshot({ path: `${outdir}/p_${i}_${t}.jpg`, type: 'jpeg', quality: 85 });
    }
  } else {
    const durs = await pg.evaluate(() => window.SCENES.map((s) => s.dur));
    const list = [];
    for (let i = 0; i < durs.length; i++) {
      const tmp = `${outdir}/scene${i}.part.mp4`, fin = `${outdir}/scene${i}.mp4`;
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', tmp]);
      const frames = Math.round(durs[i] * 30);
      for (let f = 0; f < frames; f++) {
        await pg.evaluate(([i, t]) => window.renderAt(i, t), [i, f / 30]);
        const buf = await pg.screenshot({ type: 'jpeg', quality: 92 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
      const code = await new Promise((r) => ff.on('close', r));
      if (code !== 0) throw new Error('ffmpeg failed scene ' + i);
      fs.renameSync(tmp, fin);
      list.push(`file '${path.resolve(fin)}'`);
      console.log('scene', i, 'done', frames, 'frames');
    }
    fs.writeFileSync(`${outdir}/list.txt`, list.join('\n'));
  }
  await b.close();
})();
