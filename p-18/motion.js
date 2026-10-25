(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('entered');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.move').forEach(shape => observer.observe(shape));
  preference.addEventListener('change', () => {
    if (preference.matches) {
      observer.disconnect();
      document.querySelectorAll('.entered').forEach(shape => shape.classList.remove('entered'));
    }
  });
})();
