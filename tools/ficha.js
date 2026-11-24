/* Ficha lateral: índice de apartados, botón de generar siempre a mano y acceso al resultado. */
(function () {
  var fi = document.querySelector('.hc-ficha[data-auto]');
  var main = document.querySelector('.hc-main');
  if (!fi || !main) return;
  var nav = fi.querySelector('.fi-nav');
  var gen = fi.querySelector('.fi-generar');
  var ver = fi.querySelector('.fi-ver');
  var OFFSET = 70;

  function visible(el) { return !!(el && el.getClientRects().length); }
  function ir(el) {
    var y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: suave ? 'smooth' : 'auto' });
  }
  function botonPrincipal() {
    var r = document.getElementById('resultado');
    var bs = main.querySelectorAll('.btn-generar');
    for (var i = 0; i < bs.length; i++) {
      if (visible(bs[i]) && !(r && r.contains(bs[i]))) return bs[i];
    }
    return null;
  }
  var cabeceras = [];
  function construir() {
    if (!nav) return;
    nav.innerHTML = '';
    cabeceras = [];
    main.querySelectorAll('.sec-header').forEach(function (h) {
      if (!visible(h)) return;
      var n = h.querySelector('.sec-num'), t = h.querySelector('.sec-title');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fi-link';
      b.innerHTML = '<span>' + (n ? n.textContent : '') + '</span>' + (t ? t.textContent : '');
      b.addEventListener('click', function () { ir(h); });
      nav.appendChild(b);
      cabeceras.push([h, b]);
    });
    var r = document.getElementById('resultado');
    if (visible(r)) {
      var br = document.createElement('button');
      br.type = 'button'; br.className = 'fi-link';
      br.innerHTML = '<span>→</span>Resultado';
      br.addEventListener('click', function () { ir(r); });
      nav.appendChild(br);
      cabeceras.push([r, br]);
    }
    var bp = botonPrincipal();
    if (gen) {
      gen.hidden = !bp;
      if (bp) gen.textContent = bp.textContent.replace(/^[\s▶]+/, '').trim();
    }
    marcar();
  }
  function marcar() {
    var actual = null;
    cabeceras.forEach(function (c) { if (c[0].getBoundingClientRect().top < OFFSET + 40) actual = c; });
    cabeceras.forEach(function (c) { c[1].classList.toggle('on', c === actual); });
    var r = document.getElementById('resultado');
    if (ver) ver.hidden = !visible(r);
  }
  if (gen) gen.addEventListener('click', function () {
    var bp = botonPrincipal();
    if (!bp) return;
    bp.click();
    setTimeout(function () { construir(); var r = document.getElementById('resultado'); if (visible(r)) ir(r); }, 60);
  });
  if (ver) ver.addEventListener('click', function () { var r = document.getElementById('resultado'); if (visible(r)) ir(r); });
  main.addEventListener('click', function () { setTimeout(construir, 30); });
  window.addEventListener('scroll', marcar, { passive: true });
  construir();
})();
