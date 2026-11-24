// Main JavaScript

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu-active');
            navToggle.classList.toggle('nav-toggle-active');
            navToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('nav-menu-active')));
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('nav-menu-active');
                navToggle.classList.remove('nav-toggle-active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Create mailto link
            const mailtoLink = `mailto:drabernalm@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Nombre: ${formData.name}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`)}`;
            
            window.location.href = mailtoLink;
            
            // Optional: Show confirmation message
            alert('Se abrirá tu cliente de correo para enviar el mensaje.');
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


/* =========================================================
   INTERACCIÓN · utilidades
   ========================================================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Cambia el DOM con una View Transition si el navegador la soporta
function conTransicion(actualizar) {
    if (document.startViewTransition && !reduceMotion.matches) {
        const t = document.startViewTransition(actualizar);
        // Si el usuario encadena filtros rápido, la transición anterior se cancela: es normal
        [t.ready, t.finished, t.updateCallbackDone].forEach(p => p.catch(() => {}));
    } else {
        actualizar();
    }
}

// Minúsculas y sin tildes, para buscar "tiroidea" con "TIROIDEA" o "farmacogenomica"
function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escaparHTML(texto) {
    return texto.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* =========================================================
   1 · HERRAMIENTAS — buscador y filtros
   ========================================================= */
(function () {
    const barra = document.querySelector('[data-tools-toolbar]');
    if (!barra) return;

    const input = barra.querySelector('#toolSearch');
    const borrar = barra.querySelector('.tools-search-clear');
    const botones = Array.from(barra.querySelectorAll('.tools-filter'));
    const contador = barra.querySelector('.tools-count');
    const vacio = document.querySelector('.tools-empty');
    const lista = document.querySelector('.tools-list');
    const secciones = Array.from(document.querySelectorAll('.tools-section'));

    function estadoDe(tarjeta) {
        const t = normalizar((tarjeta.querySelector('.tool-badge') || {}).textContent || '');
        if (t.includes('acceso privado')) return 'privado';
        if (t.includes('uso privado')) return 'uso-privado';
        if (t.includes('desarrollo')) return 'desarrollo';
        if (t.includes('disponible')) return 'disponible';
        return 'otro';
    }

    const herramientas = Array.from(document.querySelectorAll('.tools-section .tool-card')).map((tarjeta, i) => {
        tarjeta.style.viewTransitionName = 'herramienta-' + i;
        const zonas = [tarjeta.querySelector('h3'), tarjeta.querySelector(':scope > p')]
            .concat(Array.from(tarjeta.querySelectorAll('.tool-tech span')))
            .filter(Boolean)
            .map(el => ({ el, html: el.innerHTML, texto: el.textContent }));
        return {
            tarjeta,
            estado: estadoDe(tarjeta),
            texto: normalizar(zonas.map(z => z.texto).join(' ')),
            zonas
        };
    });

    secciones.forEach((s, i) => {
        const h = s.querySelector('.section-heading');
        const d = s.querySelector('.tools-section-desc');
        if (h) h.style.viewTransitionName = 'bloque-titulo-' + i;
        if (d) d.style.viewTransitionName = 'bloque-desc-' + i;
    });

    // Subraya en dorado las palabras buscadas dentro de una zona de texto
    function resaltar(zona, terminos) {
        if (!terminos.length) { zona.el.innerHTML = zona.html; return; }
        const original = zona.texto;
        let norm = '';
        const mapa = [];
        for (let i = 0; i < original.length; i++) {
            for (const ch of normalizar(original[i])) { norm += ch; mapa.push(i); }
        }
        const rangos = [];
        terminos.forEach(t => {
            let idx = norm.indexOf(t);
            while (idx >= 0) {
                rangos.push([mapa[idx], mapa[idx + t.length - 1] + 1]);
                idx = norm.indexOf(t, idx + t.length);
            }
        });
        if (!rangos.length) { zona.el.innerHTML = zona.html; return; }
        rangos.sort((a, b) => a[0] - b[0]);
        const unidos = [rangos[0]];
        rangos.slice(1).forEach(r => {
            const u = unidos[unidos.length - 1];
            if (r[0] <= u[1]) u[1] = Math.max(u[1], r[1]); else unidos.push(r);
        });
        let html = '', ultimo = 0;
        unidos.forEach(([a, b]) => {
            html += escaparHTML(original.slice(ultimo, a)) + '<mark class="tool-hit">' + escaparHTML(original.slice(a, b)) + '</mark>';
            ultimo = b;
        });
        zona.el.innerHTML = html + escaparHTML(original.slice(ultimo));
    }

    let filtro = 'todas';

    function aplicar(animar) {
        const terminos = normalizar(input.value.trim()).split(/\s+/).filter(Boolean);

        const actualizar = () => {
            const cuentas = { todas: 0, disponible: 0, privado: 0, 'uso-privado': 0, desarrollo: 0 };
            let visibles = 0;

            herramientas.forEach(h => {
                const coincide = terminos.every(t => h.texto.includes(t));
                if (coincide) {
                    cuentas.todas++;
                    if (cuentas[h.estado] !== undefined) cuentas[h.estado]++;
                }
                const mostrar = coincide && (filtro === 'todas' || h.estado === filtro);
                h.tarjeta.classList.toggle('is-hidden', !mostrar);
                h.tarjeta.classList.remove('will-reveal');
                h.tarjeta.classList.add('is-revealed');
                h.zonas.forEach(z => resaltar(z, mostrar ? terminos : []));
                if (mostrar) visibles++;
            });

            secciones.forEach(s => s.classList.toggle('is-hidden', !s.querySelector('.tool-card:not(.is-hidden)')));

            botones.forEach(b => {
                const n = cuentas[b.dataset.filter];
                b.querySelector('.tools-filter-n').textContent = n;
                b.disabled = n === 0 && b.getAttribute('aria-pressed') !== 'true';
            });

            vacio.hidden = visibles > 0;
            contador.innerHTML = visibles === herramientas.length
                ? '<strong>' + visibles + '</strong> herramientas'
                : 'Mostrando <strong>' + visibles + '</strong> de ' + herramientas.length + ' herramientas';
            borrar.hidden = !input.value;
        };

        if (animar) conTransicion(actualizar); else actualizar();
    }

    // Si la barra está pegada arriba, al filtrar volvemos al principio de la lista
    function volverArriba() {
        const destino = lista.getBoundingClientRect().top + window.scrollY - 20;
        if (window.scrollY > destino + 40) {
            window.scrollTo({ top: destino, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    }

    botones.forEach(b => b.addEventListener('click', () => {
        filtro = b.dataset.filter;
        botones.forEach(o => o.setAttribute('aria-pressed', String(o === b)));
        volverArriba();
        aplicar(true);
    }));

    let espera;
    input.addEventListener('input', () => {
        clearTimeout(espera);
        espera = setTimeout(() => aplicar(true), 140);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Escape' && input.value) { input.value = ''; aplicar(true); }
    });

    borrar.addEventListener('click', () => { input.value = ''; aplicar(true); input.focus(); });

    document.querySelector('[data-tools-reset]').addEventListener('click', () => {
        input.value = '';
        filtro = 'todas';
        botones.forEach(o => o.setAttribute('aria-pressed', String(o.dataset.filter === 'todas')));
        aplicar(true);
        input.focus();
    });

    // Sombra en la barra cuando se queda fija bajo la cabecera
    function alturaCabecera() {
        return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 92;
    }
    window.addEventListener('scroll', () => {
        const arriba = barra.getBoundingClientRect().top;
        barra.classList.toggle('is-stuck', arriba <= alturaCabecera() + 1 && window.scrollY > 200);
    }, { passive: true });

    // Entrada escalonada de las tarjetas que aún no se ven
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        const fuera = herramientas.map(h => h.tarjeta)
            .filter(t => t.getBoundingClientRect().top > window.innerHeight);
        fuera.forEach(t => t.classList.add('will-reveal'));
        const obs = new IntersectionObserver(entradas => {
            let orden = 0;
            entradas.forEach(en => {
                if (!en.isIntersecting) return;
                const t = en.target;
                t.style.setProperty('--reveal-delay', Math.min(orden++ * 70, 280) + 'ms');
                t.classList.add('is-revealed');
                t.classList.remove('will-reveal');
                obs.unobserve(t);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        fuera.forEach(t => obs.observe(t));
    }

    aplicar(false);
})();

/* =========================================================
   2 · SOBRE MÍ — trayectoria con raíl que se rellena
   ========================================================= */
(function () {
    const lista = document.querySelector('.timeline-list');
    if (!lista) return;

    const etapas = Array.from(lista.querySelectorAll('.timeline-item'));
    const relleno = lista.querySelector('.timeline-rail-fill');
    const botones = Array.from(document.querySelectorAll('.timeline-filter'));

    etapas.forEach((e, i) => { e.style.viewTransitionName = 'etapa-' + i; });

    function actualizar() {
        const r = lista.getBoundingClientRect();
        const ancla = window.innerHeight * 0.8;
        const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        const progreso = alFinal ? 1 : Math.min(1, Math.max(0, (ancla - r.top) / r.height));
        relleno.style.setProperty('--progress', progreso.toFixed(4));

        let actual = null;
        etapas.forEach(e => {
            if (e.classList.contains('is-hidden')) return;
            const alcanzada = alFinal || e.getBoundingClientRect().top + 10 < ancla;
            e.classList.toggle('is-reached', alcanzada);
            if (alcanzada) actual = e;
        });
        etapas.forEach(e => e.classList.toggle('is-current', e === actual));
    }

    // Cálculo ligero (6 etapas): se hace directamente en cada evento de scroll
    window.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);

    botones.forEach(b => b.addEventListener('click', () => {
        const faceta = b.dataset.faceta;
        botones.forEach(o => o.setAttribute('aria-pressed', String(o === b)));
        conTransicion(() => {
            etapas.forEach(e => e.classList.toggle('is-hidden', faceta !== 'todo' && e.dataset.faceta !== faceta));
            actualizar();
        });
    }));

    actualizar();
})();

/* =========================================================
   4 · CONTACTO — temas que rellenan el asunto
   ========================================================= */
(function () {
    const temas = Array.from(document.querySelectorAll('.topic-chip'));
    const asunto = document.getElementById('subject');
    if (!temas.length || !asunto) return;

    let puestoPorTema = '';

    temas.forEach(chip => chip.addEventListener('click', () => {
        const activar = chip.getAttribute('aria-pressed') !== 'true';
        temas.forEach(c => c.setAttribute('aria-pressed', String(c === chip && activar)));
        const tema = activar ? chip.dataset.tema : '';

        // Solo sobrescribimos el asunto si está vacío o lo puso un tema antes
        if (!asunto.value.trim() || asunto.value === puestoPorTema) {
            asunto.value = tema;
            puestoPorTema = tema;
            if (tema) {
                asunto.classList.remove('is-autofilled');
                void asunto.offsetWidth;
                asunto.classList.add('is-autofilled');
            }
        }
    }));

    asunto.addEventListener('animationend', () => asunto.classList.remove('is-autofilled'));
})();


/* =========================================================
   PORTADA · letra animada y movimiento
   ========================================================= */

// Parte un elemento de texto en palabras y letras (las palabras no se cortan al saltar de línea)
function partirEnLetras(el, retardoInicial, paso) {
    const texto = el.textContent;
    el.textContent = '';
    let i = 0;
    texto.split(/(\s+)/).forEach(trozo => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) { el.appendChild(document.createTextNode(' ')); return; }
        const palabra = document.createElement('span');
        palabra.className = 'char-word';
        palabra.setAttribute('aria-hidden', 'true');
        for (const letra of trozo) {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = letra;
            c.style.setProperty('--d', Math.round(retardoInicial + i * paso));
            palabra.appendChild(c);
            i++;
        }
        el.appendChild(palabra);
    });
    return retardoInicial + i * paso;
}

// Luz dorada que sigue al ratón dentro de una zona oscura (solo con ratón)
function luzDorada(zona) {
    const luz = document.createElement('div');
    luz.className = 'hero-light';
    luz.setAttribute('aria-hidden', 'true');
    zona.prepend(luz);

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduceMotion.matches) return;

    let x = 30, y = 35, tx = 30, ty = 35, animando = false;
    function seguir() {
        x += (tx - x) * 0.12;
        y += (ty - y) * 0.12;
        zona.style.setProperty('--mx', x.toFixed(2) + '%');
        zona.style.setProperty('--my', y.toFixed(2) + '%');
        if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
            requestAnimationFrame(seguir);
        } else {
            animando = false;
        }
    }
    zona.addEventListener('pointermove', e => {
        const r = zona.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 100;
        ty = ((e.clientY - r.top) / r.height) * 100;
        zona.classList.add('is-lit');
        if (!animando) { animando = true; requestAnimationFrame(seguir); }
    });
    zona.addEventListener('pointerleave', () => zona.classList.remove('is-lit'));
}

// Titular que se enfoca letra a letra, seguido del subtítulo y una línea dorada
function enfocarTitular(zona, lineas, subtitulo, paso) {
    const h1 = zona.querySelector('h1');
    if (!h1) return;

    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());

    let t = 250;
    lineas.forEach(linea => { t = partirEnLetras(linea, t, paso) + 120; });
    zona.style.setProperty('--sub-delay', Math.round(t + 150) + 'ms');

    h1.addEventListener('animationend', e => {
        if (e.target.classList.contains('char')) e.target.classList.add('is-settled');
    });

    // Respaldo: el titular nunca se queda invisible aunque el navegador pause la animación
    setTimeout(() => {
        h1.querySelectorAll('.char:not(.is-settled)').forEach(c => c.classList.add('is-settled'));
        zona.classList.add('is-ready');
    }, t + 2500);

    if (subtitulo) {
        const regla = document.createElement('span');
        regla.className = 'hero-rule';
        regla.setAttribute('aria-hidden', 'true');
        subtitulo.after(regla);
    }

    luzDorada(zona);
}

(function () {
    // Portada
    const hero = document.querySelector('.hero');
    if (hero && hero.querySelector('h1')) {
        enfocarTitular(hero, hero.querySelectorAll('.hero-title-main'), hero.querySelector('.hero-subtitle'), 42);

        const gota = document.createElement('span');
        gota.className = 'hero-scroll';
        gota.setAttribute('aria-hidden', 'true');
        hero.appendChild(gota);

        // La gota solo se anima mientras el hero se ve
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => {
                hero.style.setProperty('--hero-play', en.isIntersecting ? 'running' : 'paused');
            }).observe(hero);
        }
    }

    // Cabeceras del resto de páginas
    document.querySelectorAll('.page-hero').forEach(zona => {
        const h1 = zona.querySelector('h1');
        if (h1) enfocarTitular(zona, [h1], zona.querySelector('.page-subtitle'), 34);
    });
})();

// Títulos de sección: al llegar, una línea dorada recorre el título de izquierda a derecha
(function () {
    const titulos = Array.from(document.querySelectorAll(
        '.section-title, .section-heading, .cta-section h2, .contact-info h2, .contact-form-container h2'
    ));
    if (!titulos.length || !('IntersectionObserver' in window)) return;

    titulos.forEach(t => {
        // El texto se envuelve en un span para que la línea mida lo mismo que el título
        const linea = document.createElement('span');
        linea.className = 'tl';
        while (t.firstChild) linea.appendChild(t.firstChild);
        t.appendChild(linea);
        t.classList.add('reveal-line');
    });

    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(en => {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-in');
            obs.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    titulos.forEach(t => obs.observe(t));

    function revisar() {
        titulos.filter(t => !t.classList.contains('is-in') && t.getBoundingClientRect().top < window.innerHeight * 0.88)
            .forEach(t => { t.classList.add('is-in'); obs.unobserve(t); });
    }
    setTimeout(revisar, 80);
    window.addEventListener('scroll', revisar, { passive: true });
})();

// Tarjetas y fotos que entran al llegar a ellas
(function () {
    // Flecha "→" separada para poder empujarla
    document.querySelectorAll('.area-link, .tool-link').forEach(a => {
        a.innerHTML = a.innerHTML.replace(/\s*→\s*$/, ' <span class="arrow" aria-hidden="true">→</span>');
    });

    // pathLength=1 permite "dibujar" cualquier trazo con dasharray 1
    document.querySelectorAll('.area-icon svg *').forEach(p => p.setAttribute('pathLength', '1'));

    const tarjetas = Array.from(document.querySelectorAll('.area-card, .service-card, .education-item, .affiliation-item'));
    const fotos = Array.from(document.querySelectorAll('.clinic-image, .profile-image'));
    tarjetas.forEach(t => t.classList.add('reveal-item'));
    fotos.forEach(f => f.classList.add('reveal-photo'));
    const todos = tarjetas.concat(fotos);

    if (!('IntersectionObserver' in window)) {
        todos.forEach(el => el.classList.add('is-in'));
        return;
    }

    function mostrar(el, i) {
        el.style.setProperty('--reveal-delay', Math.min(i * 120, 480) + 'ms');
        el.classList.add('is-in');
        el.classList.remove('will-reveal');
    }

    todos.forEach(el => el.classList.add('will-reveal'));

    // Lo que ya está en pantalla al cargar entra directamente (sin depender del observador)
    const enPantalla = todos.filter(el => el.getBoundingClientRect().top < window.innerHeight * 0.9);
    setTimeout(() => enPantalla.forEach((el, i) => mostrar(el, i)), 80);

    const obs = new IntersectionObserver(entradas => {
        entradas.filter(en => en.isIntersecting).forEach((en, i) => {
            mostrar(en.target, i);
            obs.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -10% 0px' });
    todos.filter(el => !enPantalla.includes(el)).forEach(el => obs.observe(el));

    // Respaldo final: nada se queda oculto si el navegador no avisa del scroll
    window.addEventListener('scroll', function revisar() {
        const pendientes = todos.filter(el => el.classList.contains('will-reveal'));
        if (!pendientes.length) { window.removeEventListener('scroll', revisar); return; }
        pendientes.filter(el => el.getBoundingClientRect().top < window.innerHeight * 0.9)
            .forEach((el, i) => { mostrar(el, i); obs.unobserve(el); });
    }, { passive: true });
})();

// Cabecera que se estrecha al bajar (todas las páginas)
(function () {
    const raiz = document.documentElement;
    function comprobar() {
        raiz.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', comprobar, { passive: true });
    comprobar();
})();
