// Generates compositions/*.html and index.html for the Finanza tutorial.
// Run: node build-scenes.mjs
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const IMG_W = 1440, IMG_H = 900;
const STAGE_W = 1180, STAGE_H = STAGE_W * IMG_H / IMG_W; // 737.5
const STEP_DUR = 6.5;
// Narration: one wav per scene in assets/voice/<id>.wav; each scene stretches to fit it plus a pause.
const VO_LEAD = 0.5, VO_TAIL = 1.6;
const voDur = (id) => Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voice/${id}.wav`).toString().trim());
const durFor = (id, min) => Math.max(min, Math.ceil((voDur(id) + VO_LEAD + VO_TAIL) * 10) / 10);

// rect = [x, y, w, h] in screenshot pixels
const steps = [
  { id: 's1', group: 'Gasto', n: 1, before: '01-resumen', rect: [20, 203, 212, 44],
    title: 'Abre “Nuevo movimiento”', body: 'En el menú lateral (o en “Agregar” en el celular).' },
  { id: 's2', group: 'Gasto', n: 2, before: '02-formulario', after: '03-descripcion', rect: [340, 100, 501, 76],
    title: 'Describe el movimiento', body: 'Ej. “Mercado semanal”, “Recibo de luz”.' },
  { id: 's3', group: 'Gasto', n: 3, before: '03-descripcion', after: '04-tipo-categoria', rect: [340, 190, 501, 68],
    title: 'Elige tipo y categoría', body: 'Tipo: Gasto. Categoría: Alimentación.' },
  { id: 's4', group: 'Gasto', n: 4, before: '04-tipo-categoria', after: '05-monto-fecha', rect: [340, 272, 501, 68],
    title: 'Ingresa monto y fecha', body: 'Ej. 150.50 · la fecha de hoy viene por defecto.' },
  { id: 's5', group: 'Gasto', n: 5, before: '06-moneda', after: '10-moneda-extranjera', rect: [340, 354, 501, 88],
    title: 'Confirma la moneda', body: 'Soles por defecto. En USD o EUR, escribe el tipo de cambio.' },
  { id: 's6', group: 'Gasto', n: 6, before: '06-moneda', rect: [340, 479, 501, 43],
    title: 'Guarda el movimiento', body: 'Pulsa “Guardar movimiento”.' },
  { id: 's7', group: 'Gasto', n: 7, before: '07-guardado', rect: [317, 193, 1058, 203],
    title: 'Revisa tu resumen', body: 'Verás “Movimiento guardado” y los gastos actualizados.' },
  { id: 's8', group: 'Ingreso', n: 1, before: '08-ingreso', rect: [340, 100, 501, 240],
    title: 'Para un ingreso, cambia el tipo', body: 'Tipo: Ingreso · Categoría: Ingresos · Monto: 3500.' },
  { id: 's9', group: 'Ingreso', n: 2, before: '09-ingreso-guardado', rect: [317, 207, 1058, 143],
    title: 'Guarda y mira el balance', body: 'Ingresos, balance y ahorro sugerido se actualizan.' },
  { id: 's10', group: 'Ingreso', n: 3, before: '11-movimientos', rect: [317, 640, 1058, 162],
    title: 'Encuéntralo en Movimientos', body: 'Desde ahí puedes editarlo o eliminarlo.' },
];

const camFor = ([x, y, w, h]) => {
  const k0 = STAGE_W / IMG_W;
  let k = Math.min((STAGE_W * 0.72) / w, (STAGE_H * 0.62) / h);
  k = Math.max(k0, Math.min(k, k0 * 2.1));
  let cx = STAGE_W / 2 - (x + w / 2) * k;
  let cy = STAGE_H / 2 - (y + h / 2) * k;
  cx = Math.min(0, Math.max(STAGE_W - IMG_W * k, cx));
  cy = Math.min(0, Math.max(STAGE_H - IMG_H * k, cy));
  return { k: +k.toFixed(4), x: +cx.toFixed(1), y: +cy.toFixed(1), k0: +k0.toFixed(4) };
};

const sharedStyle = `
    #root { position: absolute; inset: 0; background: #10241a; font-family: Inter, sans-serif; color: #f4f1e8; overflow: hidden; }
`;

function stepScene(s, dur) {
  const c = camFor(s.rect);
  const drift = 1.05, dk = +(c.k * drift).toFixed(4);
  const dx = +(STAGE_W / 2 - (STAGE_W / 2 - c.x) * drift).toFixed(1), dy = +(STAGE_H / 2 - (STAGE_H / 2 - c.y) * drift).toFixed(1);
  const [x, y, w, h] = s.rect;
  const p = s.id;
  const clickX = x + w * 0.5, clickY = y + h * 0.5;
  const hasAfter = !!s.after;
  return `<template>
  <style>
${sharedStyle}
    #${p}-bg { position: absolute; inset: 0; background: radial-gradient(1200px 700px at 30% 40%, #1d4630 0%, #10241a 70%); }
    #${p}-stage { position: absolute; left: 80px; top: 171px; width: ${STAGE_W}px; height: ${STAGE_H}px; border-radius: 18px; overflow: hidden; background: #f5f5f0; box-shadow: 0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08); }
    #${p}-bar { position: absolute; left: 80px; top: 131px; width: ${STAGE_W}px; height: 40px; border-radius: 18px 18px 0 0; background: #e9e7df; display: flex; align-items: center; gap: 10px; padding: 0 18px; }
    #${p}-bar i { width: 12px; height: 12px; border-radius: 50%; background: #c9c6bb; display: block; }
    #${p}-bar span { margin-left: 18px; font-size: 16px; color: #6b6a63; background: #f7f6f1; border-radius: 8px; padding: 4px 16px; }
    #${p}-cam { position: absolute; left: 0; top: 0; width: ${IMG_W}px; height: ${IMG_H}px; transform-origin: 0 0; }
    #${p}-cam img { position: absolute; left: 0; top: 0; width: ${IMG_W}px; height: ${IMG_H}px; }
    #${p}-hl { position: absolute; left: ${x - 8}px; top: ${y - 8}px; width: ${w + 16}px; height: ${h + 16}px; border: 4px solid #f2b33d; border-radius: 14px; box-shadow: 0 0 0 9999px rgba(16,36,26,0.38), 0 0 24px rgba(242,179,61,0.7); }
    #${p}-cursor { position: absolute; left: 0; top: 0; width: 34px; height: 34px; }
    #${p}-ripple { position: absolute; left: ${clickX - 30}px; top: ${clickY - 30}px; width: 60px; height: 60px; border-radius: 50%; border: 4px solid #f2b33d; }
    #${p}-panel { position: absolute; left: 1310px; top: 171px; width: 540px; }
    #${p}-group { font-size: 28px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #8fd3a8; }
    #${p}-num { margin-top: 18px; width: 96px; height: 96px; border-radius: 26px; background: #f2b33d; color: #10241a; font-size: 56px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    #${p}-title { margin-top: 34px; font-size: 54px; line-height: 1.08; font-weight: 900; letter-spacing: -0.02em; }
    #${p}-body { margin-top: 24px; font-size: 30px; line-height: 1.35; color: #c8d6cc; }
  </style>
  <div id="root" data-composition-id="${p}" data-width="1920" data-height="1080">
    <div id="${p}-bg"></div>
    <div id="${p}-bar" data-layout-ignore><i></i><i></i><i></i><span>localhost/finanza/#capture</span></div>
    <div id="${p}-stage">
      <div id="${p}-cam">
        <img id="${p}-img-a" src="assets/img/${s.before}.png" alt="" />
        ${hasAfter ? `<img id="${p}-img-b" src="assets/img/${s.after}.png" alt="" />` : ''}
        <div id="${p}-hl"></div>
        <div id="${p}-ripple"></div>
        <svg id="${p}-cursor" viewBox="0 0 24 24"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#ffffff" stroke="#10241a" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div id="${p}-panel">
      <div id="${p}-group">${s.group}</div>
      <div id="${p}-num">${s.n}</div>
      <div id="${p}-title">${s.title}</div>
      <div id="${p}-body">${s.body}</div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    const P = "#${p}";
    tl.fromTo(P + "-stage, " + P + "-bar", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
    tl.fromTo(P + "-cam", { scale: ${c.k0}, x: 0, y: 0 }, { scale: ${c.k0}, x: 0, y: 0, duration: 0.01 }, 0);
    tl.to(P + "-cam", { scale: ${c.k}, x: ${c.x}, y: ${c.y}, duration: 1.1, ease: "power2.inOut" }, 0.9);
    tl.to(P + "-cam", { scale: ${dk}, x: ${dx}, y: ${dy}, duration: ${(dur - 2.5).toFixed(2)}, ease: "sine.inOut" }, 2.0);
    tl.fromTo(P + "-group", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.3);
    tl.fromTo(P + "-num", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.4);
    tl.fromTo(P + "-title", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.55);
    tl.fromTo(P + "-body", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.8);
    tl.fromTo(P + "-hl", { opacity: 0, scale: 1.08, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 2.0);
    tl.fromTo(P + "-cursor", { opacity: 0, x: ${clickX + 220}, y: ${clickY + 160} }, { opacity: 1, x: ${clickX + 220}, y: ${clickY + 160}, duration: 0.2 }, 2.1);
    tl.to(P + "-cursor", { x: ${clickX - 4}, y: ${clickY - 2}, duration: 0.8, ease: "power2.inOut" }, 2.3);
    tl.to(P + "-cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "10% 10%" }, 3.1);
    tl.fromTo(P + "-ripple", { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.6, ease: "power2.out" }, 3.1);
    tl.set(P + "-ripple", { opacity: 0 }, 0);
    ${hasAfter ? `tl.fromTo(P + "-img-b", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.inOut" }, 3.3);` : ''}
    tl.to(P + "-stage, " + P + "-bar, " + P + "-panel", { opacity: 0, duration: 0.35, ease: "power1.in" }, ${(dur - 0.4).toFixed(2)});
    window.__timelines["${p}"] = tl;
  </script>
</template>
`;
}

function titleScene(id, kicker, title, sub, dur) {
  const p = id;
  return `<template>
  <style>
${sharedStyle}
    #${p}-bg { position: absolute; inset: 0; background: radial-gradient(1100px 700px at 50% 45%, #1f5235 0%, #10241a 70%); }
    #${p}-wrap { position: absolute; left: 192px; right: 192px; top: 300px; text-align: center; }
    #${p}-logo { margin: 0 auto; width: 120px; height: 120px; border-radius: 30px; background: #b9e6a8; color: #10241a; font-size: 72px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    #${p}-kicker { margin-top: 40px; font-size: 30px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #8fd3a8; }
    #${p}-title { margin-top: 18px; font-size: 92px; line-height: 1.04; font-weight: 900; letter-spacing: -0.03em; }
    #${p}-sub { margin-top: 26px; font-size: 34px; color: #c8d6cc; }
  </style>
  <div id="root" data-composition-id="${p}" data-width="1920" data-height="1080">
    <div id="${p}-bg"></div>
    <div id="${p}-wrap">
      <div id="${p}-logo">f.</div>
      <div id="${p}-kicker">${kicker}</div>
      <div id="${p}-title">${title}</div>
      <div id="${p}-sub">${sub}</div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    const P = "#${p}";
    if ("${p}" !== "intro") tl.fromTo(P + "-logo", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.1);
    if ("${p}" !== "intro") tl.fromTo(P + "-kicker", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.35);
    if ("${p}" !== "intro") tl.fromTo(P + "-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.5);
    tl.fromTo(P + "-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.8);
    tl.fromTo(P + "-wrap", { scale: 1 }, { scale: 1.05, duration: ${dur}, ease: "none" }, 0);
    tl.to(P + "-wrap", { opacity: 0, duration: 0.35, ease: "power1.in" }, ${dur - 0.4});
    window.__timelines["${p}"] = tl;
  </script>
</template>
`;
}

const scenes = [];
let t = 0;
const add = (id, dur, html) => { writeFileSync(`compositions/${id}.html`, html); scenes.push({ id, start: +t.toFixed(2), dur }); t += dur; };

{ const d = durFor('intro', 4.5); add('intro', d, titleScene('intro', 'Manual de usuario · Finanza', 'Registra gastos e ingresos', 'Paso a paso', d)); }
for (const s of steps) {
  if (s.id === 's8') { const d = durFor('mid', 3); add('mid', d, titleScene('mid', 'Ahora', 'Registra un ingreso', 'Es el mismo formulario', d)); }
  const d = durFor(s.id, STEP_DUR);
  add(s.id, d, stepScene(s, d));
}
{ const d = durFor('outro', 4.5) + 0.8; add('outro', d, titleScene('outro', 'Listo', 'Tus números, en orden', 'Gastos e ingresos se reflejan al instante en tu resumen', d)); }

const total = +t.toFixed(2);
const clicks = steps.map((s) => scenes.find((x) => x.id === s.id).start + 3.1);

const hosts = scenes.map((s, i) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`).join('\n');
const audios = clicks.map((c, i) => `      <audio id="click-${i + 1}" class="clip" src="assets/audio/click.mp3" data-start="${c.toFixed(2)}" data-duration="0.4" data-track-index="2" data-volume="0.45"></audio>`).join('\n');
const voices = scenes.map((sc) => `      <audio id="vo-${sc.id}" class="clip" src="assets/voice/${sc.id}.wav" data-start="${(sc.start + VO_LEAD).toFixed(2)}" data-duration="${voDur(sc.id).toFixed(2)}" data-track-index="3" data-volume="1"></audio>`).join('\n');

writeFileSync('index.html', `<!doctype html>
<html lang="es" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #10241a; }
      #root { width: 100%; height: 100%; font-family: Inter, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${hosts}
${audios}
${voices}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`);
console.log('total', total, 'scenes', scenes.length);
