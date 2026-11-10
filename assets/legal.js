/* Pages légales : chaque bloc apparaît doucement quand il entre à l'écran. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js');
  document.addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll('.lg-main > *');
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transitionDelay = (n++ * 45) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  });
})();
