/* ============ Shree Nakoda Jewels — Interactions ============ */

/* Tells CSS that JS is alive. Without this class the stylesheet falls back to
   revealing all .reveal-up content, so a blocked/failed script can't blank the page. */
document.documentElement.classList.add('js-ready');

/* ---------- Preloader ----------
   Registered FIRST, and defensively, so nothing later in this file can throw and
   leave the full-screen overlay stuck covering the site. CSS also has a failsafe
   (see #preloader animation) in case this script never runs at all. */
(function () {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  const dismiss = () => pre.classList.add('done');
  window.addEventListener('load', () => setTimeout(dismiss, 500));
  // Don't let a slow or blocked resource trap the visitor behind the overlay.
  setTimeout(dismiss, 3000);
})();

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Header scroll state ---------- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
function setNavOpen(open) {
  mainNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}
navToggle.addEventListener('click', () => setNavOpen(!mainNav.classList.contains('open')));
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNavOpen(false)));

/* ---------- Cursor glow ---------- */
const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
}, { passive: true });

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------- Count-up stats ---------- */
const counters = document.querySelectorAll('.num[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(el => countIO.observe(el));

/* ---------- 3D tilt on images/cards ---------- */
function initTilt(selector, innerSelector, maxTilt = 8) {
  document.querySelectorAll(selector).forEach(card => {
    const inner = card.querySelector(innerSelector) || card;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  });
}
initTilt('.tilt-card', '.tilt-inner', 8);
initTilt('.card-3d', null, 6);

/* ============================================================
   THREE.JS HERO SCENE — floating gold gem + orbiting rings + dust
   ============================================================ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = document.querySelector('.hero');
  let width = hero.clientWidth, height = hero.clientHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0a08, 0.045);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 13);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(rafId);
  }, false);
  canvas.addEventListener('webglcontextrestored', () => {
    animate();
  }, false);

  // Lights
  const key = new THREE.PointLight(0xd4af37, 2.4, 40);
  key.position.set(6, 6, 8);
  scene.add(key);

  const rim = new THREE.PointLight(0xfff2cf, 1.4, 40);
  rim.position.set(-8, -3, -6);
  scene.add(rim);

  const ambient = new THREE.AmbientLight(0x30281a, 1.1);
  scene.add(ambient);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.9, roughness: 0.22, emissive: 0x3a2c0a, emissiveIntensity: 0.25
  });
  const goldMatSoft = new THREE.MeshStandardMaterial({
    color: 0xe8cf7a, metalness: 0.85, roughness: 0.3
  });

  // Central faceted gem
  const gemGeo = new THREE.OctahedronGeometry(2.1, 0);
  const gem = new THREE.Mesh(gemGeo, goldMat);
  scene.add(gem);

  const gemInnerGeo = new THREE.OctahedronGeometry(1.35, 0);
  const gemInner = new THREE.Mesh(gemInnerGeo, goldMatSoft);
  scene.add(gemInner);

  // Orbiting rings
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.045, 12, 64), goldMat);
  ring1.rotation.x = Math.PI / 2.4;
  ringGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.03, 12, 64), goldMatSoft);
  ring2.rotation.x = Math.PI / 1.7;
  ring2.rotation.y = Math.PI / 5;
  ringGroup.add(ring2);

  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(5.1, 0.02, 12, 64), goldMat);
  ring3.rotation.x = Math.PI / 3.2;
  ring3.rotation.y = -Math.PI / 6;
  ringGroup.add(ring3);

  // Particle dust (diamond specks)
  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 6 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi) - 4;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xf4e6b8, size: 0.05, transparent: true, opacity: 0.65, sizeAttenuation: true
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Small satellite gems
  const satGeo = new THREE.OctahedronGeometry(0.28, 0);
  const satellites = [];
  for (let i = 0; i < 5; i++) {
    const sat = new THREE.Mesh(satGeo, i % 2 === 0 ? goldMat : goldMatSoft);
    const angle = (i / 5) * Math.PI * 2;
    sat.userData = { angle, radius: 4.6 + Math.random() * 1.4, speed: 0.15 + Math.random() * 0.15, yOff: Math.random() * Math.PI * 2 };
    scene.add(sat);
    satellites.push(sat);
  }

  // Mouse parallax
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  function onResize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    gem.rotation.x = t * 0.18;
    gem.rotation.y = t * 0.26;
    gemInner.rotation.x = -t * 0.22;
    gemInner.rotation.y = -t * 0.3;

    ringGroup.rotation.z = t * 0.12;
    ring1.rotation.z = t * 0.15;
    ring2.rotation.z = -t * 0.1;
    ring3.rotation.z = t * 0.08;

    particles.rotation.y = t * 0.02;

    satellites.forEach(sat => {
      const a = sat.userData.angle + t * sat.userData.speed;
      sat.position.x = Math.cos(a) * sat.userData.radius;
      sat.position.z = Math.sin(a) * sat.userData.radius - 4;
      sat.position.y = Math.sin(t * 0.6 + sat.userData.yOff) * 1.2;
      sat.rotation.x += 0.01;
      sat.rotation.y += 0.015;
    });

    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;
    camera.position.x = targetX * 2.2;
    camera.position.y = -targetY * 1.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Pause rendering when hero is off-screen to save battery
  const heroIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) animate();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });
  heroIO.observe(hero);
})();
