/* ============ Shree Nakoda Jewels — Demo 2 (merged) ============ */

document.documentElement.classList.add('js');

const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

/* ---------- Header: on-dark while over the hero, solid/on-cream after ----------
   Same 40px threshold the live site uses for its header state. */
const hdr = document.getElementById('hdr');
const hero = document.querySelector('.hero');
addEventListener('scroll', () => {
  hdr.classList.toggle('solid', scrollY > (hero ? hero.offsetHeight - 80 : 40));
}, { passive: true });

/* ---------- Scroll reveals ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv, .rv-line').forEach(el => io.observe(el));

/* ---------- Full-bleed parallax ---------- */
const bleedImg = document.querySelector('.bleed img');
if (bleedImg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const band = bleedImg.closest('.bleed');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        bleedImg.style.transform = `translate3d(0, ${p * -34}px, 0) scale(1.10)`;
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ============================================================
   THREE.JS HERO — unchanged from the live site (js/main.js).
   Same gem/rings/particles scene; kept as-is since it's already tuned
   and this comparison is about layout/content, not the 3D piece itself.
   ============================================================ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined' || !hero) return;

  let width = hero.clientWidth, height = hero.clientHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0a08, 0.045);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 13);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);

  let rafId;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(rafId); }, false);
  canvas.addEventListener('webglcontextrestored', () => animate(), false);

  const key = new THREE.PointLight(0xd4af37, 2.4, 40);
  key.position.set(6, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0xfff2cf, 1.4, 40);
  rim.position.set(-8, -3, -6);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x30281a, 1.1));

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.22, emissive: 0x3a2c0a, emissiveIntensity: 0.25 });
  const goldMatSoft = new THREE.MeshStandardMaterial({ color: 0xe8cf7a, metalness: 0.85, roughness: 0.3 });

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.1, 0), goldMat);
  scene.add(gem);
  const gemInner = new THREE.Mesh(new THREE.OctahedronGeometry(1.35, 0), goldMatSoft);
  scene.add(gemInner);

  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.045, 12, 64), goldMat);
  ring1.rotation.x = Math.PI / 2.4;
  ringGroup.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.03, 12, 64), goldMatSoft);
  ring2.rotation.x = Math.PI / 1.7; ring2.rotation.y = Math.PI / 5;
  ringGroup.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(5.1, 0.02, 12, 64), goldMat);
  ring3.rotation.x = Math.PI / 3.2; ring3.rotation.y = -Math.PI / 6;
  ringGroup.add(ring3);

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
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xf4e6b8, size: 0.05, transparent: true, opacity: 0.65, sizeAttenuation: true }));
  scene.add(particles);

  const satGeo = new THREE.OctahedronGeometry(0.28, 0);
  const satellites = [];
  for (let i = 0; i < 5; i++) {
    const sat = new THREE.Mesh(satGeo, i % 2 === 0 ? goldMat : goldMatSoft);
    sat.userData = { angle: (i / 5) * Math.PI * 2, radius: 4.6 + Math.random() * 1.4, speed: 0.15 + Math.random() * 0.15, yOff: Math.random() * Math.PI * 2 };
    scene.add(sat);
    satellites.push(sat);
  }

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  window.addEventListener('resize', () => {
    width = hero.clientWidth; height = hero.clientHeight;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  const clock = new THREE.Clock();
  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    gem.rotation.x = t * 0.18; gem.rotation.y = t * 0.26;
    gemInner.rotation.x = -t * 0.22; gemInner.rotation.y = -t * 0.3;
    ringGroup.rotation.z = t * 0.12;
    ring1.rotation.z = t * 0.15; ring2.rotation.z = -t * 0.1; ring3.rotation.z = t * 0.08;
    particles.rotation.y = t * 0.02;
    satellites.forEach(sat => {
      const a = sat.userData.angle + t * sat.userData.speed;
      sat.position.x = Math.cos(a) * sat.userData.radius;
      sat.position.z = Math.sin(a) * sat.userData.radius - 4;
      sat.position.y = Math.sin(t * 0.6 + sat.userData.yOff) * 1.2;
      sat.rotation.x += 0.01; sat.rotation.y += 0.015;
    });
    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;
    camera.position.x = targetX * 2.2;
    camera.position.y = -targetY * 1.4;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  const heroIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { if (!rafId) animate(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    });
  }, { threshold: 0 });
  heroIO.observe(hero);
})();
