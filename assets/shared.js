(function () {
  const root = document.documentElement;
  const body = document.body;
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  const mobileThemeIcon = document.getElementById('mobileThemeIcon');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');
  const mobileHomeToggle = document.getElementById('mobileHomeToggle');
  const mobileHomeDropdown = document.getElementById('mobileHomeDropdown');
  const downloadPortfolio = document.getElementById('downloadPortfolio');
  const mobileDownloadPortfolio = document.getElementById('mobileDownloadPortfolio');
  const yearEl = document.getElementById('year');
  const animationTargets = document.querySelectorAll('.animate-on-scroll');

  const updateThemeIcon = () => {
    if (themeIcon) {
      const isDark = root.classList.contains('dark');
      themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
    if (mobileThemeIcon) {
      const isDark = root.classList.contains('dark');
      mobileThemeIcon.textContent = isDark ? '☀️' : '🌙';
    }
  };

  const applyTheme = (theme, { persist = true } = {}) => {
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('bg-gray-950', 'text-gray-100');
    } else {
      root.classList.remove('dark');
      body.classList.remove('bg-gray-950', 'text-gray-100');
    }

    if (persist) {
      localStorage.setItem('theme', theme);
    }

    updateThemeIcon();
  };

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    applyTheme(storedTheme, { persist: false });
  } else {
    applyTheme(prefersDarkScheme.matches ? 'dark' : 'light', { persist: false });
  }

  prefersDarkScheme.addEventListener('change', (event) => {
    if (localStorage.getItem('theme')) return;
    applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  });

  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  mobileThemeToggle?.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Mobile menu toggle
  mobileMenuToggle?.addEventListener('click', () => {
    if (mobileMenu) {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        if (menuIcon) menuIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    }
  });

  // Mobile home dropdown toggle
  mobileHomeToggle?.addEventListener('click', () => {
    if (mobileHomeDropdown) {
      mobileHomeDropdown.classList.toggle('hidden');
    }
  });

  // Close mobile menu when clicking outside or on a link
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuToggle?.contains(e.target)) {
      if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    }
  });

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  downloadPortfolio?.addEventListener('click', () => {
    window.print();
  });

  mobileDownloadPortfolio?.addEventListener('click', () => {
    window.print();
  });

  if (animationTargets.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    animationTargets.forEach((el) => observer.observe(el));
  }
})();

