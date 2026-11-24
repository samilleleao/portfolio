(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // Leque de cards: segue o mouse
  const hero = document.querySelector('[data-parallax]');
  const fan = document.querySelector('.fan');
  if (hero && fan && fine && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      fan.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      fan.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => { fan.style.setProperty('--mx', 0); fan.style.setProperty('--my', 0); });
  }

  // Cursor "Ver case"
  const cur = document.querySelector('.cursor');
  if (cur && fine && !reduce) {
    window.addEventListener('pointermove', e => {
      cur.style.setProperty('--cx', e.clientX + 'px');
      cur.style.setProperty('--cy', e.clientY + 'px');
    }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { cur.textContent = el.dataset.cursor; cur.classList.add('on'); });
      el.addEventListener('pointerleave', () => cur.classList.remove('on'));
    });
  }

  // Botões magnéticos
  if (fine && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // Números que contam ao aparecer (o valor final já está no HTML)
  const fmt = (v, d) => v.toFixed(d).replace('.', ',');
  const counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window && counters.length) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = parseFloat(el.dataset.count), d = +(el.dataset.dec || 0);
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', final = el.textContent;
      const t0 = performance.now(), dur = 1500;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? pre + fmt(to * k, d) + suf : final;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .5 });
    counters.forEach(c => io.observe(c));
  }

  // Índice do case: destaca o capítulo atual
  const toc = document.querySelectorAll('.toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    const map = new Map([...toc].map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { toc.forEach(a => a.classList.remove('active')); map.get(en.target.id)?.classList.add('active'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.chapter[id]').forEach(s => spy.observe(s));
  }

  // Demo do Spoiler Shield
  document.querySelectorAll('.post').forEach(post => {
    const step1 = post.querySelector('[data-step="1"]'), step2 = post.querySelector('[data-step="2"]');
    post.querySelector('[data-act="ask"]')?.addEventListener('click', () => { step1.hidden = true; step2.hidden = false; });
    post.querySelector('[data-act="keep"]')?.addEventListener('click', () => { step2.hidden = true; step1.hidden = false; });
    post.querySelector('[data-act="reveal"]')?.addEventListener('click', () => { post.classList.remove('hidden'); post.querySelector('.reset').hidden = false; });
    post.querySelector('.reset')?.addEventListener('click', e => { e.currentTarget.hidden = true; post.classList.add('hidden'); step2.hidden = true; step1.hidden = false; });
  });

  // Celular da capa: alterna as telas sozinho e pelos botões
  document.querySelectorAll('[data-carousel]').forEach(box => {
    const slides = [...box.querySelectorAll('.slide')], dots = [...box.querySelectorAll('.dots button')];
    let i = 0, timer;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === i));
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-pressed', k === i); });
    };
    const play = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => show(i + 1), 3200); } };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); play(); }));
    box.addEventListener('pointerenter', () => clearInterval(timer));
    box.addEventListener('pointerleave', play);
    play();
  });

  // Copiar cor da paleta
  document.querySelectorAll('.sw').forEach(sw => {
    sw.addEventListener('click', () => {
      const hex = sw.dataset.hex, label = sw.querySelector('b'), old = label.textContent;
      const done = () => { label.textContent = 'Copiado'; setTimeout(() => { label.textContent = old; }, 1200); };
      try { navigator.clipboard.writeText(hex).then(done, () => {}); } catch (e) {}
    });
  });
})();

// Copiar e-mail
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
  const t = b.dataset.copy, old = b.textContent;
  const done = () => { b.textContent = 'Copiado!'; setTimeout(() => { b.textContent = old; }, 1500); };
  try {
    navigator.clipboard.writeText(t).then(done, () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('mail-addr')); getSelection().removeAllRanges(); getSelection().addRange(r); });
  } catch (e) {}
}));
