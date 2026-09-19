/*!
 * RobixHost — configurare WHMCS + comutator lunar/anual
 * ------------------------------------------------------------------
 * Aici stau DOAR legăturile către WHMCS. Prețurile și specificațiile
 * stau direct în HTML (în hosting.html), ca să fie citite de Google și
 * ca pagina să arate corect chiar dacă JavaScript-ul nu se încarcă.
 *
 * Ce ai de editat, realist, o dată:
 *   1. WHMCS_BASE  — adresa clientarea (deja setată).
 *   2. STORE_GROUP — grupul de produse din URL-ul magazinului.
 *   3. SLUGS       — slug-ul fiecărui produs din WHMCS. Vezi mai jos.
 */
window.ROBIXHOST = (function () {
  "use strict";

  // --- WHMCS --------------------------------------------------------
  var WHMCS_BASE = "https://clienti.robixhost.ro";

  // Grupul de produse, din URL-ul magazinului tău:
  //   https://clienti.robixhost.ro/index.php?rp=/store/web-hosting
  //                                                     ^^^^^^^^^^^
  var STORE_GROUP = "web-hosting";

  /*
   * Slug-ul fiecărui produs în WHMCS.
   *
   * Îl iei din WHMCS: Configuration → Products/Services → produsul →
   * tab-ul "Links", sau pur și simplu din bara de adrese când deschizi
   * produsul în magazin:
   *   .../index.php?rp=/store/web-hosting/nano-hosting
   *                                       ^^^^^^^^^^^^  ăsta e slug-ul
   *
   * Lăsat gol = butonul duce la pagina grupului "Gazduire Web", unde
   * clientul alege pachetul. Nu se strică nimic, doar că mai face un
   * click. Completează-le când ai produsele create și clientul ajunge
   * direct la coș, cu pachetul deja selectat.
   */
  var SLUGS = {
    nano: "",
    micro: "",
    starter: "",
    pro: "",
    business: "",
    enterprise: ""
  };

  /** Linkul de comandă pentru un pachet (sau pentru tot grupul). */
  function orderUrl(planId, cycle) {
    var slug = (planId && SLUGS[planId]) || "";
    var url =
      WHMCS_BASE + "/index.php?rp=/store/" + STORE_GROUP + (slug ? "/" + slug : "");
    // WHMCS preselectează ciclul de facturare din query string, deci
    // clientul care a apăsat pe "Anual" ajunge cu "Anual" deja bifat.
    if (slug && cycle) url += "&billingcycle=" + cycle;
    return url;
  }

  /** Pune linkul corect pe fiecare buton de comandă din pagină. */
  function wireOrderButtons(cycle) {
    var links = document.querySelectorAll("[data-rh-plan]");
    for (var i = 0; i < links.length; i++) {
      links[i].href = orderUrl(links[i].getAttribute("data-rh-plan"), cycle);
    }
  }

  // --- Comutator lunar / anual --------------------------------------
  /*
   * Comutatorul din temă (#run-switch) doar împarte prețul la 12 sau îl
   * înmulțește cu 12 — nu poate reda un preț anual cu discount real.
   * Ăsta schimbă între două valori scrise explicit în HTML, deci prețul
   * afișat e întotdeauna cel pe care îl facturezi.
   */
  function setCycle(cycle) {
    var annual = cycle === "annually";
    var root = document.querySelector("[data-rh-pricing]");
    if (root) root.setAttribute("data-rh-cycle", annual ? "annually" : "monthly");

    var sw = document.getElementById("rh-billing-switch");
    if (sw) {
      var btns = sw.querySelectorAll("[data-rh-cycle-btn]");
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i].getAttribute("data-rh-cycle-btn") === cycle;
        btns[i].classList.toggle("active", on);
        btns[i].setAttribute("aria-checked", on ? "true" : "false");
        btns[i].tabIndex = on ? 0 : -1;
      }
    }
    wireOrderButtons(annual ? "annually" : "monthly");
  }

  function initSwitch() {
    var sw = document.getElementById("rh-billing-switch");
    if (!sw) {
      wireOrderButtons("annually");
      return;
    }
    sw.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-rh-cycle-btn]");
      if (!btn) return;
      setCycle(btn.getAttribute("data-rh-cycle-btn"));
    });
    // Săgeți stânga/dreapta, ca la orice grup de radio-uri.
    sw.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      var current = sw.querySelector('[aria-checked="true"]');
      var next = current && current.getAttribute("data-rh-cycle-btn") === "annually"
        ? "monthly"
        : "annually";
      setCycle(next);
      var el = sw.querySelector('[data-rh-cycle-btn="' + next + '"]');
      if (el) el.focus();
    });
    setCycle("annually");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSwitch);
  } else {
    initSwitch();
  }

  return {
    whmcsBase: WHMCS_BASE,
    storeGroup: STORE_GROUP,
    slugs: SLUGS,
    orderUrl: orderUrl,
    setCycle: setCycle
  };
})();
