/**
 * Santa Catarina guide leads.
 * Bound to the Google Sheet (Extensions > Apps Script).
 *
 * Pegá los enlaces de Drive de los PDF (cualquiera con el enlace puede ver).
 * Los mismos enlaces van en guides/santa-catarina/script.js.
 * GUIDE_URL_PT queda listo para cuando exista el PDF en portugués.
 */
const GUIDE_URL_ES = 'PASTE_GUIDE_URL_ES_HERE';
const GUIDE_URL_EN = 'PASTE_GUIDE_URL_EN_HERE';
const GUIDE_URL_PT = 'PASTE_GUIDE_URL_PT_HERE';

const HEADERS = [
  'timestamp',
  'name',
  'email',
  'country',
  'travel_month',
  'trip_length',
  'guide_language',
  'newsletter_opt_in',
  'consent',
  'page_language',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign'
];

function doGet() {
  return json({ ok: true, service: 'santa-catarina-leads' });
}

function doPost(e) {
  try {
    var data = (e && e.parameter) ? e.parameter : {};

    if (clean(data.honeypot) !== '') {
      return json({ ok: true });
    }

    var name = clean(data.name).slice(0, 120);
    var email = clean(data.email).toLowerCase();
    if (!name || !isEmail(email)) {
      return json({ ok: false });
    }
    if (!isYes(data.consent)) {
      return json({ ok: false });
    }

    var pageLanguage = pageLanguageOf(data.page_language);
    var guideLanguage = guideLanguageOf(data.guide_language, pageLanguage);

    var row = [
      clean(data.timestamp) || new Date().toISOString(),
      name,
      email,
      clean(data.country).slice(0, 80),
      clean(data.travel_month).slice(0, 40),
      clean(data.trip_length).slice(0, 40),
      guideLanguage,
      isYes(data.newsletter_opt_in) ? 'yes' : 'no',
      'yes',
      pageLanguage,
      clean(data.referrer).slice(0, 500),
      clean(data.utm_source).slice(0, 200),
      clean(data.utm_medium).slice(0, 200),
      clean(data.utm_campaign).slice(0, 200)
    ];

    appendLead(row);

    var emailLanguage = pageLanguage === 'pt' ? 'pt' : (guideLanguage === 'es' ? 'es' : 'en');
    try {
      sendGuideEmail(email, name, emailLanguage, guideLanguage, guideUrlFor(guideLanguage), row[7] === 'yes');
    } catch (mailErr) {
      console.error(mailErr);
      return json({ ok: true, emailed: false });
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false });
  }
}

function appendLead(row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads');
    if (!sheet) sheet = ss.insertSheet('Leads');
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function pageLanguageOf(value) {
  var v = clean(value).toLowerCase();
  if (v === 'es' || v === 'en' || v === 'pt') return v;
  return 'en';
}

function guideLanguageOf(value, pageLanguage) {
  var v = clean(value).toLowerCase();
  if (v === 'es' || v === 'en' || v === 'pt') return v;
  return pageLanguage === 'es' ? 'es' : 'en';
}

function guideUrlFor(code) {
  if (code === 'es') return GUIDE_URL_ES;
  if (code === 'pt') return GUIDE_URL_PT;
  return GUIDE_URL_EN;
}

function sendGuideEmail(email, name, emailLanguage, guideLanguage, guideUrl, newsletter) {
  var copy = {
    es: {
      subject: 'Tu guía de Santa Catarina 🌴',
      button: 'Descargá la guía',
      fallback: 'Si el botón no abre, copiá este enlace:',
      missing: 'El enlace de descarga todavía no está configurado. Respondé a este email y te lo pasamos.',
      newsYes: 'También te anotamos para novedades de viaje, de vez en cuando.',
      newsNo: 'No te vamos a mandar otras novedades: solo esta guía.',
      intro: 'Hola ' + escapeHtml(name) + ',<br><br>gracias por pedir la Guía de naturaleza de Santa Catarina 2026. Adentro hay dos rutas: una semana en la isla de Florianópolis y sus vecinos, y dos semanas que suman la costa sur, las ballenas y la Serra. Cada día trae qué hacer, el mejor horario, un presupuesto aproximado en reales y el tip de Rennie.',
      close: 'Cuando quieras, pasá por <a href="https://pabloyluisagarcia.com/" style="color:#0071e3;">pabloyluisagarcia.com</a>.<br><br>Un abrazo,<br>Pablo y Luisa',
      footerTail: ' Para darte de baja o pedir que borremos tus datos, respondé a este email.',
      plainHello: 'Hola ' + name + ',\n\nGracias por pedir la Guía de naturaleza de Santa Catarina 2026.\n\nDescargá la guía: '
    },
    en: {
      subject: 'Your Santa Catarina guide 🌴',
      button: 'Download the guide',
      fallback: "If the button doesn't open, copy this link:",
      missing: 'The download link is not ready yet. Reply to this email and we will send it.',
      newsYes: "You're also signed up for occasional travel news.",
      newsNo: "We won't send anything else. Just this guide.",
      intro: 'Hi ' + escapeHtml(name) + ',<br><br>thank you for requesting the Santa Catarina Nature Travel Guide 2026. Inside are two routes: one week on Florianópolis island and nearby, and two weeks that add the south coast, the whales and the Serra. Every day includes what to do, the best time to go, an approximate budget in reais and Rennie\'s tip.',
      close: 'Whenever you like, visit <a href="https://pabloyluisagarcia.com/" style="color:#0071e3;">pabloyluisagarcia.com</a>.<br><br>Warmly,<br>Pablo y Luisa Garcia',
      footerTail: ' To unsubscribe or ask us to delete your data, reply to this email.',
      plainHello: 'Hi ' + name + ',\n\nThank you for requesting the Santa Catarina Nature Travel Guide 2026.\n\nDownload the guide: '
    },
    pt: {
      subject: 'Seu guia de Santa Catarina 🌴',
      button: 'Baixar o guia',
      fallback: 'Se o botão não abrir, copie este link:',
      missing: 'O link de download ainda não está pronto. Responda a este e-mail e a gente envia.',
      newsYes: 'Você também está na lista de novidades de viagem, de vez em quando.',
      newsNo: 'Não vamos mandar outras novidades: só este guia.',
      intro: 'Oi ' + escapeHtml(name) + ',<br><br>obrigado por pedir o Guia de natureza de Santa Catarina 2026. Dentro há dois roteiros: uma semana na ilha de Florianópolis e arredores, e duas semanas que somam o litoral sul, as baleias e a Serra. Cada dia traz o que fazer, o melhor horário, um orçamento aproximado em reais e a dica do Rennie.' +
        (guideLanguage === 'es' ? ' O PDF está em espanhol.' : guideLanguage === 'pt' ? ' O PDF está em português.' : ' O PDF está em inglês.'),
      close: 'Quando quiser, passe em <a href="https://pabloyluisagarcia.com/" style="color:#0071e3;">pabloyluisagarcia.com</a>.<br><br>Um abraço,<br>Pablo e Luisa',
      footerTail: ' Para sair da lista ou pedir que apaguemos seus dados, responda a este e-mail.',
      plainHello: 'Oi ' + name + ',\n\nObrigado por pedir o Guia de natureza de Santa Catarina 2026.\n\nBaixar o guia: '
    }
  };
  var text = copy[emailLanguage] || copy.en;
  var href = safeHttps(guideUrl);
  var subject = text.subject;
  var button = text.button;
  var linkBlock = href
    ? '<p style="margin:24px 0;"><a href="' + escapeHtml(href) + '" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;line-height:1;padding:14px 28px;border-radius:980px;">' + button + '</a></p>' +
      '<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#6e6e73;">' +
      text.fallback +
      '<br><a href="' + escapeHtml(href) + '" style="color:#0071e3;word-break:break-all;">' + escapeHtml(href) + '</a></p>'
    : '<p style="margin:16px 0;font-size:15px;line-height:1.5;color:#3a3a3c;">' + text.missing + '</p>';

  var news = newsletter ? text.newsYes : text.newsNo;
  var intro = text.intro;
  var close = text.close;
  var footer = news + text.footerTail;

  var html = '' +
    '<div style="margin:0;padding:24px 16px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#1d1d1f;">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px 24px;">' +
    '<p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0071e3;">Pablo y Luisa Garcia</p>' +
    '<p style="margin:0 0 8px;font-size:16px;line-height:1.5;">' + intro + '</p>' +
    linkBlock +
    '<p style="margin:0;font-size:16px;line-height:1.5;">' + close + '</p>' +
    '<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(0,0,0,0.08);font-size:13px;line-height:1.45;color:#6e6e73;">' + footer + '</p>' +
    '</div></div>';

  var plain = text.plainHello + (href || text.missing) + '\n\nhttps://pabloyluisagarcia.com/\n\n' + footer;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: plain,
    htmlBody: html,
    name: 'Pablo y Luisa Garcia'
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function isYes(value) {
  var v = String(value || '').toLowerCase();
  return v === 'yes' || v === 'on' || v === 'true' || v === '1';
}

function safeHttps(value) {
  var url = clean(value);
  if (!/^https:\/\/.+/i.test(url)) return '';
  return url;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
