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

/* Hero parallax — subtle, transform-only so it stays cheap */
const heroImg = document.querySelector('.hero-media img');
if (heroImg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, innerHeight);
      heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
      ticking = false;
    });
  }, { passive: true });
}
