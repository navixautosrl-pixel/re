/* RobixHost - gradient-mesh floating blobs behind every page banner.
   Injected as real elements (not ::before/::after) because .overlay
   and .overlay-video already use those pseudo-elements for the dark
   image tint on .top-header. */
(function () {
  function init() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.top-header').forEach(function (el) {
      if (el.querySelector('.rh-blob')) return;
      var a = document.createElement('div');
      a.className = 'rh-blob rh-blob-a';
      var b = document.createElement('div');
      b.className = 'rh-blob rh-blob-b';
      el.insertBefore(a, el.firstChild);
      el.insertBefore(b, el.firstChild);
      if (reduced) {
        a.style.display = 'none';
        b.style.display = 'none';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
