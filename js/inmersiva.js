/* Maquetas inmersivas: aparición al entrar, puntos de sección (A) y hojas que se apilan (B). */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.querySelector('.im-pn') && !reduce) document.documentElement.classList.add('im-snap');

  // puntos de navegación para los paneles y hojas
  var bloques = [].slice.call(document.querySelectorAll('.im-pn, .im-sheet, .im-end'));
  var dots = document.createElement('nav'); dots.className = 'im-dots'; dots.setAttribute('aria-hidden','true');
  bloques.forEach(function(b){ var a=document.createElement('a'); a.onclick=function(){ window.scrollTo({top:b.offsetTop, behavior: reduce?'auto':'smooth'}); }; dots.appendChild(a); });
  document.body.appendChild(dots);

  var hojas = [].slice.call(document.querySelectorAll('.im-sheet'));
  function tick(){
    var vh = innerHeight;
    document.querySelectorAll('.im-rv:not(.im-in)').forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top<vh*0.9 && r.bottom>0) e.classList.add('im-in'); });
    var act = 0; bloques.forEach(function(b,i){ if(b.getBoundingClientRect().top < vh*0.5) act=i; });
    [].forEach.call(dots.children, function(d,i){ d.classList.toggle('on', i===act); });
    hojas.forEach(function(s,i){
      var nx = s.nextElementSibling;
      if(!nx || !(nx.classList.contains('im-sheet') || nx.classList.contains('im-end'))){ s.style.transform=''; return; }
      var t = Math.max(0, Math.min(1, 1 - nx.getBoundingClientRect().top / vh));
      s.style.transform = reduce ? '' : 'scale(' + (1 - t*0.06).toFixed(4) + ')';
      var sh = s.querySelector('.im-shade'); if(sh) sh.style.setProperty('--dim', (t*0.45).toFixed(3));
    });
  }
  hojas.forEach(function(s){ if(!s.querySelector('.im-shade')){ var d=document.createElement('span'); d.className='im-shade'; s.appendChild(d);} });
  var pend=false;
  addEventListener('scroll', function(){ if(pend) return; pend=true; requestAnimationFrame(function(){ pend=false; tick(); }); setTimeout(function(){ if(pend){ pend=false; tick(); } }, 80); }, {passive:true});
  addEventListener('resize', tick);
  tick(); setTimeout(tick, 400); setTimeout(function(){ document.querySelectorAll('.im-rv').forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top<innerHeight && r.bottom>0) e.classList.add('im-in'); }); }, 1800);
})();
