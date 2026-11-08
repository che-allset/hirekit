/*!
 * HireKit jobs widget
 * Usage: <script src="https://YOUR-HIREKIT-DOMAIN/widget.js" data-company="your-company-slug"></script>
 * Optional: data-target="#careers" to render inside a specific element.
 * Optional: data-lang="de" (en, de, es, fr). Without it, the visitor's browser language is used.
 */
(function () {
  'use strict';

  var script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"][data-company]');
  if (!script) return;

  var slug = script.getAttribute('data-company');
  if (!slug) {
    console.warn('[HireKit] Missing data-company attribute on the widget script.');
    return;
  }

  var origin = new URL(script.src, window.location.href).origin;

  var iframe = document.createElement('iframe');
  var lang = script.getAttribute('data-lang');
  iframe.src = origin + '/embed/' + encodeURIComponent(slug) + (lang ? '?lang=' + encodeURIComponent(lang) : '');
  // Screen readers announce this title. Same texts as dash.settings.iframeTitle in src/i18n
  // (this script runs on the company's own website, so it can't load the dictionaries).
  var TITLES = { en: 'Open positions', de: 'Offene Stellen', es: 'Ofertas de empleo', fr: 'Offres d’emploi' };
  // Same rule as the widget content: data-lang if set, otherwise the visitor's browser language.
  var titleLang = (lang || navigator.language || 'en').slice(0, 2).toLowerCase();
  iframe.title = TITLES[titleLang] || TITLES.en;
  iframe.setAttribute('loading', 'lazy');
  iframe.style.width = '100%';
  iframe.style.minHeight = '320px';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.colorScheme = 'normal';

  var targetSelector = script.getAttribute('data-target');
  var target = targetSelector ? document.querySelector(targetSelector) : null;
  if (target) {
    target.appendChild(iframe);
  } else if (script.parentNode) {
    script.parentNode.insertBefore(iframe, script.nextSibling);
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== origin || event.source !== iframe.contentWindow) return;
    var data = event.data;
    if (data && data.type === 'hirekit:height' && typeof data.height === 'number') {
      iframe.style.height = Math.ceil(data.height) + 'px';
    }
  });
})();
