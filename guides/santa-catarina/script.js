/* Santa Catarina guide funnel.
   LEAD_ENDPOINT is the Apps Script web app URL (ends in /exec).
   GUIDE_URL_ES and GUIDE_URL_EN are the Google Drive share links.
   GUIDE_URL_PT is the Google Drive share link for the Portuguese PDF. */
const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbyasYJWdCZpjOa5GytpBfSisBOKfvbG1-PipfP-cjl0EeGvZXRhX4RlaVASqxTxBRx5/exec";
const GUIDE_URL_ES = "https://drive.google.com/file/d/1pMaLtY9xGUU9FSCeMqvcq_aPF08rTYtD/view?usp=sharing";
const GUIDE_URL_EN = "https://drive.google.com/file/d/1hSOW5je5IiQijxPdsSKecmyOYGj5ljQG/view?usp=sharing";
const GUIDE_URL_PT = "https://drive.google.com/file/d/1M9OljzWi3CAUWCf4edcrfZ_5qeQ8P2im/view?usp=sharing";

(function () {
  "use strict";

  var LANG_KEY = "sc-guide-lang";
  var lang = normalize(document.documentElement.getAttribute("data-lang"));

  var copy = {
    es: {
      errorName: "Escribí tu nombre.",
      errorEmail: "Escribí un email válido.",
      errorConsent: "Necesitamos tu consentimiento para enviarte la guía.",
      errorSend: "No pudimos enviar el formulario. Intentá de nuevo en un momento.",
      language: "Idioma"
    },
    en: {
      errorName: "Enter your name.",
      errorEmail: "Enter a valid email.",
      errorConsent: "We need your consent to send you the guide.",
      errorSend: "We couldn't send the form. Try again in a moment.",
      language: "Language"
    },
    pt: {
      errorName: "Escreva seu nome.",
      errorEmail: "Escreva um e-mail válido.",
      errorConsent: "Precisamos do seu consentimento para enviar o guia.",
      errorSend: "Não conseguimos enviar o formulário. Tente de novo daqui a pouco.",
      language: "Idioma"
    }
  };

  function normalize(code) {
    return code === "es" || code === "pt" ? code : "en";
  }

  function guideDefault(code) {
    return code === "es" || code === "pt" ? code : "en";
  }

  function photoCode(code) {
    return code === "es" || code === "pt" ? code : "en";
  }

  function currentCopy() {
    return copy[lang] || copy.en;
  }

  function guideUrl(code) {
    if (code === "es") return GUIDE_URL_ES;
    if (code === "pt") return GUIDE_URL_PT;
    return GUIDE_URL_EN;
  }

  function resolveGuideLanguage() {
    var select = document.getElementById("guide-language");
    var chosen = select ? select.value : "";
    if (chosen === "es" || chosen === "en" || chosen === "pt") return chosen;
    if (lang === "es" || lang === "pt") return lang;
    return "en";
  }

  function applyDownloadLink() {
    var download = document.getElementById("thanks-download");
    if (download) download.href = guideUrl(resolveGuideLanguage());
  }

  function photoSrcset(base, code) {
    return (
      "img/" + base + "-" + code + "-640.webp 640w, " +
      "img/" + base + "-" + code + "-1200.webp 1200w, " +
      "img/" + base + "-" + code + "-1600.webp 1600w"
    );
  }

  function applyMeta(code) {
    var meta = window.__scMeta && window.__scMeta[code];
    if (!meta) return;
    document.title = meta.title;
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", meta.description);
    var pairs = [
      ['meta[property="og:title"]', meta.title],
      ['meta[property="og:description"]', meta.description],
      ['meta[name="twitter:title"]', meta.title],
      ['meta[name="twitter:description"]', meta.description]
    ];
    pairs.forEach(function (pair) {
      var node = document.querySelector(pair[0]);
      if (node) node.setAttribute("content", pair[1]);
    });
    if (meta.image) {
      var ogImage = document.querySelector('meta[property="og:image"]');
      var twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (ogImage) ogImage.setAttribute("content", meta.image);
      if (twitterImage) twitterImage.setAttribute("content", meta.image);
    }
    var locale = document.querySelector('meta[property="og:locale"]');
    if (locale) {
      locale.setAttribute("content", code === "es" ? "es_AR" : code === "pt" ? "pt_BR" : "en_US");
    }
  }

  function applyLanguage(code, persist) {
    lang = normalize(code);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    if (persist) {
      try {
        localStorage.setItem(LANG_KEY, lang);
      } catch (err) {}
    }
    applyMeta(lang);

    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    document.querySelectorAll(".lang-switch").forEach(function (group) {
      group.setAttribute("aria-label", currentCopy().language);
    });
    document.querySelectorAll("[data-ph-en]").forEach(function (field) {
      field.placeholder = field.getAttribute("data-ph-" + lang) || field.getAttribute("data-ph-en") || "";
    });
    document.querySelectorAll("option[data-en]").forEach(function (option) {
      option.textContent = option.getAttribute("data-" + lang) || option.getAttribute("data-en") || option.textContent;
    });

    var pictures = photoCode(lang);
    document.querySelectorAll("[data-photo]").forEach(function (img) {
      var base = img.getAttribute("data-photo");
      if (!base) return;
      var shown = img.getAttribute("src") || "";
      var next = "img/" + base + "-" + pictures + "-";
      var alt = img.getAttribute(pictures === "es" ? "data-alt-es" : pictures === "pt" ? "data-alt-pt" : "data-alt-en") || img.alt;
      if (shown.indexOf(next) === 0) {
        img.alt = alt;
        return;
      }
      img.srcset = photoSrcset(base, pictures);
      img.src = "img/" + base + "-" + pictures + "-1200.webp";
      img.alt = alt;
    });
    document.querySelectorAll("[data-photo-link]").forEach(function (link) {
      var base = link.getAttribute("data-photo-link");
      if (base) link.href = "img/" + base + "-" + pictures + "-1600.webp";
    });

    var guideLanguage = document.getElementById("guide-language");
    if (guideLanguage && guideLanguage.getAttribute("data-touched") !== "true") {
      guideLanguage.value = guideDefault(lang);
    }
    applyDownloadLink();
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.getAttribute("data-set-lang"), true);
    });
  });

  applyLanguage(lang, false);

  var heroCta = document.getElementById("hero-cta");
  if (heroCta) {
    heroCta.addEventListener("click", function () {
      if (typeof window.gtag === "function") {
        window.gtag("event", "guide_cta_click");
      }
    });
  }

  var form = document.getElementById("lead-form");
  if (!form) return;

  var errorBox = document.getElementById("form-error");
  var thanks = document.getElementById("thanks");
  var submitBtn = document.getElementById("submit-btn");
  var guideLanguage = document.getElementById("guide-language");

  if (guideLanguage) {
    guideLanguage.addEventListener("change", function () {
      guideLanguage.setAttribute("data-touched", "true");
      applyDownloadLink();
    });
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.hidden = !message;
    errorBox.textContent = message || "";
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.querySelectorAll('[data-label="idle"]').forEach(function (node) {
      node.hidden = busy;
    });
    submitBtn.querySelectorAll('[data-label="busy"]').forEach(function (node) {
      node.hidden = !busy;
    });
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function utm(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || "";
    } catch (err) {
      return "";
    }
  }

  document.querySelectorAll(".check a").forEach(function (link) {
    link.addEventListener("click", function (clickEvent) {
      clickEvent.stopPropagation();
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showError("");

    var name = (form.name.value || "").trim();
    var email = (form.email.value || "").trim();
    var consent = form.consent && form.consent.checked;
    var honeypot = form.honeypot ? form.honeypot.value : "";
    var selectedGuide = resolveGuideLanguage();

    if (!name) {
      showError(currentCopy().errorName);
      form.name.focus();
      return;
    }
    if (!validEmail(email)) {
      showError(currentCopy().errorEmail);
      form.email.focus();
      return;
    }
    if (!consent) {
      showError(currentCopy().errorConsent);
      if (form.consent) form.consent.focus();
      return;
    }

    var params = new URLSearchParams();
    params.set("name", name);
    params.set("email", email);
    params.set("country", (form.country.value || "").trim());
    params.set("travel_month", form.travel_month.value || "");
    params.set("trip_length", form.trip_length.value || "");
    params.set("guide_language", selectedGuide);
    params.set("newsletter_opt_in", form.newsletter && form.newsletter.checked ? "yes" : "no");
    params.set("consent", "yes");
    params.set("page_language", lang);
    params.set("timestamp", new Date().toISOString());
    params.set("referrer", document.referrer || "");
    params.set("utm_source", utm("utm_source"));
    params.set("utm_medium", utm("utm_medium"));
    params.set("utm_campaign", utm("utm_campaign"));
    params.set("honeypot", honeypot || "");

    setBusy(true);

    fetch(LEAD_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    })
      .then(function () {
        try {
          localStorage.setItem("sc_guide_claimed", "1");
        } catch (err) {}
        if (!honeypot && typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            form: "santa_catarina_guide",
            guide_language: selectedGuide
          });
        }
        document.querySelectorAll(".thanks-email").forEach(function (node) {
          node.textContent = email;
        });
        var download = document.getElementById("thanks-download");
        if (download) download.href = guideUrl(selectedGuide);
        form.hidden = true;
        if (thanks) {
          thanks.hidden = false;
          if (!honeypot) thanks.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      })
      .catch(function () {
        setBusy(false);
        showError(currentCopy().errorSend);
      });
  });
})();
