/* Radio Store — carga apps.json y dibuja la ficha estilo Play Store */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var apps = [];
  var proximas = [];

  /* ── Efecto 3D al mover el mouse sobre las tarjetas ── */
  function tilt(el) {
    if (window.matchMedia('(hover: none)').matches) return;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' +
        (x * 9).toFixed(2) + 'deg) translateY(-5px) scale(1.015)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  }

  function cargar() {
    fetch('apps.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        apps = data.apps || [];
        proximas = data.proximas || [];
        $('cargando').classList.add('oculto');
        window.addEventListener('hashchange', router);
        pintarProximas();
        router();
      })
      .catch(function () {
        $('cargando').textContent = 'No se pudieron cargar las apps.';
      });
  }

  function router() {
    var h = (location.hash || '').replace('#', '');
    if (h.indexOf('app/') === 0) {
      var id = h.slice(4);
      var app = apps.filter(function (a) { return a.id === id; })[0];
      if (app) { ficha(app); return; }
    }
    portada();
  }

  function tarjeta(app, i) {
    return (
      '<article class="app-card" data-id="' + app.id + '" style="animation-delay:' +
      (i * 60) + 'ms">' +
        '<img src="' + app.icono + '" alt="">' +
        '<div><h3>' + app.nombre + '</h3>' +
          '<p>' + (app.descripcionCorta || '') + '</p>' +
          '<div class="meta">' +
            '<span><b>★ ' + (app.puntuacion || '5.0') + '</b></span>' +
            '<span>' + (app.descargas || '') + '</span>' +
            '<span>' + (app.categoria || '') + '</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function pintarLista(f) {
    f = (f || '').toLowerCase().trim();
    var items = apps.filter(function (a) {
      if (!f) return true;
      return (
        (a.nombre || '').toLowerCase().indexOf(f) >= 0 ||
        (a.categoria || '').toLowerCase().indexOf(f) >= 0 ||
        (a.desarrollador || '').toLowerCase().indexOf(f) >= 0 ||
        (a.descripcionCorta || '').toLowerCase().indexOf(f) >= 0
      );
    });
    $('vacio').classList.toggle('oculto', items.length > 0);
    $('lista').innerHTML = items.map(tarjeta).join('');
    enganchar();
  }

  function pintarProximas() {
    $('proximas').innerHTML = proximas.map(function (p, i) {
      var ini = (p.nombre || '?').trim().charAt(0).toUpperCase();
      return (
        '<article class="vacia" style="animation:entrar .5s cubic-bezier(.22,1,.36,1) both;animation-delay:' +
        (i * 70) + 'ms">' +
          '<span class="punto">' + ini + '</span>' +
          '<div><h4>' + p.nombre + '</h4><small>' + p.categoria + ' · próximamente</small></div>' +
        '</article>'
      );
    }).join('');
  }

  function enganchar() {
    Array.prototype.forEach.call(document.querySelectorAll('.app-card'), function (el) {
      tilt(el);
      el.onclick = function () { location.hash = '#app/' + el.dataset.id; };
    });
  }

  function portada() {
    $('ficha').classList.add('oculto');
    $('portada').classList.remove('oculto');
    pintarLista($('q').value);
  }

  function filas(app) {
    return [
      ['Versión', app.version],
      ['Tamaño', app.tamano],
      ['Actualizada', app.actualizado],
      ['Descargas', app.descargas],
      ['Lanzada', app.lanzado],
      ['Clasificación', app.clasificacion],
      ['Contenido', app.contenido]
    ].map(function (f) {
      return '<li><b>' + f[0] + '</b> <span>' + f[1] + '</span></li>';
    }).join('');
  }

  function barras(nota) {
    var out = '';
    for (var i = 5; i >= 1; i--) {
      var pct = i === Math.round(nota) ? 100 : 0;
      if (i < Math.round(nota)) pct = 0;
      out +=
        '<li><span>' + i + '</span><span class="pista"><span class="lleno" style="width:' +
        pct + '%"></span></span></li>';
    }
    return out;
  }

  function ficha(app) {
    $('portada').classList.add('oculto');
    $('ficha').classList.remove('oculto');
    window.scrollTo(0, 0);

    $('appIcono').src = app.icono;
    $('appNombre').textContent = app.nombre;
    $('appDev').textContent = app.desarrollador;
    $('appPuntuacion').textContent = app.puntuacion || '5.0';
    $('appPuntuacion2').textContent = app.puntuacion || '5.0';
    $('appResenias').textContent = (app.resenias || 1) + ' reseña(s)';
    $('appDescargas').textContent = app.descargas || '';
    $('appDescargas2').textContent = app.descargas || '';
    $('appCategoria').textContent = app.categoria || '';
    $('appTamano').textContent = app.tamano || '';
    $('appTamano2').textContent = app.tamano || '';
    $('appDescripcion').textContent = app.descripcion || '';
    $('appNovedades').textContent = app.novedades || '—';
    $('appInfo').innerHTML = filas(app);
    $('appRequiere').textContent = app.requiere || '';
    $('appPaquete').textContent = app.paquete || '';
    $('appClasificacion').textContent = app.clasificacion || '';
    $('appBarras').innerHTML = barras(parseFloat(app.puntuacion) || 5);
    $('appCompat').textContent =
      'La app funciona en teléfonos y tablets Android. ' + (app.requiere || '') +
      '. Probada en un Samsung Galaxy A26 (Android 16, pantalla 1080 x 2340 px).';

    $('appCapturas').innerHTML = (app.capturas || [])
      .map(function (c) { return '<img src="' + c + '" alt="Captura de pantalla" loading="lazy">'; })
      .join('');

    $('btnInstalar').onclick = function () { window.location.href = app.descarga; };
    $('btnDescargar').href = app.descarga;
    $('btnDescargar').textContent = 'Descargar ' + app.nombre;
    document.title = app.nombre + ' · Radio Store';
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('volver').onclick = function () { location.hash = '#/'; };
    $('q').addEventListener('input', function () { pintarLista(this.value); });
    cargar();
  });
})();
