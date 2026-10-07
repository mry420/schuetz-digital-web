(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce) root.classList.add("reduce");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Split headings into words ---------- */
  $$("[data-split]").forEach((el) => {
    const nodes = [...el.childNodes];
    el.textContent = "";
    let i = 0;
    const word = (content) => {
      const w = document.createElement("span");
      w.className = "w";
      w.style.setProperty("--i", i++);
      w.append(content);
      return w;
    };
    nodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          el.append(/^\s+$/.test(part) ? " " : word(part));
        });
      } else {
        el.append(word(n));
      }
    });
  });

  /* ---------- Split scroll-fill paragraph ---------- */
  const fills = $$("[data-fill]").map((el) => {
    const words = [];
    const walk = (node, into) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return into.append(" ");
            const s = document.createElement("span");
            s.className = "fw";
            s.textContent = part;
            into.append(s);
            words.push(s);
          });
        } else {
          const clone = n.cloneNode(false);
          walk(n, clone);
          into.append(clone);
        }
      });
    };
    const frag = document.createElement("span");
    walk(el, frag);
    el.textContent = "";
    el.append(...frag.childNodes);
    return { el, words, last: [] };
  });

  /* ---------- Fit big wordmarks to their container width ---------- */
  const fitEls = $$(".hero__brand, .wordmark");
  const fit = () =>
    fitEls.forEach((el) => {
      el.style.fontSize = "100px";
      const range = document.createRange();
      range.selectNodeContents(el);
      const natural = range.getBoundingClientRect().width;
      if (natural) el.style.fontSize = `${(100 * el.clientWidth) / natural * 0.995}px`;
    });
  fit();
  addEventListener("resize", fit);
  document.fonts?.ready.then(fit);

  /* ---------- Stagger indices ---------- */
  $$("[data-stagger]").forEach((el) => [...el.children].forEach((c, i) => c.style.setProperty("--i", i)));

  /* ---------- Count-up ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduce) return (el.textContent = target);
    const start = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = clamp((t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  };

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = $$("[data-reveal], [data-split], [data-stagger]");
  const reveal = (el) => {
    el.classList.add("in");
    $$("[data-count]", el).forEach(countUp);
    if (el.hasAttribute("data-stagger")) {
      const total = 1200 + el.children.length * 90;
      setTimeout(() => el.classList.add("done"), total);
    }
  };
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Nav + mobile menu ---------- */
  const nav = $("[data-nav]");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    menu.setAttribute("aria-hidden", String(!open));
    if (open) nav.classList.remove("is-hidden");
  };
  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  addEventListener("resize", () => innerWidth > 860 && setMenu(false));

  /* ---------- FAQ ---------- */
  $$(".faq__q").forEach((q) =>
    q.addEventListener("click", () => {
      const open = q.getAttribute("aria-expanded") === "true";
      $$(".faq__q").forEach((o) => o.setAttribute("aria-expanded", "false"));
      q.setAttribute("aria-expanded", String(!open));
    })
  );

  /* ---------- Work filter ---------- */
  const filters = $$("[data-filter]");
  const projects = $$("[data-cat]");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      projects.forEach((p) => {
        const show = cat === "all" || p.dataset.cat === cat;
        if (show && p.hidden) {
          p.classList.add("is-hiding");
          p.hidden = false;
          p.getBoundingClientRect();
          requestAnimationFrame(() => p.classList.remove("is-hiding"));
        } else if (!show && !p.hidden) {
          p.classList.add("is-hiding");
          setTimeout(() => {
            if (p.classList.contains("is-hiding")) p.hidden = true;
            dirty = true;
          }, reduce ? 0 : 350);
        }
      });
      dirty = true;
    })
  );

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        el.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- Cursor bubble on projects ---------- */
  const cursor = $(".cursor");
  const cur = { x: -200, y: -200, tx: -200, ty: -200, s: 0, ts: 0 };
  if (finePointer && !reduce) {
    addEventListener("pointermove", (e) => {
      cur.tx = e.clientX;
      cur.ty = e.clientY;
    });
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => (cur.ts = 1));
      el.addEventListener("pointerleave", () => (cur.ts = 0));
    });
  }

  /* ---------- CTA glow follows pointer ---------- */
  const cta = $(".cta");
  if (cta && finePointer && !reduce) {
    cta.addEventListener("pointermove", (e) => {
      const r = cta.getBoundingClientRect();
      cta.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
      cta.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }

  /* ---------- Scroll-driven frame loop ---------- */
  const heroMedia = $("[data-hero-media]");
  const timecode = $("[data-timecode]");
  const t0 = performance.now();
  let lastFrameNo = -1;
  const parallax = $$("[data-parallax]");
  const stackCards = $$(".stack__card");
  const marquee = $("[data-marquee]");
  if (marquee) marquee.append(...[...marquee.children].map((c) => c.cloneNode(true)));

  let lastY = scrollY;
  let navY = scrollY;
  let velocity = 0;
  let dir = 1;
  let mx = 0;
  let dirty = true;
  addEventListener("scroll", () => (dirty = true), { passive: true });
  addEventListener("resize", () => (dirty = true));

  const updateScroll = () => {
    const vh = innerHeight;
    const y = scrollY;

    // Nav: background after a few px, hide on scroll down / show on scroll up
    nav.classList.toggle("is-scrolled", y > 16);
    if (!document.body.classList.contains("menu-open")) {
      if (y > navY + 6 && y > 240) nav.classList.add("is-hidden");
      else if (y < navY - 6 || y <= 240) nav.classList.remove("is-hidden");
    }
    navY = y;

    // Hero bento grows to full width as it enters
    if (heroMedia) {
      const r = heroMedia.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.9));
      heroMedia.style.setProperty("--hs", (0.92 + 0.08 * p).toFixed(4));
    }

    // Parallax inside rounded masks
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const offset = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty("--py", `${(offset * -r.height * 0.12).toFixed(1)}px`);
    });

    // Stacking cards: shrink a card as the next one slides over it
    stackCards.forEach((card, i) => {
      const next = stackCards[i + 1];
      if (!next) return;
      const r = card.getBoundingClientRect();
      const nr = next.getBoundingClientRect();
      const p = clamp((r.top + r.height - nr.top) / r.height);
      card.style.setProperty("--p", p.toFixed(3));
    });

    // Word-by-word fill
    fills.forEach((f) => {
      const r = f.el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
      const n = f.words.length;
      f.words.forEach((w, i) => {
        const o = (0.14 + 0.86 * clamp(p * n * 1.1 - i)).toFixed(2);
        if (f.last[i] !== o) {
          w.style.setProperty("--o", o);
          f.last[i] = o;
        }
      });
    });
  };

  const frame = () => {
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy) dir = dy > 0 ? 1 : -1;
    velocity = lerp(velocity, dy, 0.12);

    if (dirty) {
      dirty = false;
      updateScroll();
    }

    // Velocity-reactive marquee
    if (marquee) {
      const half = marquee.scrollWidth / 2;
      mx -= (0.6 + Math.min(Math.abs(velocity) * 0.35, 14)) * dir;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      const skew = clamp(-velocity * 0.15, -6, 6);
      marquee.style.transform = `translate3d(${mx.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }

    // Running timecode on the video tile (25 fps)
    if (timecode) {
      const f = Math.floor(((performance.now() - t0) / 1000) * 25);
      if (f !== lastFrameNo) {
        lastFrameNo = f;
        const pad = (n) => String(n).padStart(2, "0");
        const s = Math.floor(f / 25);
        timecode.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 25)}`;
      }
    }

    // Cursor bubble
    if (finePointer) {
      cur.x = lerp(cur.x, cur.tx, 0.18);
      cur.y = lerp(cur.y, cur.ty, 0.18);
      cur.s = lerp(cur.s, cur.ts, 0.15);
      cursor.style.setProperty("--x", `${cur.x.toFixed(1)}px`);
      cursor.style.setProperty("--y", `${cur.y.toFixed(1)}px`);
      cursor.style.setProperty("--s", cur.s.toFixed(3));
    }

    requestAnimationFrame(frame);
  };

  if (reduce) {
    updateScroll();
    fills.forEach((f) => f.words.forEach((w) => w.style.setProperty("--o", 1)));
    addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", scrollY > 16);
    }, { passive: true });
  } else {
    requestAnimationFrame(frame);
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
