// ===== Smooth scroll com offset do header =====
(function(){
  const header = document.querySelector('.site-header');
  const offset = () => (header?.offsetHeight || 0) + 14;

  const goto = id => {
    const el = document.querySelector(id);
    if(!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // agora cobre #form e #contato
  document.querySelectorAll('a[href="#form"], a[href="#contato"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      goto('#form'); // destino final é o form
    });
  });
})();

// ===== Máscara simples de WhatsApp: (xx) xxxxx-xxxx =====
(function(){
  const input = document.querySelector('#whats');
  if(!input) return;
  const format = v => {
    const d = (v||'').replace(/\D/g,'').slice(0,11);
    const p1 = d.slice(0,2), p2 = d.slice(2,7), p3 = d.slice(7,11);
    if(d.length > 7) return `(${p1}) ${p2}-${p3}`;
    if(d.length > 2) return `(${p1}) ${p2}`;
    if(d.length > 0) return `(${p1}`;
    return '';
  };
  const onInput = e => {
    e.target.value = format(e.target.value);
    e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
  };
  input.addEventListener('input', onInput);
  input.addEventListener('blur', onInput);
})();

// ===== Disparo de animações da hero =====
(function(){
  const heroArt = document.querySelector('.hero__art');
  if(!heroArt) return;

  // força animação no load (melhora “não vi diferença”)
  const start = ()=> heroArt.classList.add('animate');

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ start(); io.disconnect(); }
      });
    }, { threshold:.25 });
    io.observe(heroArt);
  } else {
    start();
  }

  // Parallax leve
  const phone = heroArt.querySelector('.phone');
  const kpi   = heroArt.querySelector('.kpi');
  const book  = heroArt.querySelector('.book');
  let raf;
  const onScroll = ()=>{
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      raf = 0;
      const rect = heroArt.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const p = Math.min(1.2, Math.max(-0.2, 1 - (rect.top+rect.height)/vh));
      const t = v => `translate3d(0, ${v.toFixed(2)}px, 0)`;
      if(phone) phone.style.transform = t(p * -12);
      if(kpi)   kpi.style.transform   = t(p * -16);
      if(book)  book.style.transform  = t(p * 10);
    });
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

// ===== Reveal on scroll (features, parceiros, form) =====
(function(){
  const items = [
    ...document.querySelectorAll('.features .card'),
    ...document.querySelectorAll('.partners__grid img'),
    ...document.querySelectorAll('.contact .form, .contact__copy')
  ];
  items.forEach((el, i)=>{
    el.setAttribute('data-reveal','');
    el.classList.add(`delay-${(i % 4) + 1}`);
  });
  if(!('IntersectionObserver' in window)){
    items.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold:.18, rootMargin:'0px 0px -40px 0px' });
  items.forEach(el=>io.observe(el));
})();

// ===== COOKIE BANNER =====
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  if(localStorage.getItem("cookiesAccepted")) {
    banner.style.display = "none";
  }

  btn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    banner.style.display = "none";
  });
});


// ===== Scroll suave para o formulário =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#form"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector("#form");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  });

  // ===== COOKIE BANNER =====
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  const hide = () => {
    banner.style.display = "none";
    document.body.classList.remove("has-cookie-banner");
  };
  const show = () => {
    banner.style.display = "flex";
    document.body.classList.add("has-cookie-banner");
  };

  if (localStorage.getItem("cookiesAccepted")) {
    hide();
  } else {
    show();
  }

  btn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    hide();
  });
});

// ===== Carrossel de chats (clínica / petshop) =====
(function(){
  const art   = document.querySelector('.hero__art');
  if(!art) return;

  const scenes = Array.from(art.querySelectorAll('.chat-scene'));
  const badge  = art.querySelector('#segmentBadge');
  const btnPrev = art.querySelector('.slider-btn.prev');
  const btnNext = art.querySelector('.slider-btn.next');
  if(!scenes.length || !badge) return;

  let i = scenes.findIndex(s => s.classList.contains('is-active'));
  if(i < 0) i = 0;

  const show = (idx)=>{
    scenes.forEach((s, k)=> s.classList.toggle('is-active', k === idx));
    const seg = scenes[idx].getAttribute('data-segment') || '';
    badge.textContent = seg;
    i = idx;
  };

  const next = ()=> show((i + 1) % scenes.length);
  const prev = ()=> show((i - 1 + scenes.length) % scenes.length);

  btnNext && btnNext.addEventListener('click', next);
  btnPrev && btnPrev.addEventListener('click', prev);

  // Auto-troca a cada 8s; pausa ao passar o mouse no desktop
  let timer = setInterval(next, 8000);
  const pause = ()=> { clearInterval(timer); timer = null; };
  const resume = ()=> { if(!timer) timer = setInterval(next, 8000); };

  art.addEventListener('mouseenter', pause);
  art.addEventListener('mouseleave', resume);
  // acessibilidade: pause quando focar os botões
  [btnPrev, btnNext].forEach(b => b && b.addEventListener('focus', pause));
  [btnPrev, btnNext].forEach(b => b && b.addEventListener('blur', resume));
})();

// ===== Carrossel de chats (clínica / petshop) =====
(function(){
  const art = document.querySelector('.hero__art');
  if(!art) return;

  const scenes  = Array.from(art.querySelectorAll('.chat-scene'));
  const badge   = art.querySelector('#segmentBadge');
  const btnPrev = art.querySelector('.slider-btn.prev');
  const btnNext = art.querySelector('.slider-btn.next');
  if(!scenes.length || !badge) return;

  let i = scenes.findIndex(s => s.classList.contains('is-active'));
  if(i < 0) i = 0;

   function show(idx){
    scenes.forEach((s,k)=> s.classList.toggle('is-active', k === idx));
    const seg = scenes[idx].getAttribute('data-segment') || '';
    badge.textContent = seg;
    i = idx;

    // atualiza título da topbar
    const topbarTitle = art.querySelector('.chat-topbar__title');
    if (topbarTitle) {
      const segNorm = seg.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (segNorm.includes('clinica')) {
        topbarTitle.textContent = 'Sua Clínica';
      } else if (segNorm.includes('petshop')) {
        topbarTitle.textContent = 'Seu Petshop';
      } else {
        topbarTitle.textContent = 'Atendimento Optma';
      }
    }
  }

  const next = ()=> show((i + 1) % scenes.length);
  const prev = ()=> show((i - 1 + scenes.length) % scenes.length);

  btnNext && btnNext.addEventListener('click', next);
  btnPrev && btnPrev.addEventListener('click', prev);
    // Swipe no mobile (arrastar para trocar)
  let x0 = null;
  art.addEventListener('touchstart', (e) => {
    if(!e.touches.length) return;
    x0 = e.touches[0].clientX;
    pause();   // pausa auto-rotate enquanto arrasta
  }, { passive: true });

  art.addEventListener('touchend', (e) => {
    if(x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const THRESHOLD = 40;  // px mínimos para considerar swipe
    if (Math.abs(dx) > THRESHOLD) {
      dx < 0 ? next() : prev();
    }
    x0 = null;
    resume(); // retoma auto-rotate
  }, { passive: true });

  // auto-troca a cada 8s; pausa no hover/focus (desktop)
  let timer = setInterval(next, 8000);
  const pause  = ()=> { if(timer){ clearInterval(timer); timer = null; } };
  const resume = ()=> { if(!timer){ timer = setInterval(next, 8000); } };

  art.addEventListener('mouseenter', pause);
  art.addEventListener('mouseleave', resume);
  [btnPrev, btnNext].forEach(b => b && b.addEventListener('focus', pause));
  [btnPrev, btnNext].forEach(b => b && b.addEventListener('blur', resume));
})();

const dot = document.createElement("div");
const outline = document.createElement("div");
dot.className = "cursor-dot";
outline.className = "cursor-outline";
document.body.append(dot, outline);

document.addEventListener("mousemove", e => {
  dot.style.left = outline.style.left = e.clientX + "px";
  dot.style.top = outline.style.top = e.clientY + "px";
});

// ===== Partners: crescimento progressivo conforme aparece =====
(function(){
  const logos = document.querySelectorAll('.partners__grid .partner');
  if(!logos.length) return;

  // define um alvo de escala por ordem (cap em +22%)
  logos.forEach((el, i) => {
    const target = 1 + Math.min(0.22, i * 0.04);
    el.style.setProperty('--scale-target', target.toFixed(2));
  });

  // revela com animação quando entra na viewport
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('p-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .2 });

  logos.forEach(el => io.observe(el));
})();
