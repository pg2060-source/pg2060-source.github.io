/* Shared analytics for pabloyluisagarcia.com.
   Pages load this file from a short dataLayer stub in <head>. See blog/README.md.

   1. Consent Mode v2 defaults to denied.
   2. Cookie banner. The choice is stored in localStorage as plg-consent.
   3. gtag.js for G-3NC3C9DM0S, including the cross-domain linker.
   Click events are delegated here. converter_use is sent from blog/converter.js. */
(function () {
  "use strict";

  if (window.__plgAnalytics) return;
  window.__plgAnalytics = true;

  var MEASUREMENT_ID = "G-3NC3C9DM0S";
  var CONSENT_KEY = "plg-consent";
  var LINKER_DOMAINS = ["pabloyluisagarcia.com", "rockisland.pabloyluisagarcia.com"];

  var DENIED = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  var GRANTED = {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted"
  };

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  var gtag = window.gtag;

  function readChoice() {
    try {
      var value = localStorage.getItem(CONSENT_KEY);
      if (value === "granted" || value === "denied") return value;
    } catch (err) {}
    return "";
  }

  function writeChoice(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (err) {}
  }

  var choice = readChoice();

  gtag("consent", "default", DENIED);
  if (choice === "granted") gtag("consent", "update", GRANTED);

  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);
  gtag("set", "linker", {
    domains: LINKER_DOMAINS,
    accept_incoming: true
  });
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    linker: {
      domains: LINKER_DOMAINS,
      accept_incoming: true
    }
  });

  var loader = document.createElement("script");
  loader.async = true;
  loader.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  (document.head || document.documentElement).appendChild(loader);

  function track(name, params) {
    try {
      if (typeof window.gtag !== "function") return;
      if (params) window.gtag("event", name, params);
      else window.gtag("event", name);
    } catch (err) {}
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function closest(node, test) {
    while (node && node !== document) {
      if (node.nodeType === 1 && test(node)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function hostOf(link) {
    try {
      return new URL(link.href).hostname.toLowerCase();
    } catch (err) {
      return "";
    }
  }

  function bareHost(host) {
    return host.replace(/^www\./, "");
  }

  function hostIs(host, name) {
    return host === name || host.slice(-(name.length + 1)) === "." + name;
  }

  function tourPlatformFromHost(host) {
    host = bareHost(host);
    if (host === "gyg.me" || hostIs(host, "getyourguide.com")) return "getyourguide";
    if (hostIs(host, "viator.com")) return "viator";
    if (hostIs(host, "tripadvisor.com")) return "tripadvisor";
    return "";
  }

  function socialPlatform(host) {
    host = bareHost(host);
    if (host === "music.youtube.com") return "youtube_music";
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") return "youtube";
    if (host === "open.spotify.com" || host === "spotify.com") return "spotify";
    if (host === "instagram.com") return "instagram";
    if (host === "tiktok.com" || host === "vm.tiktok.com") return "tiktok";
    return "";
  }

  function destinationOf(link) {
    var direct = cleanText(link.getAttribute("data-tour-destination"));
    if (direct) return direct;
    var card = closest(link, function (node) { return node.classList.contains("tour-card"); });
    if (card) {
      direct = cleanText(card.getAttribute("data-tour-destination"));
      if (direct) return direct;
    }
    var panel = closest(link, function (node) { return node.classList.contains("dest-panel"); });
    if (!panel) return "";
    var heading = panel.querySelector(".dest-panel-hero-overlay h2");
    return heading ? cleanText(heading.textContent) : "";
  }

  function tourNameOf(link) {
    var direct = cleanText(link.getAttribute("data-tour-name"));
    if (direct) return direct;
    var card = closest(link, function (node) { return node.classList.contains("tour-card"); });
    if (!card) return "";
    direct = cleanText(card.getAttribute("data-tour-name"));
    if (direct) return direct;
    var heading = card.querySelector("h3");
    return heading ? cleanText(heading.textContent) : "";
  }

  function platformOf(link, host) {
    var fromHost = tourPlatformFromHost(host);
    if (fromHost) return fromHost;
    var attr = cleanText(link.getAttribute("data-tour-platform")).toLowerCase();
    if (attr === "getyourguide" || attr === "viator" || attr === "tripadvisor") return attr;
    return "";
  }

  function blogTourDestination(link) {
    var match = /^Check our tours in\s+(.+)$/i.exec(cleanText(link.textContent));
    if (!match) return "";
    return match[1].replace(/[.\s]+$/, "");
  }

  document.addEventListener("click", function (event) {
    var link = closest(event.target, function (node) { return node.tagName === "A"; });
    if (!link || link.classList.contains("btn-coming-soon")) return;

    var host = hostOf(link);
    var platform = platformOf(link, host);
    if (platform) {
      track("tour_click", {
        destination: destinationOf(link),
        platform: platform,
        tour_name: tourNameOf(link)
      });
      return;
    }

    if (host === "rockisland.pabloyluisagarcia.com") {
      track("shop_click");
      return;
    }

    var place = blogTourDestination(link);
    if (place) {
      track("blog_tour_click", { destination: place });
      return;
    }

    var social = socialPlatform(host);
    if (social) track("social_click", { platform: social });
  }, true);

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || form.id !== "mc-embedded-subscribe-form") return;
    if (typeof form.checkValidity === "function" && !form.checkValidity()) return;
    track("generate_lead");
  }, true);

  function ensureStyles() {
    if (document.getElementById("plg-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "plg-consent-styles";
    style.textContent = [
      ".plg-consent{position:fixed;z-index:900;left:0;right:0;bottom:calc(12px + env(safe-area-inset-bottom, 0px));",
      "width:calc(100% - 24px);max-width:640px;max-height:calc(100vh - 24px);overflow:auto;margin:0 auto;box-sizing:border-box;",
      "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 16px;",
      "padding:14px 14px 14px 18px;background:rgba(251,251,253,0.94);",
      "-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);",
      "border:1px solid rgba(0,0,0,0.08);border-radius:18px;",
      "box-shadow:0 10px 40px rgba(0,0,0,0.16);",
      "font-family:-apple-system,\"SF Pro Display\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;",
      "color:#1d1d1f;text-align:left;-webkit-font-smoothing:antialiased}",
      ".plg-consent,.plg-consent *{box-sizing:border-box}",
      ".plg-consent p{flex:1 1 220px;margin:0;font-size:14px;line-height:1.45;letter-spacing:-0.011em;color:#1d1d1f}",
      ".plg-consent-actions{display:flex;flex:0 0 auto;gap:8px}",
      ".plg-consent button{appearance:none;-webkit-appearance:none;font-family:inherit;font-size:14px;font-weight:500;",
      "letter-spacing:-0.01em;line-height:1;border-radius:980px;padding:0 18px;min-height:44px;cursor:pointer}",
      ".plg-consent-decline{background:transparent;color:#1d1d1f;border:1.5px solid rgba(0,0,0,0.18)}",
      ".plg-consent-decline:hover{background:rgba(0,0,0,0.04)}",
      ".plg-consent-accept{background:#0071e3;color:#fff;border:1.5px solid #0071e3}",
      ".plg-consent-accept:hover{background:#0077ed;border-color:#0077ed}",
      ".plg-consent button:focus-visible{outline:2px solid #0071e3;outline-offset:3px}",
      "@media (max-width:560px){",
      ".plg-consent{padding:14px;gap:12px}",
      ".plg-consent-actions{flex:1 1 100%}",
      ".plg-consent-actions button{flex:1 1 0}}",
      "@media (max-height:420px){",
      ".plg-consent{padding:8px 10px 8px 14px;gap:8px;bottom:8px}",
      ".plg-consent p{font-size:13px;line-height:1.35;flex-basis:140px}",
      ".plg-consent button{min-height:36px;padding:0 12px;font-size:13px}}",
      "@media (prefers-reduced-motion:reduce){.plg-consent{animation:none}}",
      "@media print{.plg-consent{display:none !important}}"
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  }

  function mountBanner() {
    if (choice === "granted" || choice === "denied") return;
    if (!document.body || document.querySelector(".plg-consent")) return;

    var banner = document.createElement("div");
    banner.className = "plg-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie consent");

    var text = document.createElement("p");
    text.textContent = "We use cookies to understand how this site is used. Analytics stay off until you accept.";

    var actions = document.createElement("div");
    actions.className = "plg-consent-actions";

    var decline = document.createElement("button");
    decline.type = "button";
    decline.className = "plg-consent-decline";
    decline.textContent = "Decline";

    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "plg-consent-accept";
    accept.textContent = "Accept";

    function choose(value) {
      choice = value;
      writeChoice(value);
      try {
        window.gtag("consent", "update", {
          analytics_storage: value === "granted" ? "granted" : "denied",
          ad_storage: value === "granted" ? "granted" : "denied",
          ad_user_data: value === "granted" ? "granted" : "denied",
          ad_personalization: value === "granted" ? "granted" : "denied"
        });
      } catch (err) {}
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }

    decline.addEventListener("click", function () { choose("denied"); });
    accept.addEventListener("click", function () { choose("granted"); });

    actions.appendChild(decline);
    actions.appendChild(accept);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function start() {
    ensureStyles();
    mountBanner();
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
