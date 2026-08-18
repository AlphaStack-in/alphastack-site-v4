// AlphaStack — shared interactions
document.addEventListener('DOMContentLoaded', () => {

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + '%';
  }, { passive: true });

  // Cursor blob — soft glow that trails the pointer
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && matchMedia('(hover:hover)').matches) {
    const blob = document.createElement('div');
    blob.className = 'cursor-blob';
    document.body.appendChild(blob);

    let targetX = 0, targetY = 0, x = 0, y = 0, active = false;
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX; targetY = e.clientY;
      if (!active) { x = targetX; y = targetY; active = true; blob.classList.add('active'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { active = false; blob.classList.remove('active'); });

    (function tick() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      blob.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    })();
  }

  // Stagger index for grouped reveals
  document.querySelectorAll('.reveal-stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 90}ms`;
    });
  });

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Animated stat counters — the HTML already shows the real final value (so it's
  // correct even if JS never runs); we read that as the animation target rather
  // than requiring a separate data-count attribute to stay in sync with it.
  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.textContent);
        const suffix = el.dataset.suffix || '';
        if (Number.isNaN(target)) { co.unobserve(el); return; }
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target < 10 ? (target * eased).toFixed(1) : Math.round(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => co.observe(el));
  }

  // FAQ accordion
  document.querySelectorAll('.accordion-trigger').forEach((trigger, i) => {
    const item = trigger.closest('.accordion-item');
    const panel = item.querySelector('.accordion-panel');
    const panelId = `accordion-panel-${i}`;
    panel.id = panelId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('.accordion').querySelectorAll('.accordion-item.open').forEach(el => {
        if (el !== item) {
          el.classList.remove('open');
          el.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !wasOpen);
      trigger.setAttribute('aria-expanded', String(!wasOpen));
    });
  });

  // Contact form: POST to the /contact.php mail handler
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      const submitBtn = form.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (status) { status.textContent = ''; status.style.color = ''; }

      try {
        const res = await fetch('/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json().catch(() => ({}));

        if (res.ok && result.ok) {
          form.reset();
          if (status) { status.textContent = "Thanks — we'll get back to you within one business day."; status.style.color = 'var(--mint)'; }
        } else {
          if (status) { status.textContent = result.error || 'Something went wrong. Please email info@alphastack.in directly.'; status.style.color = 'var(--red)'; }
        }
      } catch {
        if (status) { status.textContent = 'Network error — please email info@alphastack.in directly.'; status.style.color = 'var(--red)'; }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });
  }
});
