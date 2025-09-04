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
