/* Infinitum Boxing — SEO pages script. No dependencies, no network calls. */
(function () {
  'use strict';

  /* Mobile menu */
  var toggle = document.querySelector('.mobile-menu-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }

  /* Enquiry builder: builds a WhatsApp / email message from the form */
  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var WA_NUMBER = '923026115717';
  var MAIL = 'infinitumboxing@gmail.com';
  var wa = document.getElementById('send-wa');
  var mail = document.getElementById('send-mail');
  var copyBtn = document.getElementById('copy-msg');
  var status = document.getElementById('copy-status');
  var qtyNote = document.getElementById('qty-note');

  function val(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : '';
  }

  function buildMessage() {
    var custom = Array.prototype.map.call(
      form.querySelectorAll('input[name="custom"]:checked'),
      function (c) { return c.value; }
    );
    var lines = ['Hello Infinitum Boxing, I would like a quote for custom boxing gloves.', ''];
    if (val('type')) lines.push('Glove type: ' + val('type'));
    if (val('qty')) lines.push('Quantity: ' + val('qty') + ' pairs/pieces');
    if (val('country')) lines.push('Destination: ' + val('country'));
    if (custom.length) lines.push('Customisation: ' + custom.join(', '));
    if (val('company')) lines.push('Company/brand: ' + val('company'));
    if (val('notes')) lines.push('Notes: ' + val('notes'));
    lines.push('', 'Page: ' + location.href.split('#')[0]);
    return lines.join('\n');
  }

  function refresh() {
    var msg = buildMessage();
    wa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    mail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Custom boxing gloves quote') +
      '&body=' + encodeURIComponent(msg);
    var q = parseInt(val('qty'), 10);
    qtyNote.textContent = q > 0 && q < 10
      ? 'Our MOQ starts at 10 pairs or pieces, depending on the product. Send it anyway and we will advise.'
      : '';
    return msg;
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  copyBtn.addEventListener('click', function () {
    var msg = refresh();
    function done(ok) {
      status.textContent = ok ? 'Message copied. Paste it into any chat or email.' : 'Could not copy. Select the text manually or use the buttons.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = msg; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
  });

  refresh();
})();
