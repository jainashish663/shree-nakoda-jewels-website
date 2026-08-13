/* Shree Nakoda Jewels — design demo interactions */

// Marks that JS is alive; CSS falls back to showing everything if this never runs.
document.documentElement.classList.add('js');

const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

/* Header solid-on-scroll */
const hdr = document.getElementById('hdr');
addEventListener('scroll', () => {
  hdr.classList.toggle('solid', scrollY > 60);
}, { passive: true });

/* Scroll reveals — both the fade-up blocks and the masked headline lines */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.rv, .rv-line').forEach(el => io.observe(el));

/* Subtle parallax on the full-bleed band. Transform-only so it stays cheap,
   and skipped entirely when the user asks for reduced motion. */
const bleedImg = document.querySelector('.bleed > img');
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
