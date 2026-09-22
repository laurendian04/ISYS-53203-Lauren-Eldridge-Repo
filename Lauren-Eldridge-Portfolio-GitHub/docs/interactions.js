(() => {
  const root = document.documentElement;
  const intro = document.getElementById('site-intro');
  const skip = document.getElementById('intro-skip');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introFinished = false;

  const setIntroState = (active) => {
    document.body.style.overflow = active ? 'hidden' : '';
    for (const element of document.querySelectorAll('.site-header, main, .site-footer')) {
      if (active) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    }
  };

  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    root.classList.add('intro-done');
    setIntroState(false);
    try { sessionStorage.setItem('lauren-intro-seen', '1'); } catch (error) {}
  };

  if (intro && !root.classList.contains('intro-seen') && !reduceMotion) {
    setIntroState(true);
    skip?.addEventListener('click', finishIntro);
    intro.addEventListener('animationend', (event) => {
      if (event.animationName === 'intro-exit') finishIntro();
    });
    window.setTimeout(finishIntro, 3900);
  } else {
    finishIntro();
  }

  const revealGroups = [
    ['.section-heading, .roots-intro', 'reveal-left'],
    ['.hero-visual, .about-side', 'reveal-right'],
    ['.roots-card, .work-card, .principle, .profile-copy, .contact-inner', '']
  ];

  const revealElements = [];
  for (const [selector, direction] of revealGroups) {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('reveal-target');
      if (direction) element.classList.add(direction);
      revealElements.push(element);
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -7% 0px' });
    revealElements.forEach((element) => observer.observe(element));
  }

  const progress = document.getElementById('scroll-progress-bar');
  let progressTicking = false;
  const updateProgress = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = distance > 0 ? Math.min(1, window.scrollY / distance) : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    progressTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (progressTicking) return;
    progressTicking = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
})();
