document.addEventListener('DOMContentLoaded', () => {

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- resume preview modal ---------- */
  const resumeBtn = document.getElementById('resumeBtn');
  const resumeModal = document.getElementById('resumeModal');
  const resumeFrame = document.getElementById('resumeFrame');
  const modalClose = document.getElementById('modalClose');

  if (resumeBtn && resumeModal && resumeFrame && modalClose) {
    const openResumeModal = (e) => {
      e.preventDefault();
      resumeFrame.src = resumeBtn.getAttribute('href');
      resumeModal.classList.add('open');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalClose.focus();
    };
    const closeResumeModal = () => {
      resumeModal.classList.remove('open');
      resumeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      resumeFrame.src = '';
      resumeBtn.focus();
    };

    resumeBtn.addEventListener('click', openResumeModal);
    modalClose.addEventListener('click', closeResumeModal);
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.classList.contains('open')) closeResumeModal();
    });
  }

  /* ---------- typewriter: name <-> role ---------- */
  const typedEl = document.getElementById('typedName');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedEl) {
    const phrases = ['Tebogo Nkadimeng.', 'I am a Data Analyst.'];
    const heroNameEl = typedEl.parentElement;

    // Shrinks the headline font-size (never below 14px) so the longest phrase
    // always fits on a single line, instead of wrapping.
    const fitHeroName = () => {
      const container = heroNameEl.closest('.hero-inner');
      if (!container) return;
      heroNameEl.style.fontSize = '';
      const computed = getComputedStyle(heroNameEl);
      const baseSize = parseFloat(computed.fontSize);
      const longest = phrases.reduce((a, b) => (a.length >= b.length ? a : b), '');

      const measurer = document.createElement('span');
      measurer.style.position = 'absolute';
      measurer.style.visibility = 'hidden';
      measurer.style.whiteSpace = 'nowrap';
      measurer.style.fontFamily = computed.fontFamily;
      measurer.style.fontWeight = computed.fontWeight;
      measurer.style.letterSpacing = computed.letterSpacing;
      measurer.style.fontSize = baseSize + 'px';
      measurer.textContent = longest + ' |'; // include room for the caret
      document.body.appendChild(measurer);
      const textWidth = measurer.offsetWidth;
      document.body.removeChild(measurer);

      const available = container.clientWidth;
      if (textWidth > available) {
        const scaled = Math.max((baseSize * available) / textWidth * 0.97, 14);
        heroNameEl.style.fontSize = scaled + 'px';
      }
    };

    fitHeroName();
    window.addEventListener('resize', fitHeroName);

    if (prefersReducedMotion) {
      typedEl.textContent = phrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = phrases[0].length;
      let deleting = false;

      const TYPE_SPEED = 75;
      const DELETE_SPEED = 45;
      const HOLD_TIME = 1800;

      typedEl.textContent = phrases[0];

      function tick() {
        const current = phrases[phraseIndex];

        if (!deleting) {
          charIndex++;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex >= current.length) {
            deleting = true;
            setTimeout(tick, HOLD_TIME);
            return;
          }
        } else {
          charIndex--;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex <= 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(tick, 350);
            return;
          }
        }
        setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
      }

      // reset to start typing the first phrase from scratch, then loop
      charIndex = 0;
      typedEl.textContent = '';
      setTimeout(tick, 600);
    }
  }

  /* ---------- crop showcase video to its final 15 seconds ---------- */
  const showcaseVideo = document.querySelector('.video-frame video');
  if (showcaseVideo) {
    const CLIP_SECONDS = 15;
    let clipStart = 0;

    showcaseVideo.addEventListener('loadedmetadata', () => {
      clipStart = Math.max(0, showcaseVideo.duration - CLIP_SECONDS);
      showcaseVideo.currentTime = clipStart;
    });

    showcaseVideo.addEventListener('play', () => {
      if (showcaseVideo.currentTime < clipStart - 0.5) {
        showcaseVideo.currentTime = clipStart;
      }
    });

    showcaseVideo.addEventListener('timeupdate', () => {
      if (showcaseVideo.currentTime < clipStart - 1) {
        showcaseVideo.currentTime = clipStart;
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- active nav link on scroll ---------- */
  const sections = ['home', 'about', 'projects', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(sec => navIO.observe(sec));
  }

});