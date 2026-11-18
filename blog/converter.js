/* Shared currency converter for country pages.
   Mount: <div class="fx-converter" data-local="BRL"></div>
   Rates: https://open.er-api.com/v6/latest/{BASE} cached in localStorage for 12 hours. */
(function () {
  var CACHE_MS = 12 * 60 * 60 * 1000;
  var CACHE_PREFIX = "fx-open-er-api-v1:";
  var ENDPOINT = "https://open.er-api.com/v6/latest/";
  var SVG_NS = "http://www.w3.org/2000/svg";

  var CURRENCIES = [
    { code: "USD", name: "US dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British pound" },
    { code: "CAD", name: "Canadian dollar" },
    { code: "AUD", name: "Australian dollar" },
    { code: "MXN", name: "Mexican peso" },
    { code: "CLP", name: "Chilean peso" },
    { code: "PEN", name: "Peruvian sol" },
    { code: "UYU", name: "Uruguayan peso" },
    { code: "BRL", name: "Brazilian real" },
    { code: "ARS", name: "Argentine peso" },
    { code: "COP", name: "Colombian peso" },
    { code: "CHF", name: "Swiss franc" },
    { code: "JPY", name: "Japanese yen" }
  ];

  var NAMES = {};
  CURRENCIES.forEach(function (currency) {
    NAMES[currency.code] = currency.name;
  });

  var formatters = {};
  var memory = {};
  var widgetCount = 0;

  function isCode(value) {
    return /^[A-Z]{3}$/.test(value);
  }

  function currencyName(code) {
    return NAMES[code] || code;
  }

  function parseAmount(raw) {
    if (raw === null || raw === undefined) return null;
    var text = String(raw).trim();
    if (!text) return null;
    var n = Number(text);
    if (!isFinite(n)) return null;
    return n;
  }

  function formatMoney(value, currency) {
    if (!Object.prototype.hasOwnProperty.call(formatters, currency)) {
      try {
        formatters[currency] = new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency
        });
      } catch (err) {
        formatters[currency] = null;
      }
    }
    var formatter = formatters[currency];
    if (!formatter) return value.toFixed(2) + " " + currency;
    return formatter.format(value);
  }

  function formatUpdated(utc) {
    var date = new Date(utc);
    if (isNaN(date.getTime())) return utc || "recently";
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short"
      }).format(date);
    } catch (err) {
      return utc;
    }
  }

  function readCache(base) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + base);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.savedAt !== "number" || !isFinite(data.savedAt)) return null;
      if (!data.rates || typeof data.rates !== "object" || Array.isArray(data.rates)) return null;
      if (typeof data.time_last_update_utc !== "string" || !data.time_last_update_utc) return null;
      var age = Date.now() - data.savedAt;
      if (age < -60000 || age > CACHE_MS) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function writeCache(base, entry) {
    try {
      localStorage.setItem(CACHE_PREFIX + base, JSON.stringify({
        savedAt: entry.savedAt,
        time_last_update_utc: entry.time_last_update_utc,
        rates: entry.rates
      }));
    } catch (err) {
      /* Private mode or a full disk should still leave the live rate on screen. */
    }
  }

  function fetchRates(base) {
    if (typeof fetch !== "function") return Promise.reject(new Error("fetch"));
    return fetch(ENDPOINT + base).then(function (res) {
      if (!res.ok) throw new Error("status");
      return res.json();
    }).then(function (data) {
      if (!data || data.result !== "success" || !data.rates || typeof data.rates !== "object") {
        throw new Error("shape");
      }
      if (typeof data.time_last_update_utc !== "string" || !data.time_last_update_utc) {
        throw new Error("time");
      }
      return {
        savedAt: Date.now(),
        time_last_update_utc: data.time_last_update_utc,
        rates: data.rates
      };
    });
  }

  function paragraph(className, text) {
    var p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    return p;
  }

  function swapIcon() {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    [
      "M4 7h14",
      "M14 4l4 3-4 3",
      "M20 17H6",
      "M10 14l-4 3 4 3"
    ].forEach(function (d) {
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
    });
    return svg;
  }

  function mount(root) {
    if (root.getAttribute("data-ready") === "true") return;
    root.setAttribute("data-ready", "true");

    var local = (root.getAttribute("data-local") || "").trim().toUpperCase();
    var validLocal = isCode(local);
    var id = ++widgetCount;
    var swapped = false;
    var request = 0;

    var form = document.createElement("form");
    form.setAttribute("autocomplete", "off");
    form.setAttribute("novalidate", "novalidate");
    form.setAttribute("aria-labelledby", "fx-title-" + id);

    var title = document.createElement("h3");
    title.className = "fx-title";
    title.id = "fx-title-" + id;
    title.textContent = "Currency converter";

    var fields = document.createElement("div");
    fields.className = "fx-fields";

    var amountField = document.createElement("div");
    amountField.className = "fx-field";
    var amountLabel = document.createElement("label");
    amountLabel.setAttribute("for", "fx-amount-" + id);
    amountLabel.textContent = "Amount";
    var amountInput = document.createElement("input");
    amountInput.className = "fx-amount";
    amountInput.id = "fx-amount-" + id;
    amountInput.type = "number";
    amountInput.min = "0";
    amountInput.step = "any";
    amountInput.inputMode = "decimal";
    amountInput.value = "100";
    amountInput.setAttribute("autocomplete", "off");
    amountInput.setAttribute("spellcheck", "false");
    amountField.appendChild(amountLabel);
    amountField.appendChild(amountInput);

    var currencyField = document.createElement("div");
    currencyField.className = "fx-field";
    var currencyLabel = document.createElement("label");
    currencyLabel.className = "fx-currency-label";
    currencyLabel.setAttribute("for", "fx-currency-" + id);
    currencyLabel.textContent = "From";
    var select = document.createElement("select");
    select.className = "fx-currency";
    select.id = "fx-currency-" + id;
    CURRENCIES.forEach(function (currency) {
      var option = document.createElement("option");
      option.value = currency.code;
      option.textContent = currency.code + " \u2014 " + currency.name;
      if (currency.code === "USD") option.selected = true;
      select.appendChild(option);
    });
    currencyField.appendChild(currencyLabel);
    currencyField.appendChild(select);

    var swap = document.createElement("button");
    swap.type = "button";
    swap.className = "fx-swap";
    swap.setAttribute("aria-pressed", "false");
    swap.appendChild(swapIcon());
    var swapText = document.createElement("span");
    swapText.textContent = "Swap";
    swap.appendChild(swapText);

    fields.appendChild(amountField);
    fields.appendChild(currencyField);
    fields.appendChild(swap);

    var output = document.createElement("div");
    output.className = "fx-output";
    output.setAttribute("aria-live", "polite");
    output.setAttribute("aria-atomic", "true");

    var note = document.createElement("p");
    note.className = "fx-note";
    note.hidden = true;
    var updated = document.createElement("span");
    updated.className = "fx-updated";
    var attribution = document.createElement("a");
    attribution.href = "https://www.exchangerate-api.com";
    attribution.textContent = "Rates by Exchange Rate API";
    note.appendChild(updated);
    note.appendChild(attribution);

    form.appendChild(title);
    form.appendChild(fields);
    form.appendChild(output);
    form.appendChild(note);
    root.appendChild(form);

    function setOutput(nodes) {
      while (output.firstChild) output.removeChild(output.firstChild);
      nodes.forEach(function (node) { output.appendChild(node); });
    }

    function showMessage(text) {
      setOutput([paragraph("fx-message", text)]);
      note.hidden = true;
    }

    function showResult(amount, from, to, entry) {
      var rate = from === to ? 1 : entry.rates[to];
      if (typeof rate !== "number" || !isFinite(rate)) {
        showMessage("Rates unavailable right now");
        return;
      }
      setOutput([
        paragraph("fx-equals", formatMoney(amount, from) + " equals"),
        paragraph("fx-result", formatMoney(amount * rate, to))
      ]);
      updated.textContent = "Rates updated " + formatUpdated(entry.time_last_update_utc) + " \u00b7 indicative only";
      note.hidden = false;
    }

    function updateLabels(from, to) {
      currencyLabel.textContent = swapped ? "To" : "From";
      swap.setAttribute("aria-pressed", swapped ? "true" : "false");
      swap.setAttribute(
        "aria-label",
        "Swap currencies. Amount is in " + currencyName(from) + " and the result is in " + currencyName(to) + "."
      );
    }

    function render() {
      var token = ++request;
      var traveler = select.value;
      var from = swapped ? local : traveler;
      var to = swapped ? traveler : local;
      updateLabels(from, to);

      if (!validLocal || !isCode(traveler)) {
        showMessage("Rates unavailable right now");
        return;
      }

      var amount = parseAmount(amountInput.value);
      if (amount === null || amount < 0) {
        showMessage("Enter an amount");
        return;
      }

      var cached = memory[from] || readCache(from);
      if (cached) {
        memory[from] = cached;
        showResult(amount, from, to, cached);
        return;
      }

      showMessage("Loading rates\u2026");
      fetchRates(from).then(function (entry) {
        memory[from] = entry;
        writeCache(from, entry);
        if (token !== request) return;
        showResult(amount, from, to, entry);
      }).catch(function () {
        if (token !== request) return;
        showMessage("Rates unavailable right now");
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    amountInput.addEventListener("input", render);
    select.addEventListener("change", render);
    swap.addEventListener("click", function () {
      swapped = !swapped;
      render();
    });

    render();
  }

  var widgets = document.querySelectorAll(".fx-converter");
  Array.prototype.forEach.call(widgets, mount);
})();
