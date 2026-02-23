/* ============================================
   Particle Portfolio - Main Script
   ============================================ */

(function () {
  'use strict';

  // ---- Theme Definitions ----
  const THEMES = {
    navy: {
      bg: '#0a0a1a', bgAlt: '#111128', accent: '#667eea', accentAlt: '#764ba2',
      textMuted: '#8888aa', border: 'rgba(255,255,255,0.08)',
      particle: [140, 160, 255], line: [102, 126, 234],
      globe: [80, 120, 230], globeContinent: [100, 180, 255], globeFill: [60, 120, 200],
      ocean: [[20, 40, 80], [10, 20, 50]], gridLine: [80, 130, 220],
    },
    emerald: {
      bg: '#0a1a12', bgAlt: '#112820', accent: '#34d399', accentAlt: '#059669',
      textMuted: '#7aaa96', border: 'rgba(200,255,230,0.08)',
      particle: [100, 220, 170], line: [52, 211, 153],
      globe: [50, 180, 130], globeContinent: [80, 220, 170], globeFill: [40, 150, 110],
      ocean: [[10, 50, 35], [5, 30, 20]], gridLine: [50, 180, 130],
    },
    rose: {
      bg: '#1a0a14', bgAlt: '#281120', accent: '#f472b6', accentAlt: '#db2777',
      textMuted: '#aa7a96', border: 'rgba(255,200,230,0.08)',
      particle: [255, 140, 190], line: [244, 114, 182],
      globe: [200, 80, 150], globeContinent: [255, 130, 190], globeFill: [180, 60, 130],
      ocean: [[50, 15, 35], [30, 8, 20]], gridLine: [200, 80, 150],
    },
    amber: {
      bg: '#1a150a', bgAlt: '#282010', accent: '#fbbf24', accentAlt: '#d97706',
      textMuted: '#aa9a7a', border: 'rgba(255,230,180,0.08)',
      particle: [255, 200, 100], line: [251, 191, 36],
      globe: [200, 160, 50], globeContinent: [255, 200, 100], globeFill: [180, 140, 40],
      ocean: [[50, 40, 15], [30, 25, 8]], gridLine: [200, 160, 50],
    },
    cyan: {
      bg: '#0a1a1a', bgAlt: '#102828', accent: '#22d3ee', accentAlt: '#0891b2',
      textMuted: '#7aaaaa', border: 'rgba(200,255,255,0.08)',
      particle: [100, 220, 240], line: [34, 211, 238],
      globe: [30, 180, 210], globeContinent: [80, 210, 240], globeFill: [30, 160, 200],
      ocean: [[10, 40, 50], [5, 25, 35]], gridLine: [30, 180, 210],
    },
  };

  let currentTheme = THEMES.navy;

  // ---- Particle Class ----
  class Particle {
    constructor(canvasW, canvasH) {
      this.reset(canvasW, canvasH);
    }

    reset(canvasW, canvasH) {
      this.x = Math.random() * canvasW;
      this.y = Math.random() * canvasH;
      const speed = Math.random() * 0.4 + 0.15;
      const angle = Math.random() * Math.PI * 2;
      this.baseVx = Math.cos(angle) * speed;
      this.baseVy = Math.sin(angle) * speed;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.3;
      // Per-particle wobble phase for organic floating motion
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.wobbleAmp = Math.random() * 0.15 + 0.08;
    }

    update(canvasW, canvasH, mouse, mouseRadius) {
      // Mouse attraction (pull towards cursor)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouseRadius * mouseRadius;

        if (distSq < radiusSq && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (mouseRadius - dist) / mouseRadius;
          this.vx += (dx / dist) * force * 0.12;
          this.vy += (dy / dist) * force * 0.12;
        }
      }

      // Wobble for organic floating feel
      this.wobblePhase += this.wobbleSpeed;
      this.vx += Math.sin(this.wobblePhase) * this.wobbleAmp * 0.1;
      this.vy += Math.cos(this.wobblePhase * 0.7) * this.wobbleAmp * 0.1;

      // Gently steer back towards base drift so particles never stop
      this.vx += (this.baseVx - this.vx) * 0.01;
      this.vy += (this.baseVy - this.vy) * 0.01;

      // Damping (lighter so momentum persists)
      this.vx *= 0.995;
      this.vy *= 0.995;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < 0) this.x = canvasW;
      if (this.x > canvasW) this.x = 0;
      if (this.y < 0) this.y = canvasH;
      if (this.y > canvasH) this.y = 0;
    }

    draw(ctx) {
      const c = currentTheme.particle;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${this.alpha})`;
      ctx.fill();
    }
  }

  // ---- Particle System ----
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null };
      this.mouseRadius = 150;
      this.connectionDistance = 120;
      this.animationId = null;

      this.resize();
      this.createParticles();
      this.bindEvents();
      this.animate();
    }

    getParticleCount() {
      const area = this.canvas.width * this.canvas.height;
      const isMobile = window.innerWidth < 768;
      const base = isMobile ? 40 : 80;
      const scaled = Math.floor(area / (isMobile ? 15000 : 10000));
      return Math.min(Math.max(base, scaled), isMobile ? 60 : 150);
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      const count = this.getParticleCount();
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.canvas.width, this.canvas.height));
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.createParticles();
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      // Touch support
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          this.mouse.x = e.touches[0].clientX;
          this.mouse.y = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    drawConnections() {
      const distSqMax = this.connectionDistance * this.connectionDistance;
      const particles = this.particles;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < distSqMax) {
            const alpha = 1 - Math.sqrt(distSq) / this.connectionDistance;
            this.ctx.beginPath();
            this.ctx.moveTo(particles[i].x, particles[i].y);
            this.ctx.lineTo(particles[j].x, particles[j].y);
            const lc = currentTheme.line;
            this.ctx.strokeStyle = `rgba(${lc[0]}, ${lc[1]}, ${lc[2]}, ${alpha * 0.3})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
          }
        }
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {
        p.update(this.canvas.width, this.canvas.height, this.mouse, this.mouseRadius);
        p.draw(this.ctx);
      }

      this.drawConnections();
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  // ---- Globe with continent outlines ----
  class Globe {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.rotation = 0;
      this.tilt = 0.4;
      this.autoSpeed = 0.003;
      this.dragSpeedX = 0;      // horizontal drag velocity
      this.dragSpeedY = 0;      // vertical drag velocity
      this.dragging = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.hovered = false;
      this.glowIntensity = 0;   // animated glow when hovered
      this.moving = false;       // position drag mode
      this.posX = window.innerWidth / 2;
      this.posY = window.innerHeight / 2;
      this.continents = this.getContinentData();
      this.resize();
      this.updatePosition();
      this.bindEvents();
      this.animate();
      window.addEventListener('resize', () => {
        this.resize();
        // Keep globe within viewport after resize
        this.posX = Math.min(this.posX, window.innerWidth);
        this.posY = Math.min(this.posY, window.innerHeight);
        this.updatePosition();
      });
    }

    updatePosition() {
      const container = this.canvas.parentElement;
      const w = this.canvas.offsetWidth;
      const h = this.canvas.offsetHeight;
      container.style.left = (this.posX - w / 2) + 'px';
      container.style.top = (this.posY - h / 2) + 'px';
    }

    bindEvents() {
      const c = this.canvas;
      c.style.pointerEvents = 'auto';
      c.style.cursor = 'grab';

      // Mouse enter/leave for glow
      c.addEventListener('mouseenter', () => { this.hovered = true; });
      c.addEventListener('mouseleave', () => {
        this.hovered = false;
        if (!this.moving) this.dragging = false;
      });

      // Mousedown: Shift = move position, normal = rotate
      c.addEventListener('mousedown', (e) => {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        if (e.shiftKey) {
          this.moving = true;
          c.style.cursor = 'move';
        } else {
          this.dragging = true;
          c.style.cursor = 'grabbing';
        }
      });

      window.addEventListener('mousemove', (e) => {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        if (this.moving) {
          this.posX += dx;
          this.posY += dy;
          this.updatePosition();
        } else if (this.dragging) {
          this.dragSpeedX = dx * 0.008;
          this.dragSpeedY = dy * 0.008;
        }
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.dragging = false;
        this.moving = false;
        c.style.cursor = 'grab';
      });

      // Double-click to reset position to center
      c.addEventListener('dblclick', () => {
        this.posX = window.innerWidth / 2;
        this.posY = window.innerHeight / 2;
        this.updatePosition();
      });

      // Touch: 1 finger = rotate, 2 fingers = move position
      c.addEventListener('touchstart', (e) => {
        if (e.touches.length >= 2) {
          this.moving = true;
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          this.lastMouseX = midX;
          this.lastMouseY = midY;
        } else {
          this.dragging = true;
          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.moving && e.touches.length >= 2) {
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          this.posX += midX - this.lastMouseX;
          this.posY += midY - this.lastMouseY;
          this.updatePosition();
          this.lastMouseX = midX;
          this.lastMouseY = midY;
        } else if (this.dragging && e.touches.length) {
          const dx = e.touches[0].clientX - this.lastMouseX;
          const dy = e.touches[0].clientY - this.lastMouseY;
          this.dragSpeedX = dx * 0.008;
          this.dragSpeedY = dy * 0.008;
          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.dragging = false;
        this.moving = false;
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = rect.width;
      this.h = rect.height;
      this.cx = this.w / 2;
      this.cy = this.h / 2;
      this.radius = Math.min(this.w, this.h) * 0.42;
    }

    // Convert degrees to radians
    d2r(deg) { return deg * Math.PI / 180; }

    // Lat/lon (degrees) to 3D unit sphere
    latLon(lat, lon) {
      const la = this.d2r(lat);
      const lo = this.d2r(lon);
      return {
        x: Math.cos(la) * Math.cos(lo),
        y: Math.sin(la),
        z: Math.cos(la) * Math.sin(lo),
      };
    }

    project(p3) {
      const cosR = Math.cos(this.rotation);
      const sinR = Math.sin(this.rotation);
      const x = p3.x * cosR - p3.z * sinR;
      const z = p3.x * sinR + p3.z * cosR;
      const cosT = Math.cos(this.tilt);
      const sinT = Math.sin(this.tilt);
      return {
        px: this.cx + x * this.radius,
        py: this.cy - (p3.y * cosT - z * sinT) * this.radius,
        z: p3.y * sinT + z * cosT,
      };
    }

    getContinentData() {
      // Simplified continent outlines [lat, lon] in degrees
      return [
        // North America
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [50,-125],[55,-130],[60,-140],[64,-153],[70,-157],[71,-155],[70,-140],[68,-135],
          [62,-130],[58,-125],[50,-125],
        ]},
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [50,-125],[58,-125],[62,-130],[68,-135],[70,-140],[72,-130],[75,-95],[72,-78],
          [68,-65],[60,-64],[52,-56],[47,-53],[44,-59],[42,-65],[45,-67],[47,-70],
          [30,-82],[25,-80],[25,-90],[30,-90],[30,-105],[35,-118],[40,-124],[48,-125],[50,-125],
        ]},
        // Central America
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [25,-80],[20,-87],[18,-88],[15,-84],[14,-87],[12,-86],[10,-84],[8,-80],
          [8,-77],[10,-75],[10,-80],[18,-78],[20,-76],[22,-78],[25,-80],
        ]},
        // South America
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [12,-70],[10,-72],[8,-77],[5,-77],[2,-80],[-5,-81],[-6,-78],[-15,-75],
          [-18,-70],[-23,-70],[-30,-65],[-35,-57],[-40,-62],[-45,-66],[-50,-70],
          [-53,-70],[-55,-67],[-55,-64],[-50,-65],[-42,-63],[-35,-55],[-28,-49],
          [-22,-41],[-12,-37],[-5,-35],[0,-50],[5,-60],[8,-62],[10,-67],[12,-70],
        ]},
        // Europe
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [36,-6],[38,-10],[43,-9],[44,-2],[47,-2],[48,0],[46,2],[44,3],
          [43,5],[43,10],[42,13],[40,15],[38,16],[37,15],[40,25],[42,28],
          [41,29],[44,28],[46,30],[48,22],[50,20],[52,14],[54,10],[55,8],
          [57,7],[58,5],[59,5],[60,5],[62,5],[63,10],[68,15],[70,20],[71,26],
          [70,28],[64,28],[60,25],[58,28],[60,30],[62,32],[65,40],[68,45],
          [70,50],[70,60],[65,58],[60,50],[55,45],[50,40],[48,40],[46,35],
          [44,35],[42,30],[38,24],[35,25],[36,22],[40,20],[38,15],[36,13],
          [37,10],[38,5],[37,0],[36,-6],
        ]},
        // Africa
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [35,-6],[36,0],[37,10],[33,10],[32,13],[35,25],[30,32],[25,34],
          [20,38],[15,42],[12,44],[10,42],[5,42],[0,42],[-2,40],[-5,39],
          [-10,40],[-15,40],[-20,35],[-25,35],[-30,32],[-33,27],[-34,23],
          [-34,18],[-30,15],[-25,14],[-20,12],[-15,12],[-10,14],[-5,10],
          [0,10],[5,2],[5,-5],[10,-15],[15,-17],[20,-17],[25,-15],[30,-10],
          [33,-8],[35,-6],
        ]},
        // Asia (simplified)
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [42,30],[45,35],[48,40],[50,40],[55,45],[60,50],[65,58],[70,60],
          [70,70],[72,80],[72,100],[70,130],[68,140],[65,142],[60,140],
          [55,138],[50,140],[45,142],[42,135],[38,130],[35,128],[32,132],
          [28,130],[25,122],[23,120],[22,114],[20,110],[18,108],[15,108],
          [12,105],[10,100],[8,98],[5,98],[0,104],[-5,106],[-8,110],
          [-8,115],[-6,120],[0,115],[5,108],[10,108],[15,110],[22,115],
          [25,120],[28,122],[30,120],[25,105],[23,100],[20,95],[22,90],
          [24,88],[22,80],[20,73],[24,70],[28,65],[30,55],[32,48],[35,45],
          [38,38],[40,32],[42,30],
        ]},
        // Japan
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [45,142],[43,145],[40,140],[35,137],[33,132],[34,130],[36,134],
          [38,136],[40,140],[42,140],[44,143],[45,142],
        ]},
        // Australia
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [-12,130],[-14,127],[-16,123],[-22,114],[-26,114],[-30,115],
          [-32,116],[-35,117],[-35,120],[-35,138],[-38,145],[-38,148],
          [-35,150],[-30,153],[-25,153],[-20,149],[-16,146],[-13,142],
          [-12,137],[-12,132],[-12,130],
        ]},
        // Indonesia (simplified)
        { color: 'rgba(100, 180, 255, ALPHA)', fill: 'rgba(60, 120, 200, FILL)', pts: [
          [-5,106],[-7,106],[-8,110],[-8,115],[-6,118],[-7,120],[-5,117],
          [-4,114],[-5,110],[-5,106],
        ]},
      ];
    }

    drawGlobe() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);

      // Atmosphere glow (intensifies on hover)
      const gi = this.glowIntensity;
      const gc = currentTheme.globe;
      const glow = ctx.createRadialGradient(
        this.cx, this.cy, this.radius * 0.85,
        this.cx, this.cy, this.radius * 1.35
      );
      glow.addColorStop(0, `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${0.08 + gi * 0.12})`);
      glow.addColorStop(0.5, `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${0.03 + gi * 0.06})`);
      glow.addColorStop(1, `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.w, this.h);

      // Ocean sphere
      const oc = currentTheme.ocean;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
      const oceanGrad = ctx.createRadialGradient(
        this.cx - this.radius * 0.3, this.cy - this.radius * 0.3, 0,
        this.cx, this.cy, this.radius
      );
      oceanGrad.addColorStop(0, `rgba(${oc[0][0]}, ${oc[0][1]}, ${oc[0][2]}, 0.6)`);
      oceanGrad.addColorStop(1, `rgba(${oc[1][0]}, ${oc[1][1]}, ${oc[1][2]}, 0.4)`);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Sphere edge highlight
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${0.2 + gi * 0.25})`;
      ctx.lineWidth = 1.5 + gi * 1;
      ctx.stroke();

      // Grid lines (latitude)
      for (let lat = -60; lat <= 60; lat += 30) {
        this.drawLatLine(ctx, lat, 60);
      }
      // Grid lines (longitude)
      for (let lon = 0; lon < 360; lon += 30) {
        this.drawLonLine(ctx, lon, 60);
      }

      // Draw continents
      for (const cont of this.continents) {
        this.drawContinent(ctx, cont);
      }

      // Specular highlight
      const spec = ctx.createRadialGradient(
        this.cx - this.radius * 0.35, this.cy - this.radius * 0.35, 0,
        this.cx - this.radius * 0.35, this.cy - this.radius * 0.35, this.radius * 0.6
      );
      spec.addColorStop(0, 'rgba(220, 230, 255, 0.08)');
      spec.addColorStop(1, 'rgba(220, 230, 255, 0)');
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    drawContinent(ctx, cont) {
      const pts = cont.pts.map(([lat, lon]) => {
        const p3 = this.latLon(lat, lon);
        return this.project(p3);
      });

      // Split into segments that are on the front face
      let segments = [];
      let current = [];
      for (const p of pts) {
        if (p.z > -0.05) {
          current.push(p);
        } else {
          if (current.length > 1) segments.push(current);
          current = [];
        }
      }
      if (current.length > 1) segments.push(current);

      for (const seg of segments) {
        // Fill
        ctx.beginPath();
        ctx.moveTo(seg[0].px, seg[0].py);
        for (let i = 1; i < seg.length; i++) {
          ctx.lineTo(seg[i].px, seg[i].py);
        }
        ctx.closePath();
        const avgZ = seg.reduce((s, p) => s + p.z, 0) / seg.length;
        const fillAlpha = Math.max(0.02, avgZ * 0.12 + 0.06);
        const fc = currentTheme.globeFill;
        ctx.fillStyle = `rgba(${fc[0]}, ${fc[1]}, ${fc[2]}, ${fillAlpha.toFixed(3)})`;
        ctx.fill();

        // Outline
        ctx.beginPath();
        ctx.moveTo(seg[0].px, seg[0].py);
        for (let i = 1; i < seg.length; i++) {
          ctx.lineTo(seg[i].px, seg[i].py);
        }
        const strokeAlpha = Math.max(0.1, avgZ * 0.5 + 0.3);
        const cc = currentTheme.globeContinent;
        ctx.strokeStyle = `rgba(${cc[0]}, ${cc[1]}, ${cc[2]}, ${strokeAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    drawLatLine(ctx, latDeg, segments) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const lon = (360 / segments) * i;
        pts.push(this.project(this.latLon(latDeg, lon)));
      }
      ctx.beginPath();
      let drawing = false;
      for (const p of pts) {
        if (p.z > -0.05) {
          if (!drawing) { ctx.moveTo(p.px, p.py); drawing = true; }
          else ctx.lineTo(p.px, p.py);
        } else {
          drawing = false;
        }
      }
      const gl = currentTheme.gridLine;
      ctx.strokeStyle = `rgba(${gl[0]}, ${gl[1]}, ${gl[2]}, 0.08)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    drawLonLine(ctx, lonDeg, segments) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const lat = -90 + (180 / segments) * i;
        pts.push(this.project(this.latLon(lat, lonDeg)));
      }
      ctx.beginPath();
      let drawing = false;
      for (const p of pts) {
        if (p.z > -0.05) {
          if (!drawing) { ctx.moveTo(p.px, p.py); drawing = true; }
          else ctx.lineTo(p.px, p.py);
        } else {
          drawing = false;
        }
      }
      const gl = currentTheme.gridLine;
      ctx.strokeStyle = `rgba(${gl[0]}, ${gl[1]}, ${gl[2]}, 0.08)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    animate() {
      // Smooth glow transition
      const target = this.hovered ? 1 : 0;
      this.glowIntensity += (target - this.glowIntensity) * 0.08;

      if (this.dragging) {
        this.rotation += this.dragSpeedX;
        this.tilt -= this.dragSpeedY;
        this.dragSpeedX *= 0.5;
        this.dragSpeedY *= 0.5;
      } else {
        this.dragSpeedX *= 0.95;
        this.dragSpeedY *= 0.95;
        this.rotation += this.autoSpeed + this.dragSpeedX;
        this.tilt -= this.dragSpeedY;
      }

      this.drawGlobe();
      requestAnimationFrame(() => this.animate());
    }
  }

  // ---- Scroll-based fade-in ----
  function initFadeIn() {
    const elements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ---- Header scroll effect ----
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ---- Mobile nav toggle ----
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
      });
    });
  }

  // ---- Contact Form (mailto) ----
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const modal = document.getElementById('confirm-modal');
    const modalBody = document.getElementById('confirm-body');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm');

    const labels = {
      name: 'お名前',
      company: '会社名',
      email: 'メールアドレス',
      subject: '件名',
      message: 'メッセージ',
    };

    // Show modal on submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modalBody.innerHTML = '';
      const fields = ['name', 'company', 'email', 'subject', 'message'];
      for (const key of fields) {
        const val = form.querySelector(`#${key}`).value.trim();
        if (!val) continue;
        const dt = document.createElement('dt');
        dt.textContent = labels[key];
        const dd = document.createElement('dd');
        dd.textContent = val;
        modalBody.appendChild(dt);
        modalBody.appendChild(dd);
      }
      modal.classList.add('open');
    });

    // Cancel
    btnCancel.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Confirm and send
    btnConfirm.addEventListener('click', () => {
      modal.classList.remove('open');
      const btn = form.querySelector('.form-submit');
      btn.textContent = '送信中...';
      btn.disabled = true;

      const data = new FormData(form);

      fetch('https://formspree.io/f/mqedgble', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      })
        .then((res) => {
          if (res.ok) {
            form.reset();
            btn.textContent = '送信しました！';
            setTimeout(() => {
              btn.textContent = '送信する';
              btn.disabled = false;
            }, 3000);
          } else {
            throw new Error('送信に失敗しました');
          }
        })
        .catch(() => {
          btn.textContent = '送信に失敗しました';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = '送信する'; }, 3000);
        });
    });
  }

  // ---- Color Palette ----
  function initColorPalette() {
    const buttons = document.querySelectorAll('.color-btn');
    const root = document.documentElement;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeName = btn.dataset.theme;
        const theme = THEMES[themeName];
        if (!theme) return;

        currentTheme = theme;

        // Update CSS variables
        root.style.setProperty('--color-bg', theme.bg);
        root.style.setProperty('--color-bg-alt', theme.bgAlt);
        root.style.setProperty('--color-accent', theme.accent);
        root.style.setProperty('--color-accent-alt', theme.accentAlt);
        root.style.setProperty('--color-text-muted', theme.textMuted);
        root.style.setProperty('--color-border', theme.border);

        // Update active button
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    new ParticleSystem(canvas);
    const globeCanvas = document.getElementById('globe-canvas');
    if (globeCanvas) new Globe(globeCanvas);
    initFadeIn();
    initHeaderScroll();
    initMobileNav();
    initColorPalette();
    initContactForm();
  });
})();
