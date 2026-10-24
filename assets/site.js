/* Momentum Sales Progression website: settings, Google tags, cookie consent and forms.
   ------------------------------------------------------------------------------
   SETTINGS: this is the only block you should ever need to change.            */
window.MSP = {
  ga4Id: "",            // Google Analytics 4 Measurement ID, e.g. "G-ABC123XYZ"
  adsId: "",            // Google Ads tag ID, e.g. "AW-123456789"
  adsLeadLabel: "",     // Google Ads conversion label for a contact form enquiry
  adsBookingLabel: "",  // Google Ads conversion label for a Discovery Meeting booking
  adsNewsletterLabel: "",// Google Ads conversion label for a newsletter sign up (optional)
  formEmail: "info@momentumsp.co.uk", // where website forms are emailed
  whatsapp: "447932712565" // WhatsApp number in international format, e.g. "447700900123"
};
/* ------------------------------------------------------------------------------ */

(function () {
  var M = window.MSP;
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Google Consent Mode v2: nothing is stored until the visitor accepts.
  var saved = null;
  try { saved = localStorage.getItem("msp-consent"); } catch (e) {}
  gtag("consent", "default", {
    ad_storage: "denied", analytics_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
    wait_for_update: 500
  });
  if (saved === "granted") grant(false);
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);

  var tagId = M.ga4Id || M.adsId;
  if (tagId) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + tagId;
    document.head.appendChild(s);
    gtag("js", new Date());
    if (M.ga4Id) gtag("config", M.ga4Id);
    if (M.adsId) gtag("config", M.adsId);
  }

  function grant(store) {
    gtag("consent", "update", {
      ad_storage: "granted", analytics_storage: "granted",
      ad_user_data: "granted", ad_personalization: "granted"
    });
    if (store) try { localStorage.setItem("msp-consent", "granted"); } catch (e) {}
  }
  function deny() {
    gtag("consent", "update", {
      ad_storage: "denied", analytics_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied"
    });
    try { localStorage.setItem("msp-consent", "denied"); } catch (e) {}
  }

  // Conversion helper used by the thank you page and the booking calendar.
  M.convert = function (kind) {
    var label = { contact: M.adsLeadLabel, booking: M.adsBookingLabel, newsletter: M.adsNewsletterLabel }[kind];
    var ev = { contact: "generate_lead", booking: "book_discovery_meeting", newsletter: "sign_up" }[kind] || kind;
    gtag("event", ev, { form_type: kind });
    if (M.adsId && label) gtag("event", "conversion", { send_to: M.adsId + "/" + label });
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Cookie banner
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie preferences");
    bar.innerHTML = '<p>We use cookies to understand how our website is used and to measure our advertising. ' +
      'See our <a href="cookie-policy">cookie policy</a>.</p>' +
      '<div class="cookie-actions"><button type="button" class="cb-reject">Reject</button>' +
      '<button type="button" class="cb-accept">Accept</button></div>';
    document.body.appendChild(bar);
    function show() { bar.classList.add("show"); }
    function hide() { bar.classList.remove("show"); }
    if (!saved) show();
    bar.querySelector(".cb-accept").onclick = function () { grant(true); hide(); };
    bar.querySelector(".cb-reject").onclick = function () { deny(); hide(); };
    [].forEach.call(document.querySelectorAll("[data-cookie-settings]"), function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); show(); });
    });

    // Forms are emailed through FormSubmit, then the visitor lands on the thank you page.
    [].forEach.call(document.querySelectorAll("form[data-form]"), function (f) {
      f.action = "https://formsubmit.co/" + M.formEmail;
      var next = f.querySelector('input[name="_next"]');
      if (next) next.value = new URL("thank-you?type=" + next.getAttribute("data-next"), location.href).href;
    });

    // WhatsApp button appears once a number is set above.
    [].forEach.call(document.querySelectorAll("[data-whatsapp]"), function (a) {
      if (M.whatsapp) { a.href = "https://wa.me/" + M.whatsapp; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
    });

    // Track phone and email clicks.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var h = a.getAttribute("href");
      if (h.indexOf("tel:") === 0) gtag("event", "phone_click", { link_url: h });
      else if (h.indexOf("mailto:") === 0) gtag("event", "email_click", { link_url: h });
    });
  });

  // A completed Calendly booking counts as a conversion.
  window.addEventListener("message", function (e) {
    if (e.origin === "https://calendly.com" && e.data && e.data.event === "calendly.event_scheduled") M.convert("booking");
  });
})();

/* Scroll animations, matching the effects used on the Wix site (desktop and mobile). */
(function () {
  var A = [
    ["h2:has(+ .why-divider)", "expand", 1.2], [".why-item", "float", 0.5],
    [".team-title", "float", 0.8], [".team .center", "float", 0.8], [".member", "float", 0.8],
    [".safe h2", "arc", 1.2], [".safe-row", "fade", 0.5], [".grow .media", "float", 0.8], [".team-band .media", "float", 0.8],
    [".c-photo", "float", 1.2], [".c-form .btn", "fade", 1.2],
    [".car-intro .btn", "expand", 1.2], [".jd-card", "float", 0.6], [".jd-card .btn", "expand", 0.6], [".values-grid .dna", "arc", 1.5]
  ];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var css = "";
  A.forEach(function (a) {
    try { document.querySelector(a[0]); } catch (e) { return; } // skip selectors an old browser can't read
    css += "html.anim-on " + a[0] + ":not(.anim-in){" + {
      fade: "opacity:0", float: "opacity:0;transform:translateY(48px)",
      expand: "opacity:0;transform:scale(.8)", arc: "opacity:0;transform:perspective(700px) rotateX(-35deg) translateY(30px)"
    }[a[1]] + "}\nhtml.anim-on " + a[0] + "{transition:opacity " + a[2] + "s ease, transform " + a[2] + "s cubic-bezier(.2,.7,.2,1)}\n";
  });
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  document.documentElement.classList.add("anim-on");
  document.addEventListener("DOMContentLoaded", function () {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("anim-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    A.forEach(function (a) {
      var els; try { els = document.querySelectorAll(a[0]); } catch (e) { return; }
      [].forEach.call(els, function (el, i) {
        var sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        if (els.length > 1) el.style.transitionDelay = (Math.min(sib, 8) * 0.08) + "s";
        io.observe(el);
      });
    });
  });
})();
