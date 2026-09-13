(function () {
  const cv = document.getElementById('lam');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');

  const W = 420, D = 260, C = 0.866, K = 0.42;
  const WIDE   = { LW: 1440, OX: 483, OY: 172, EXP: 135, labels: true  };
  const NARROW = { LW:  760, OX: 311, OY: 142, EXP: 105, labels: false };
  let V = WIDE;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // drawn bottom of stack upward, so upper planes occlude lower ones
  const layers = [
    { k:  1, th: 8, fill:'rgba(239,239,239,.05)', stroke:'rgba(239,239,239,.34)', sym:'Poly', name:'BACKSHEET' },
    { k: .5, th: 3, fill:'rgba(239,239,239,.03)', stroke:'rgba(239,239,239,.40)', sym:'Cu',   name:'COPPER BUSBAR', ribbons:true },
    { k:  0, th: 6, fill:'#101119',               stroke:'rgba(239,239,239,.34)', sym:'Si',   name:'SILICON CELLS', cells:true },
    { k:-.5, th: 4, fill:'rgba(239,239,239,.07)', stroke:'rgba(239,239,239,.46)', sym:'SiO₂', name:'GLASS' },
    { k: -1, th:10, fill:'rgba(239,239,239,.12)', stroke:'#EFEFEF',               sym:'Al',   name:'ALUMINIUM FRAME', frame:true }
  ];

  const P = (u, v, dy) => [V.OX + (u - v) * C, V.OY + (u + v) * K + dy];

  function quad(u0, v0, u1, v1, dy) {
    const a = P(u0,v0,dy), b = P(u1,v0,dy), c = P(u1,v1,dy), d = P(u0,v1,dy);
    ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]); ctx.closePath();
  }

  function plane(L, t) {
    const dy = L.k * V.EXP * t;
    const d2 = P(0,D,dy), c2 = P(W,D,dy), b = P(W,0,dy);

    // the two thickness faces this projection exposes
    ctx.beginPath();
    ctx.moveTo(d2[0],d2[1]); ctx.lineTo(c2[0],c2[1]); ctx.lineTo(c2[0],c2[1]+L.th); ctx.lineTo(d2[0],d2[1]+L.th); ctx.closePath();
    ctx.moveTo(c2[0],c2[1]); ctx.lineTo(b[0],b[1]);   ctx.lineTo(b[0],b[1]+L.th);   ctx.lineTo(c2[0],c2[1]+L.th); ctx.closePath();
    ctx.fillStyle = '#191A23'; ctx.fill();
    ctx.strokeStyle = L.stroke; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath();
    quad(0, 0, W, D, dy);
    if (L.frame) quad(17, 17, W - 17, D - 17, dy);
    ctx.fillStyle = L.fill;
    ctx.fill(L.frame ? 'evenodd' : 'nonzero');
    ctx.lineWidth = L.frame ? 1.6 : 1.1;
    ctx.stroke();

    if (L.cells) {
      const cu = W / 10, cw = D / 6, g = 3.5;
      ctx.fillStyle = '#191A23'; ctx.strokeStyle = 'rgba(239,239,239,.26)'; ctx.lineWidth = .9;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        quad(i*cu + g, j*cw + g, (i+1)*cu - g, (j+1)*cw - g, dy);
        ctx.fill(); ctx.stroke();
      }
    }

    if (L.ribbons) {
      ctx.strokeStyle = 'rgba(239,239,239,.55)'; ctx.lineWidth = 1.8;
      for (let i = 0; i <= 10; i++) {
        const a = P(i*W/10, 0, dy), z = P(i*W/10, D, dy);
        ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(z[0],z[1]); ctx.stroke();
      }
    }
  }

  function callout(L, t, alpha) {
    const b = P(W, 0, L.k * V.EXP * t);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(239,239,239,.26)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(b[0] + 14, b[1]); ctx.lineTo(V.OX + 446, b[1]); ctx.stroke();
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#EFEFEF';
    ctx.font = '600 26px Archivo, "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(L.sym, V.OX + 460, b[1] - 5);
    ctx.fillStyle = 'rgba(239,239,239,.46)';
    ctx.font = '500 13px Archivo, "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = '1.6px';
    ctx.fillText(L.name, V.OX + 460, b[1] + 17);
    ctx.letterSpacing = '0px';
    ctx.globalAlpha = 1;
  }

  let cur = reduce ? 1 : 0;

  function draw(t) {
    if (!cv.width) return;
    const s = cv.width / V.LW;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, V.LW, cv.height / s);
    layers.forEach(L => plane(L, t));
    if (!V.labels) return;
    const a = Math.max(0, Math.min(1, (t - .55) / .45));
    if (a > 0) layers.forEach(L => callout(L, t, a));
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    V = r.width < 700 ? NARROW : WIDE;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width  = Math.round(r.width  * dpr);
    cv.height = Math.round(r.height * dpr);
    draw(cur);
  }

  new ResizeObserver(resize).observe(cv);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(cur));

  if (!reduce) {
    const t0 = performance.now();
    requestAnimationFrame(function frame(now) {
      const p = Math.min(1, (now - t0) / 1500);
      cur = 1 - Math.pow(1 - p, 4);
      draw(cur);
      if (p < 1) requestAnimationFrame(frame);
    });
  }
})();
