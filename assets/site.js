/* Momentum Sales Progression website: settings, Google tags, cookie consent and forms.
   ------------------------------------------------------------------------------
   SETTINGS: this is the only block you should ever need to change.            */
window.MSP = {
  ga4Id: "G-R5S38F7M3K", // Google Analytics 4 Measurement ID, e.g. "G-ABC123XYZ"
  adsId: "AW-17391507691", // Google Ads tag ID (account 574-918-6464)
  adsLeadLabel: "",     // Google Ads conversion label for a contact form enquiry (enquiries are imported from Analytics instead)
  adsBookingLabel: "B_fpCNTTjrgcEOux9eRA",  // "TechSol - Discovery meeting 11674": a completed Calendly booking
  adsNewsletterLabel: "",// Google Ads conversion label for a newsletter sign up (optional)
  adsAboutLabel: "aBg8CMOdpJMbEOux9eRA",    // "About Us page": a visit to the About page
  adsWhatsappLabel: "QM2KCO-kj7gcEOux9eRA", // "TechSol - Whatsapp contact 22665": a click on the WhatsApp button
  metaPixelId: "630243843042323", // Meta (Facebook) Pixel ID; loads only after cookie consent
  formId: "xzeeyraj", // Formspree form ID (the code after formspree.io/f/); submissions are emailed to info@momentumsp.co.uk
  whatsapp: "447932712565" // WhatsApp number in international format, e.g. "447700900123"
};
/* ------------------------------------------------------------------------------ */

(function () {
  var M = window.MSP;
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  /* Cookie choices: two separate switches, Analytics and Advertising (decided 13/11/2026).
     Google basic consent mode: no Google or Meta script loads until the matching choice is accepted.
       Analytics   = Google Analytics 4 (analytics_storage)
       Advertising = Google Ads tag and the Meta Pixel (ad_storage, ad_user_data, ad_personalization)
     The choice is kept in this browser under "msp-consent-v2". Choices made with the old single
     Accept button ("msp-consent") are not carried over, so returning visitors are asked once more. */
  var KEY = "msp-consent-v2";
  var choice = null;
  try { choice = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  try { localStorage.removeItem("msp-consent"); } catch (e) {}
  if (!choice || typeof choice !== "object") choice = null;

  gtag("consent", "default", {
    ad_storage: "denied", analytics_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied"
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);

  M.analytics = false; // visitor accepted Analytics
  M.ads = false;       // visitor accepted Advertising
  M.granted = false;   // kept for the News page Facebook feed: true once Advertising is accepted
  var tagLoaded = false, gaOn = false, adsOn = false, waiting = [];

  // Run fn now if the visitor has made a choice, otherwise once they do (on this page).
  function whenDecided(fn) { if (choice) fn(); else waiting.push(fn); }

  function apply(c) {
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.advertising ? "granted" : "denied",
      ad_user_data: c.advertising ? "granted" : "denied",
      ad_personalization: c.advertising ? "granted" : "denied"
    });
    M.analytics = !!c.analytics;
    M.ads = !!c.advertising;
    M.granted = M.ads;
    if ((M.analytics && M.ga4Id) || (M.ads && M.adsId)) {
      if (!tagLoaded) {
        tagLoaded = true;
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + (M.analytics && M.ga4Id ? M.ga4Id : M.adsId);
        document.head.appendChild(s);
        gtag("js", new Date());
      }
      if (M.analytics && M.ga4Id && !gaOn) { gaOn = true; gtag("config", M.ga4Id); }
      if (M.ads && M.adsId && !adsOn) { adsOn = true; gtag("config", M.adsId); }
    }
    if (M.ads) {
      loadPixel();
      try { window.dispatchEvent(new Event("msp:consent")); } catch (e) {}
    }
    var w = waiting; waiting = [];
    w.forEach(function (fn) { fn(); });
  }

  // Save a new choice. If something accepted earlier is now turned off, its tags are already
  // running on this page, so clear their cookies and reload the page without them.
  function save(c) {
    var withdrawn = (gaOn && !c.analytics) || ((adsOn || window.fbq) && !c.advertising);
    choice = { analytics: !!c.analytics, advertising: !!c.advertising, date: new Date().toISOString().slice(0, 10) };
    try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch (e) {}
    if (!choice.analytics) clearCookies(/^(_ga|_gid)/);
    if (!choice.advertising) clearCookies(/^(_gcl|_fbp|_fbc)/);
    if (withdrawn) { location.reload(); return; }
    apply(choice);
  }

  function clearCookies(re) {
    var host = location.hostname, root = host.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!re.test(name)) return;
      ["", "; domain=" + host, "; domain=." + root].forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  // Meta (Facebook) Pixel, loaded only once the visitor accepts Advertising.
  function loadPixel() {
    if (!M.metaPixelId || window.fbq) return;
    var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    var f = document.createElement("script"); f.async = true;
    f.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(f);
    window.fbq("init", M.metaPixelId);
    window.fbq("track", "PageView");
  }

  if (choice) apply(choice);

  // Measurement helpers. Nothing is sent without the matching choice; if the visitor has not
  // chosen yet, the event waits and is sent only if they accept while still on the page.
  M.event = function (name, params) {
    whenDecided(function () { if (M.analytics || M.ads) gtag("event", name, params || {}); });
  };
  M.adsConversion = function (label) {
    if (!M.adsId || !label) return;
    whenDecided(function () { if (M.ads) gtag("event", "conversion", { send_to: M.adsId + "/" + label }); });
  };
  M.pixel = function (ev) {
    whenDecided(function () { if (M.ads && window.fbq) window.fbq("track", ev); });
  };

  // Conversion helper used by the thank you page and the booking calendar.
  M.convert = function (kind) {
    var label = { contact: M.adsLeadLabel, booking: M.adsBookingLabel, newsletter: M.adsNewsletterLabel }[kind];
    var ev = { contact: "generate_lead", booking: "book_discovery_meeting", newsletter: "sign_up", report: "request_report", jd: "request_job_description" }[kind] || kind;
    M.event(ev, { form_type: kind });
    M.adsConversion(label);
    M.pixel({ contact: "Lead", booking: "Schedule", newsletter: "CompleteRegistration" }[kind] || "Lead");
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Cookie banner: Accept all, Reject all, or Manage choices (two switches, both off until turned on).
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-labelledby", "cb-title");
    bar.setAttribute("aria-describedby", "cb-text");
    bar.innerHTML =
      '<p class="cb-title" id="cb-title">Cookies on this website</p>' +
      '<p class="cb-text" id="cb-text">We would like to use optional cookies to see how our website is used and to measure our advertising. ' +
      'We only set them if you agree. See our <a href="cookie-policy">cookie policy</a>.</p>' +
      '<div class="cb-prefs" id="cb-prefs" hidden>' +
        '<label class="cb-opt"><span class="cb-desc"><b>Analytics</b><span>Google Analytics. Tells us how visitors find and use our website.</span></span>' +
          '<input type="checkbox" role="switch" class="cb-switch" data-cb="analytics"></label>' +
        '<label class="cb-opt"><span class="cb-desc"><b>Advertising</b><span>Google Ads and the Meta Pixel. Tell us whether our adverts lead to enquiries and bookings.</span></span>' +
          '<input type="checkbox" role="switch" class="cb-switch" data-cb="advertising"></label>' +
        '<p class="cb-note">Strictly necessary storage, which remembers your choice, is always on.</p>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="cb-manage" aria-expanded="false" aria-controls="cb-prefs">Manage choices</button>' +
        '<button type="button" class="cb-save" hidden>Save choices</button>' +
        '<button type="button" class="cb-reject">Reject all</button>' +
        '<button type="button" class="cb-accept">Accept all</button>' +
      '</div>';
    document.body.appendChild(bar);
    var prefs = bar.querySelector(".cb-prefs"), manage = bar.querySelector(".cb-manage"), saveBtn = bar.querySelector(".cb-save");
    var sw = { analytics: bar.querySelector('[data-cb="analytics"]'), advertising: bar.querySelector('[data-cb="advertising"]') };
    function openPrefs(open) {
      prefs.hidden = !open; saveBtn.hidden = !open; manage.hidden = open;
      manage.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function show(withPrefs) {
      sw.analytics.checked = !!(choice && choice.analytics);
      sw.advertising.checked = !!(choice && choice.advertising);
      openPrefs(!!withPrefs);
      bar.classList.add("show");
      if (withPrefs) sw.analytics.focus({ preventScroll: true }); // only when the visitor opened it themselves
    }
    function hide() { bar.classList.remove("show"); }
    if (!choice) show(false);
    bar.querySelector(".cb-accept").onclick = function () { hide(); save({ analytics: true, advertising: true }); };
    bar.querySelector(".cb-reject").onclick = function () { hide(); save({ analytics: false, advertising: false }); };
    manage.onclick = function () { openPrefs(true); sw.analytics.focus(); };
    saveBtn.onclick = function () { hide(); save({ analytics: sw.analytics.checked, advertising: sw.advertising.checked }); };
    bar.addEventListener("keydown", function (e) { if (e.key === "Escape" && choice) hide(); });
    // "Cookie settings" in the footer (and on the cookie policy page) reopens the banner with the switches showing.
    [].forEach.call(document.querySelectorAll("[data-cookie-settings]"), function (a) {
      a.setAttribute("role", "button");
      a.addEventListener("click", function (e) { e.preventDefault(); show(true); });
    });

    // Forms are sent to Formspree in the background, then the visitor goes to the thank you page.
    // If sending fails, the visitor stays on the page and is offered email and phone instead.
    var contactLine = 'email <a href="mailto:info@momentumsp.co.uk">info@momentumsp.co.uk</a> or call <a href="tel:+441279905805" style="white-space:nowrap">01279 905 805</a>.';
    [].forEach.call(document.querySelectorAll("form[data-form]"), function (f) {
      var kind = f.getAttribute("data-form");
      var endpoint = "https://formspree.io/f/" + M.formId;
      f.action = endpoint;
      var btn = f.querySelector('button[type="submit"], button:not([type])');
      var help = document.createElement("p");
      help.className = "form-help";
      help.setAttribute("role", "status");
      help.style.cssText = "font-size:.85em;margin:10px 0 0;line-height:1.5;flex:1 0 100%;width:100%";
      help.hidden = true;
      f.appendChild(help);

      function reset() {
        if (!btn) return;
        if (btn.hasAttribute("data-label")) btn.textContent = btn.getAttribute("data-label");
        btn.removeAttribute("aria-busy");
        btn.style.opacity = "";
        btn.style.pointerEvents = "";
      }

      f.addEventListener("submit", function (e) {
        e.preventDefault();
        if (btn) {
          if (!btn.hasAttribute("data-label")) btn.setAttribute("data-label", btn.textContent);
          btn.textContent = "Sending...";
          btn.setAttribute("aria-busy", "true");
          btn.style.opacity = ".75";
          btn.style.pointerEvents = "none";
        }
        if (getComputedStyle(f).display.indexOf("flex") > -1) f.style.flexWrap = "wrap";
        help.style.color = "";
        help.innerHTML = "Sending your details. If you have any trouble, " + contactLine;
        help.hidden = false;

        // Send only the visitor's answers, the subject line and the spam trap.
        var data = new FormData(f);
        [].slice.call(f.querySelectorAll("input[name^='_']")).forEach(function (i) {
          if (i.name !== "_subject") data.delete(i.name);
        });
        var trap = f.querySelector('input[name="_honey"], input[name="_gotcha"]');
        if (trap && trap.value) return; // a spam robot filled the hidden box: quietly do nothing
        data.append("form", { contact: "Enquiry", newsletter: "Newsletter sign up", report: "Example report request" }[kind] || kind);
        data.append("page", location.pathname);

        var done = false;
        var timer = setTimeout(function () { if (!done) fail(); }, 20000);
        function fail() {
          done = true;
          clearTimeout(timer);
          reset();
          help.style.color = "#b42318";
          help.innerHTML = "Sorry, your details could not be sent just now. Please try again, or " + contactLine;
        }
        if (!M.formId) return fail();
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (done) return;
            if (!r.ok) return fail();
            done = true;
            clearTimeout(timer);
            location.href = new URL("thank-you?type=" + kind, location.href).href;
          })
          .catch(function () { if (!done) fail(); });
      });
    });

    // If a visitor comes back to the page with the browser's back button, put the buttons back to normal.
    window.addEventListener("pageshow", function () {
      [].forEach.call(document.querySelectorAll("form[data-form] [data-label]"), function (b) {
        b.textContent = b.getAttribute("data-label");
        b.removeAttribute("aria-busy");
        b.style.opacity = "";
        b.style.pointerEvents = "";
      });
      [].forEach.call(document.querySelectorAll("form[data-form] .form-help"), function (p) { p.hidden = true; });
    });

    // WhatsApp button appears once a number is set above.
    [].forEach.call(document.querySelectorAll("[data-whatsapp]"), function (a) {
      if (M.whatsapp) { a.href = "https://wa.me/" + M.whatsapp; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
    });

    // Google Ads: About page visit.
    if (/\/about(\.html)?\/?$/.test(location.pathname)) M.adsConversion(M.adsAboutLabel);

    // Track phone, email and WhatsApp clicks.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var h = a.getAttribute("href");
      if (h.indexOf("https://wa.me/") === 0) {
        M.event("whatsapp_click", { link_url: h });
        M.adsConversion(M.adsWhatsappLabel);
      }
      if (h.indexOf("tel:") === 0) M.event("phone_click", { link_url: h });
      else if (h.indexOf("mailto:") === 0) M.event("email_click", { link_url: h });
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
    [".about-intro .page-title", "fade", 1.2], [".about-copy p", "fade", 1.0], [".about-img", "float", 1.0],
    [".car-intro .media", "float", 1.2], [".jd2 .btn", "expand", 0.8], [".vgrid .dna", "arc", 1.5], [".tiles3 .tl", "float", 0.7]
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
  css += "html.anim-on .news-hero{overflow:hidden}html.anim-on .news-hero .bg{inset:-14% 0;will-change:transform}\n";
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
    // News page: the townhouse photo drifts gently as the page scrolls.
    var bg = document.querySelector(".news-hero .bg");
    if (bg) {
      var sec = bg.parentNode, tick = false;
      var move = function () {
        tick = false;
        var r = sec.getBoundingClientRect(), vh = innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (vh - r.top) / (vh + r.height) - 0.5; // -0.5 to 0.5 while on screen
        bg.style.transform = "translate3d(0," + (p * r.height * 0.2).toFixed(1) + "px,0)";
      };
      addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(move); } }, { passive: true });
      addEventListener("resize", move); move();
    }
  });
})();
