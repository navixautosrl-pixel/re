/*!
 * RobixHost — stratul de animație, aplicat pe tot site-ul
 * ------------------------------------------------------------------
 * Motivul pentru care e un singur fișier și nu atribute în HTML:
 * site-ul are 15 pagini. Puse de mână, atributele de animație ar fi
 * fost oricum uitate pe jumătate din ele la prima modificare.
 *
 * Ce face:
 *   1. Reveal la scroll pentru titluri, carduri, rânduri de listă,
 *      cu decalaj între elementele din același rând.
 *   2. Intrarea din hero, imediat ce dispare spinner-ul.
 *   3. Bară de progres a paginii, în capul ferestrei.
 *   4. Numărătoare crescătoare pentru [data-rh-count].
 *   5. Efect de parallax discret pe bannerul paginii.
 *
 * Totul se oprește complet dacă utilizatorul are setat
 * „reduce motion" în sistem — atunci conținutul apare pur și simplu.
 */
(function () {
  "use strict";

  var reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Elementele care primesc reveal. Ordinea contează: primele din
     listă sunt cele mai „importante" vizual, ca să nu ajungă un
     card să fie animat de două ori. */
  var TARGETS = [
    ".section-heading",
    ".section-subheading",
    ".info-content",
    ".service-section",
    ".help-container",
    ".price-container",
    ".panel-wrap",
    ".card.upping",
    ".table-responsive-lg",
    ".blog-post",
    ".testimonial-section",
    ".counter-section",
    ".content-price",
    ".domain-price",
    ".contact-form",
    ".contact-info",
    ".footer-widget"
  ].join(",");

  function markTargets() {
    var nodes = document.querySelectorAll(TARGETS);
    // Decalajul se calculează pe părinte: trei carduri pe același rând
    // intră unul după altul, nu toate odată.
    var seen = {};
    var counter = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // Nu dubla peste AOS-ul scris explicit în HTML și nu anima un
      // element care e deja înăuntrul altuia animat.
      if (el.hasAttribute("data-aos")) continue;
      if (el.closest(".rh-reveal")) continue;
      if (el.closest("[data-aos]")) continue;

      var parent = el.parentElement;
      var key = parent ? parent.getAttribute("data-rh-key") : null;
      if (parent && !key) {
        key = "g" + counter++;
        parent.setAttribute("data-rh-key", key);
      }
      seen[key] = (seen[key] || 0) + 1;
      var index = Math.min(seen[key] - 1, 5); // maxim 5 trepte de decalaj
      el.classList.add("rh-reveal");
      el.style.transitionDelay = index * 90 + "ms";
    }
  }

  function observeReveals() {
    var items = document.querySelectorAll(".rh-reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("rh-in");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          entries[i].target.classList.add("rh-in");
          io.unobserve(entries[i].target);
        }
      },
      // rootMargin negativ în jos: elementul se animă când a intrat
      // bine în ecran, nu când abia se vede un pixel din el.
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* --- Intrarea din hero ------------------------------------------
     Bannerul e vizibil de la început, deci nu-l putem lăsa pe
     IntersectionObserver — s-ar declanșa înainte să dispară
     spinner-ul și utilizatorul ar rata jumătate din animație. */
  function heroIntro() {
    var hero = document.querySelector(".top-header");
    if (!hero) return;
    var parts = hero.querySelectorAll(
      ".heading, .subheading, .included, .btn, form, .breadcrumb"
    );
    for (var i = 0; i < parts.length; i++) {
      parts[i].classList.add("rh-reveal");
      parts[i].style.transitionDelay = 120 + i * 110 + "ms";
    }
    // Un tick după ce pagina s-a așezat, ca tranziția să pornească
    // de la starea inițială și nu din starea finală.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (var i = 0; i < parts.length; i++) parts[i].classList.add("rh-in");
      });
    });
  }

  /* --- Bara de progres --------------------------------------------- */
  function progressBar() {
    var bar = document.createElement("div");
    bar.className = "rh-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.pageYOffset / max, 1) : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  /* --- Numărătoare crescătoare -------------------------------------
     Pentru [data-rh-count="99.9"] — textul urcă până la valoarea
     dată, păstrând numărul de zecimale scris în atribut. */
  function counters() {
    var nodes = document.querySelectorAll("[data-rh-count]");
    if (!nodes.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          run(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    function run(el) {
      var raw = el.getAttribute("data-rh-count");
      var target = parseFloat(raw);
      if (isNaN(target)) return;
      var dot = raw.indexOf(".");
      var decimals = dot === -1 ? 0 : raw.length - dot - 1;
      var duration = 1400;
      var start = null;
      el.classList.add("rh-count");

      function step(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        // ease-out: pornește repede, se așază lin pe valoarea finală
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    for (var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
  }

  /* --- Parallax pe banner ------------------------------------------
     Doar transform și opacity, deci nu declanșează layout la fiecare
     cadru. Oprit sub 992px: pe telefon, banner-ul ocupă tot ecranul
     și efectul ar face textul greu de citit în timpul scroll-ului. */
  function bannerParallax() {
    if (window.innerWidth < 992) return;
    var wrap = document.querySelector(".top-header .container");
    if (!wrap) return;
    var ticking = false;

    function update() {
      var y = window.pageYOffset;
      if (y < window.innerHeight) {
        wrap.style.transform = "translate3d(0," + y * 0.18 + "px,0)";
        wrap.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.85), 0));
      }
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  /* --- Header și footer ---------------------------------------------
     Amândouă sunt încărcate din header.html/footer.html cu jQuery
     .load(), deci nu există în pagină când rulează init(). Le urmărim
     și repetăm pasul de marcare odată ce au apărut. */
  function watchInjectedPartials() {
    if (!("MutationObserver" in window)) return;
    ["header", "footer"].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      var mo = new MutationObserver(function () {
        if (!host.children.length) return;
        mo.disconnect();
        markTargets();
        observeReveals();
      });
      mo.observe(host, { childList: true });
    });
  }

  function init() {
    if (reduced) return; // conținutul rămâne vizibil, fără mișcare
    markTargets();
    observeReveals();
    heroIntro();
    progressBar();
    counters();
    bannerParallax();
    watchInjectedPartials();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
