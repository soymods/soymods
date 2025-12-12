(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const observers = document.querySelectorAll('[data-animate]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    observers.forEach((el) => io.observe(el));
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open');
    });
  }

  const releasePanel = document.querySelector('[data-release-target]');
  if (releasePanel) {
    fetchRelease(releasePanel);
  }

  async function fetchRelease(panel) {
    const status = panel.querySelector('[data-release-status]');
    const button = panel.querySelector('[data-release-button]');
    try {
      const res = await fetch('/api/releases/pathmind');
      if (!res.ok) throw new Error('Failed to load release');
      const data = await res.json();
      status.textContent = `Latest: v${data.version}`;
      if (data.jar_url) {
        button.textContent = `Download v${data.version}`;
        button.setAttribute('href', data.jar_url);
      } else if (data.html_url) {
        button.textContent = `View Release v${data.version}`;
        button.setAttribute('href', data.html_url);
      }
    } catch (err) {
      status.textContent = 'Latest: v1.0.0';
      button.textContent = 'Download v1.0.0';
      button.setAttribute('href', 'https://github.com/soymods/pathmind/releases/tag/v1.0.0');
    }
  }
})();
