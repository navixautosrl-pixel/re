/* FILIP GEOTEHNIC — interacțiuni comune pentru toate paginile (fără librării). */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- An curent în subsol ---------- */
  var year = document.getElementById("an");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Meniu mobil ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    var closeMenu = function () {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Deschide meniul");
      nav.classList.remove("is-open");
    };
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { closeMenu(); menuBtn.focus(); }
    });
    window.matchMedia("(min-width: 1080px)").addEventListener("change", function (mq) { if (mq.matches) closeMenu(); });
  }

  var revealEls = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    /* ---------- Header: fundal după primii 80px (fără listener de scroll) ---------- */
    var header = document.getElementById("header");
    var sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);

    /* ---------- Scroll reveal ---------- */
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
      /* salt direct la o ancoră: conținutul țintă apare imediat */
      var showHash = function () {
        if (!location.hash) return;
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (!target) return;
        if (target.hasAttribute("data-reveal")) target.classList.add("is-visible");
        target.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
      };
      window.addEventListener("hashchange", showHash);
      showHash();
    }

    /* ---------- Link activ în meniu (doar pe pagina principală, pentru ancore) ---------- */
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]:not(.nav-cta)'));
    if (links.length) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          links.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === id)); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach(function (a) {
        var section = document.querySelector(a.getAttribute("href"));
        if (section) sectionObserver.observe(section);
      });
    }
  }

  /* ---------- Formular cu validare ---------- */
  var form = document.getElementById("form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var email = form.getAttribute("data-email") || "";
  var rules = {
    nume: function (v) { return v.trim().length >= 3 ? "" : "Scrieți numele complet."; },
    telefon: function (v) {
      var n = v.replace(/[\s.\-()]/g, "");
      return /^(\+4|004)?07\d{8}$/.test(n) || /^(\+4|004)?0[23]\d{8}$/.test(n) ? "" : "Introduceți un număr de telefon românesc valid (ex. 0722 123 456).";
    },
    email: function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Adresa de e-mail nu pare corectă."; },
    serviciu: function (v) { return v ? "" : "Alegeți serviciul dorit."; },
    locatie: function (v) { return v.trim().length >= 2 ? "" : "Scrieți localitatea sau sectorul."; },
    acord: function (_, el) { return el.checked ? "" : "Bifați acordul pentru a trimite solicitarea."; }
  };
  var check = function (name) {
    var el = form.elements[name];
    var msg = rules[name](el.value, el);
    var err = document.getElementById(name + "-err");
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener("blur", function () { if (el.value || el.type === "checkbox") check(name); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") check(name); });
    el.addEventListener("change", function () { if (el.type === "checkbox" || el.tagName === "SELECT") check(name); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    var firstBad = Object.keys(rules).filter(function (name) { return !check(name); })[0];
    if (firstBad) {
      form.elements[firstBad].focus();
      status.classList.add("bad");
      status.textContent = "Verificați câmpurile marcate.";
      return;
    }
    if (!email) {
      status.classList.add("bad");
      status.textContent = "Formularul nu este încă legat la o adresă de e-mail. Vă rugăm să ne contactați telefonic.";
      return;
    }
    var f = form.elements;
    var body = [
      "Nume: " + f.nume.value.trim(),
      "Telefon: " + f.telefon.value.trim(),
      "E-mail: " + (f.email.value.trim() || "-"),
      "Serviciu: " + f.serviciu.value,
      "Localitate: " + f.locatie.value.trim(),
      "",
      f.mesaj.value.trim()
    ].join("\n");
    var subject = "Cerere ofertă: " + f.serviciu.value + ", " + f.locatie.value.trim();
    window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    status.classList.add("ok");
    status.textContent = "Am deschis aplicația de e-mail cu mesajul completat. Apăsați „Trimite” acolo pentru a ne-l transmite.";
  });
})();
