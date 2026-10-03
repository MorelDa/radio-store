/* Radio Store — carga apps.json y dibuja la ficha tipo Play Store */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var apps = [];

  function cargar() {
    fetch('apps.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        apps = Array.isArray(data) ? data : (data.apps || []);
        $('cargando').classList.add('oculto');
        window.addEventListener('hashchange', router);
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
      if (app) { mostrarFicha(app); return; }
    }
    mostrarPortada();
  }

  function chips(app) {
    return [
      '<span class="chip">★ ' + (app.puntuacion || '5.0') + '</span>',
      '<span class="chip">' + (app.descargas || '') + ' descargas</span>',
      '<span class="chip">' + (app.categoria || '') + '</span>'
    ].join('');
  }

  function pintarLista(filtro) {
    var f = (filtro || '').toLowerCase().trim();
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
    $('lista').innerHTML = items
      .map(function (a) {
        return (
          '<article class="app-card" data-id="' + a.id + '">' +
            '<img src="' + a.icono + '" alt="">' +
            '<div>' +
              '<h3>' + a.nombre + '</h3>' +
              '<p>' + (a.descripcionCorta || '') + '</p>' +
              '<div class="meta">' +
                '<span>★ ' + (a.puntuacion || '5.0') + '</span>' +
                '<span>' + (a.descargas || '') + '</span>' +
                '<span>' + (a.categoria || '') + '</span>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    Array.prototype.forEach.call(
      document.querySelectorAll('.app-card'),
      function (el) {
        el.onclick = function () { location.hash = '#app/' + el.dataset.id; };
      }
    );
  }

  function mostrarPortada() {
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
      ['Contiene anuncios', app.contenido],
      ['Clasificación', app.clasificacion]
    ]
      .map(function (f) { return '<li><b>' + f[0] + '</b> <span>' + f[1] + '</span></li>'; })
      .join('');
  }

  function mostrarFicha(app) {
    $('portada').classList.add('oculto');
    $('ficha').classList.remove('oculto');
    window.scrollTo(0, 0);

    $('appIcono').src = app.icono;
    $('appNombre').textContent = app.nombre;
    $('appNombre2').textContent = app.nombre;
    $('appDev').textContent = app.desarrollador;
    $('appPuntuacion').textContent = '★ ' + (app.puntuacion || '5.0');
    $('appDescargas').textContent = (app.descargas || '') + ' descargas';
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

    $('appCompat').textContent =
      'La app funciona en teléfonos y tablets Android. ' +
      (app.requiere || 'Android 7.0 o superior') +
      '. Se probó en un Samsung Galaxy A26 (Android 16) y en-screen de 1080 x 2340 px.';

    $('appCapturas').innerHTML = (app.capturas || [])
      .map(function (c) { return '<img src="' + c + '" alt="Captura de pantalla">'; })
      .join('');

    var apk = app.descarga;
    $('btnInstalar').onclick = function () { window.location.href = apk; };
    $('btnDescargar').href = apk;
    document.title = app.nombre + ' · Radio Store';
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('volver').onclick = function () { location.hash = '#/'; };
    $('q').addEventListener('input', function () { pintarLista(this.value); });
    cargar();
  });
})();
