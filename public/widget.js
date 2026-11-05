/*!
 * HireKit jobs widget
 * Usage: <script src="https://YOUR-HIREKIT-DOMAIN/widget.js" data-company="your-company-slug"></script>
 * Optional: data-target="#careers" to render inside a specific element.
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
  iframe.src = origin + '/embed/' + encodeURIComponent(slug);
  iframe.title = 'Open positions';
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
