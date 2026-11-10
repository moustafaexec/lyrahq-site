/* LYRA, landing : le film une fois, le noir, puis la boucle floue qui se refait nette sur SIGN HERE. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.className = root.className.replace(/\bno-js\b/, 'js');

  var stage = document.querySelector('.stage');
  var video = document.querySelector('.film');
  var veil = document.querySelector('.veil');
  var glow = document.querySelector('.glow');
  var black = document.querySelector('.black');
  var skipBtn = document.querySelector('.skip');
  var logoWrap = document.querySelector('.logo-wrap');
  var logoBtn = document.querySelector('.logo');
  var pill = document.querySelector('.pill');
  var pillLabel = document.querySelector('.pill-label');
  var legal = document.querySelector('.legal');
  var lens = document.querySelector('.lens');
  if (!stage || !video) return;

  // Deux films : 16/9 en paysage, vertical en portrait. Seul celui qui sert est téléchargé.
  var FILMS = {
    desktop: { src: 'media/film-desktop.mp4', hd: 'media/film-desktop-2k.mp4', poster: 'media/poster-desktop.jpg', focusAt: 10.4, blur: 9, scale: 1.06 },
    mobile: { src: 'media/film-mobile.mp4', poster: 'media/poster-mobile.jpg', focusAt: 6.4, blur: 8, scale: 1.08 }
  };
  var FADE = 0.45;     // fondu au noir à la fin du film
  var VOILE = 0.42;    // voile sur la boucle floue
  var MAIL = 'moustafa@lyrahq.co';

  // Langue : français si le navigateur est en français, anglais sinon.
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  var fr = /^fr\b/i.test(langs[0] || '');
  var T = fr ? {
    lang: 'fr', cta: 'Être sur la liste', legal: 'Mentions légales', legalHref: 'fr/mentions-legales/',
    subject: 'Invitation LYRA',
    body: 'Bonjour LYRA,\n\nNom :\nCe que je fais (artiste, producteur, auteur, manager, label) :\nUn lien vers mon travail :\n',
    skip: 'Passer le film', replay: 'LYRA, revoir le film',
    film: "Film LYRA : un artiste sort de la cabine, s'assoit avec son contrat et s'apprête à signer."
  } : {
    lang: 'en', cta: 'Request invite', legal: 'Legal', legalHref: 'legal/',
    subject: 'LYRA invite',
    body: 'Hi LYRA,\n\nName:\nWhat I do (artist, producer, songwriter, manager, label):\nA link to my work:\n',
    skip: 'Skip the film', replay: 'LYRA, replay the film',
    film: 'LYRA film: an artist leaves the booth, sits down with his contract and gets ready to sign.'
  };
  var IV = fr ? {
    title: 'Être sur la liste',
    sub: 'LYRA ouvre sur invitation. Laissez-nous vos coordonnées, nous vous écrivons dès que votre accès ouvre.',
    name: 'Nom', email: 'E-mail', role: 'Ce que vous faites', link: 'Lien vers votre travail', optional: 'facultatif',
    pick: 'Choisir', linkPh: 'Instagram, Spotify, SoundCloud…',
    roles: [['Artist', 'Artiste'], ['Producer', 'Producteur'], ['Songwriter', 'Auteur-compositeur'], ['Manager', 'Manager'], ['Label', 'Label'], ['Other', 'Autre']],
    note: 'Ces informations servent uniquement à gérer votre invitation. ', privacy: 'Politique de confidentialité', privacyHref: 'fr/confidentialite/',
    send: 'Envoyer', sending: 'Envoi…', doneT: 'C’est noté.', doneS: 'Nous vous écrivons dès que votre accès ouvre.', close: 'Fermer',
    errFields: 'Indiquez votre nom, un e-mail valide et ce que vous faites.',
    errSend: 'L’envoi n’a pas abouti. Réessayez, ou écrivez à ' + MAIL + '.', sent: 'Demande envoyée'
  } : {
    title: 'Request an invite',
    sub: 'LYRA opens by invitation. Leave your details and we will write to you as soon as your access opens.',
    name: 'Name', email: 'Email', role: 'What you do', link: 'Link to your work', optional: 'optional',
    pick: 'Choose', linkPh: 'Instagram, Spotify, SoundCloud…',
    roles: [['Artist', 'Artist'], ['Producer', 'Producer'], ['Songwriter', 'Songwriter'], ['Manager', 'Manager'], ['Label', 'Label'], ['Other', 'Other']],
    note: 'We only use these details to manage your invitation. ', privacy: 'Privacy policy', privacyHref: 'privacy/',
    send: 'Send', sending: 'Sending…', doneT: 'You’re on the list.', doneS: 'We will write to you as soon as your access opens.', close: 'Close',
    errFields: 'Add your name, a valid email and what you do.',
    errSend: 'That did not go through. Try again, or write to ' + MAIL + '.', sent: 'Request sent'
  };
  function enc(s) { return encodeURIComponent(s).replace(/%0A/g, '%0D%0A'); }
  root.setAttribute('lang', T.lang);
  pillLabel.textContent = T.cta;
  pill.setAttribute('href', 'mailto:' + MAIL + '?subject=' + enc(T.subject) + '&body=' + enc(T.body));
  pill.setAttribute('lang', T.lang);
  legal.textContent = T.legal;
  legal.setAttribute('href', T.legalHref);
  legal.setAttribute('lang', T.lang);
  skipBtn.setAttribute('aria-label', T.skip);
  logoBtn.setAttribute('aria-label', T.replay);
  video.setAttribute('aria-label', T.film);

  var portrait = window.matchMedia('(orientation: portrait)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var still = reduce || saveData;   // pas de film qui bouge : le logo sur l'image floue

  var film = null;
  var started = false;
  var revealed = false;   // le film entre en fondu depuis le noir dès qu'il joue
  var state = { phase: 'film', under: false, focus: false, dip: false, fade: FADE };
  var t = {};

  function clearAll() {
    ['fallback', 'under', 'loop', 'hold', 'reveal'].forEach(function (k) { if (t[k]) clearTimeout(t[k]); t[k] = null; });
  }
  function play() {
    try { var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function set(o) { for (var k in o) state[k] = o[k]; render(); }

  function render() {
    var s = state;
    var isFilm = s.phase === 'film', noir = s.phase === 'noir', boucle = s.phase === 'boucle';
    var blurred = boucle || (noir && s.under);
    var focus = boucle && s.focus;
    var soft = blurred && !focus;
    var dip = boucle && s.dip;
    var fade = s.fade;
    var cfg = FILMS[film] || FILMS.desktop;

    var filmTime = dip ? '0s' : (boucle ? (focus ? '1.2s' : '.7s') : '0s');
    video.style.transition = 'opacity .9s ease, filter ' + filmTime + ' ease, transform ' + filmTime + ' ease';
    video.style.opacity = (revealed || !isFilm) ? 1 : 0;
    video.style.filter = soft ? 'blur(' + cfg.blur + 'px) saturate(0.9)' : 'none';
    video.style.transform = soft ? 'scale(' + cfg.scale + ')' : 'scale(1)';
    veil.style.opacity = boucle ? (focus ? 0.16 : VOILE) : 0;
    glow.style.opacity = boucle ? 1 : 0;

    var blackTime = noir ? fade + 's' : (dip ? '1s' : '2.2s');
    var blackEase = dip || (noir && fade > 0.5) ? 'cubic-bezier(.45, 0, .55, 1)' : 'ease';
    black.style.transition = 'opacity ' + blackTime + ' ' + blackEase;
    black.style.opacity = (noir || dip) ? 1 : 0;

    var logoDelay = noir ? (fade * 0.75).toFixed(2) + 's' : '0s';
    logoWrap.style.transition = 'opacity ' + (isFilm ? '.5s' : '.9s') + ' ease ' + logoDelay +
      ', transform 2.4s cubic-bezier(.2,.7,.2,1) ' + logoDelay + ', filter 1.3s ease ' + logoDelay;
    logoWrap.style.filter = isFilm ? 'blur(6px)' : 'none';
    logoWrap.style.setProperty('--d', logoDelay);
    if (isFilm) logoWrap.classList.remove('on'); else logoWrap.classList.add('on');
    logoWrap.style.opacity = isFilm ? 0 : 1;
    logoWrap.style.transform = 'scale(' + (isFilm ? 1.04 : 1) + ')';
    logoBtn.style.pointerEvents = isFilm ? 'none' : 'auto';
    logoBtn.tabIndex = isFilm ? -1 : 0;
    skipBtn.style.pointerEvents = isFilm ? 'auto' : 'none';
    skipBtn.tabIndex = isFilm ? 0 : -1;

    var ctaDelay = boucle ? '1s' : '0s';
    pill.style.transition = 'opacity .9s ease ' + ctaDelay + ', transform .9s cubic-bezier(.2,.7,.2,1) ' + ctaDelay +
      ', background-color .25s ease, translate .45s cubic-bezier(.2,.7,.2,1)';
    if (!boucle) pill.style.translate = '';
    lens.style.transition = 'opacity .6s ease, transform ' + filmTime + ' ease';
    lens.style.transform = video.style.transform;
    lens.style.filter = 'saturate(0.9)';
    pill.style.opacity = boucle ? 1 : 0;
    pill.style.transform = boucle ? 'translate(-50%, 0)' : 'translate(-50%, 8px)';
    pill.style.pointerEvents = boucle ? 'auto' : 'none';
    pill.tabIndex = boucle ? 0 : -1;
    stage.setAttribute('data-phase', s.phase);
  }

  function toNoir(fast) {
    clearAll();
    var fade = fast ? 0.45 : FADE;
    var ms = Math.round(fade * 1000);
    set({ phase: 'noir', under: false, focus: false, dip: false, fade: fade });
    t.under = setTimeout(function () {
      set({ under: true });
      try { video.currentTime = 0; } catch (e) {}
      play();
    }, ms + 50);
    t.loop = setTimeout(function () { set({ phase: 'boucle' }); }, ms + 2350);
  }
  function arm() {
    if (t.fallback) clearTimeout(t.fallback);
    // Si la lecture automatique est bloquée, on enchaîne quand même sur le logo.
    t.fallback = setTimeout(function () { if (!started) toNoir(true); }, 6000);
    if (t.reveal) clearTimeout(t.reveal);
    t.reveal = setTimeout(function () { if (!revealed) { revealed = true; render(); } }, 1500);
  }
  // Arrivée depuis une page légale : le noir, le logo, puis la boucle floue. Le film ne se rejoue pas.
  function enterLoop() {
    clearAll();
    revealed = true;
    started = true;
    black.style.transition = 'none';
    black.style.opacity = 1;
    void black.offsetWidth;
    set({ phase: 'noir', under: true, focus: false, dip: false, fade: 0.45 });
    try { video.currentTime = 0; } catch (e) {}
    play();
    t.loop = setTimeout(function () { set({ phase: 'boucle' }); }, 700);
  }

  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  video.addEventListener('playing', function () {
    started = true;
    if (!revealed) { revealed = true; render(); }
  });
  video.addEventListener('timeupdate', function () {
    if (state.phase !== 'boucle' || state.focus || state.dip) return;
    // Dans la boucle, l'image se refait nette au moment de SIGN HERE.
    if (video.currentTime >= (FILMS[film] || FILMS.desktop).focusAt) set({ focus: true });
  });
  video.addEventListener('ended', function () {
    if (state.phase === 'film') { toNoir(false); return; }
    if (state.phase === 'noir') return;
    // Boucle : SIGN HERE reste net un instant, fondu au noir sous le logo,
    // le film repart flou sous le noir, puis le noir s'ouvre. Le flou ne saute jamais à l'image.
    if (t.hold) clearTimeout(t.hold);
    t.hold = setTimeout(function () {
      set({ dip: true });
      t.hold = setTimeout(function () {
        set({ focus: false });
        try { video.currentTime = 0; } catch (e) {}
        play();
        t.hold = setTimeout(function () { set({ dip: false }); }, 150);
      }, 1050);
    }, 600);
  });

  skipBtn.addEventListener('click', function () {
    try { video.pause(); } catch (e) {}
    toNoir(true);
  });
  logoBtn.addEventListener('click', function () {
    if (still) return;
    clearAll();
    started = false;
    set({ phase: 'film', under: false, focus: false, dip: false });
    try { video.currentTime = 0; } catch (e) {}
    play();
    arm();
  });

  // Demande d'invitation : le bouton ouvre le formulaire du site. L'envoi part vers le script Google de LYRA,
  // qui range la demande dans une feuille et prévient par e-mail. Tant que le script n'est pas branché, la messagerie prend le relais.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxzDuQSfyLYGlgdjRtdjPdu2XtsStI-ZKA0xsfo4FR0NKvKUReN_r9hfTUtx2QXzPk07Q/exec';
  var invite = document.getElementById('invite');
  var card = invite && invite.querySelector('.invite-card');
  var form = document.getElementById('invite-form');
  var doneBox = invite && invite.querySelector('.invite-done');
  var sendBtn = form && form.querySelector('.invite-send');
  var msg = form && form.querySelector('.invite-msg');
  var openedAt = 0, lastFocus = null, busy = false;
  function q(sel) { return invite.querySelector(sel); }
  if (invite && form) {
    q('#invite-title').textContent = IV.title;
    q('.invite-form .invite-sub').textContent = IV.sub;
    q('label[for="iv-name"]').textContent = IV.name;
    q('label[for="iv-email"]').textContent = IV.email;
    q('label[for="iv-role"]').textContent = IV.role;
    var ll = q('label[for="iv-link"]'); ll.textContent = IV.link + ' ';
    var em = document.createElement('em'); em.textContent = IV.optional; ll.appendChild(em);
    q('#iv-link').setAttribute('placeholder', IV.linkPh);
    var sel = q('#iv-role'); sel.textContent = '';
    var o0 = document.createElement('option'); o0.value = ''; o0.textContent = IV.pick; o0.disabled = true; o0.selected = true; sel.appendChild(o0);
    IV.roles.forEach(function (r) { var o = document.createElement('option'); o.value = r[0]; o.textContent = r[1]; sel.appendChild(o); });
    var note = q('.invite-note'); note.textContent = IV.note;
    var pa = document.createElement('a'); pa.href = IV.privacyHref; pa.textContent = IV.privacy; note.appendChild(pa); note.appendChild(document.createTextNode('.'));
    sendBtn.textContent = IV.send;
    q('#invite-done-title').textContent = IV.doneT;
    q('.invite-done .invite-sub').textContent = IV.doneS;
    q('.invite-done .invite-send').textContent = IV.close;
    q('.invite-x').setAttribute('aria-label', IV.close);
    invite.setAttribute('lang', T.lang);
  }
  function focusables() {
    return [].slice.call(card.querySelectorAll('button, input:not(.hp), select, a[href]')).filter(function (el) { return el.offsetParent !== null; });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeInvite(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  function openInvite() {
    lastFocus = document.activeElement;
    invite.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { invite.classList.add('open'); }); });
    openedAt = Date.now();
    document.addEventListener('keydown', onKey);
    setTimeout(function () { var first = doneBox.hidden ? q('#iv-name') : q('.invite-done .invite-send'); if (first) first.focus(); }, 80);
  }
  function closeInvite() {
    invite.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { invite.hidden = true; }, reduce ? 0 : 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function done() {
    form.hidden = true; doneBox.hidden = false;
    card.setAttribute('aria-labelledby', 'invite-done-title');
    form.reset(); msg.textContent = '';
    pillLabel.textContent = IV.sent;
    q('.invite-done .invite-send').focus();
  }
  if (invite && form) {
    pill.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openInvite();
    });
    [].forEach.call(invite.querySelectorAll('[data-close]'), function (el) { el.addEventListener('click', closeInvite); });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false');
      if (msg.textContent === IV.errFields && !form.querySelector('[aria-invalid="true"]')) msg.textContent = '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      function v(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
      var d = { name: v('name'), email: v('email'), role: v('role'), link: v('link'), company: v('company'), lang: T.lang, page: location.hostname || 'lyrahq.co' };
      var bad = [];
      if (!d.name) bad.push('name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad.push('email');
      if (!d.role) bad.push('role');
      ['name', 'email', 'role'].forEach(function (n) { form.elements[n].setAttribute('aria-invalid', bad.indexOf(n) >= 0 ? 'true' : 'false'); });
      if (bad.length) { msg.textContent = IV.errFields; form.elements[bad[0]].focus(); return; }
      msg.textContent = '';
      if (d.company || Date.now() - openedAt < 2500) { done(); return; }   // robot : on fait comme si
      if (!ENDPOINT) {
        var b = (fr ? 'Nom : ' : 'Name: ') + d.name + '\n' + (fr ? 'E-mail : ' : 'Email: ') + d.email + '\n' + (fr ? 'Ce que je fais : ' : 'What I do: ') + d.role + '\n' + (fr ? 'Lien : ' : 'Link: ') + (d.link || '') + '\n';
        window.location.href = 'mailto:' + MAIL + '?subject=' + enc(T.subject) + '&body=' + enc(b);
        done(); return;
      }
      busy = true; sendBtn.disabled = true; sendBtn.textContent = IV.sending;
      var body = new URLSearchParams();
      Object.keys(d).forEach(function (k) { body.append(k, d[k]); });
      // Réponse lue : on ne confirme qu'après l'accord du script. Sinon, message avec l'adresse e-mail.
      fetch(ENDPOINT, { method: 'POST', body: body })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok) done(); else msg.textContent = IV.errSend; }, function () { msg.textContent = IV.errSend; })
        .then(function () { busy = false; sendBtn.disabled = false; sendBtn.textContent = IV.send; });
    });
  }

  // Vers les mentions : on passe par le noir, comme dans le film.
  legal.addEventListener('click', function (e) {
    if (still || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    var href = legal.getAttribute('href');
    black.style.transition = 'opacity .35s ease';
    black.style.opacity = 1;
    setTimeout(function () { window.location.href = href; }, 360);
  });
  // Retour arrière depuis une page légale (cache du navigateur) : on rouvre le noir.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    render();
    if (!still && (state.phase !== 'noir' || state.under)) play();
  });

  function pick() { return portrait.matches ? 'mobile' : 'desktop'; }
  // Grand écran ou écran Retina, sur une bonne connexion : le film en 2K.
  function wantHD() {
    var c = navigator.connection;
    if (c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ''))) return false;
    return Math.max(window.screen.width, window.screen.height) * (window.devicePixelRatio || 1) >= 2200;
  }
  function load(variant) {
    film = variant;
    var f = FILMS[variant];
    video.setAttribute('poster', f.poster);
    if (!still) video.setAttribute('src', f.hd && wantHD() ? f.hd : f.src);
  }
  load(pick());

  var fromSite = location.hash === '#lyra';
  if (fromSite && window.history && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (still) {
    set({ phase: 'boucle' });
  } else if (fromSite) {
    enterLoop();
  } else {
    render();
    play();
    arm();
  }

  // La lentille : sur la boucle floue, l'image redevient nette autour du curseur, comme une mise au point.
  // Le bouton est aimanté au curseur quand on s'en approche. Uniquement à la souris.
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lctx = lens && lens.getContext ? lens.getContext('2d') : null;
  var lensOn = false, lensRun = false, inside = false, lastMove = 0, lastT = -1;
  var tx = 0, ty = 0, lx = 0, ly = 0;
  function sizeLens() {
    if (!lens) return;
    var k = Math.min(window.devicePixelRatio || 1, 1.5);
    lens.width = Math.round(window.innerWidth * k);
    lens.height = Math.round(window.innerHeight * k);
    lastT = -1;
  }
  function drawLens() {
    var vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;
    var cw = lens.width, ch = lens.height, sc = Math.max(cw / vw, ch / vh);
    var sw = cw / sc, sh = ch / sc;
    lctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, cw, ch);
  }
  function lensWanted() {
    return state.phase === 'boucle' && !state.focus && !state.dip && inside && (Date.now() - lastMove < 2600);
  }
  function tick() {
    var want = lensWanted();
    if (want !== lensOn) {
      lensOn = want;
      if (want) { lastT = -1; lens.classList.add('on'); } else { lens.classList.remove('on'); }
    }
    lx += (tx - lx) * 0.16;
    ly += (ty - ly) * 0.16;
    var soft = state.phase === 'boucle' && !state.focus;
    var k = soft ? (FILMS[film] || FILMS.desktop).scale : 1;
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    lens.style.setProperty('--lx', (cx + (lx - cx) / k).toFixed(1) + 'px');
    lens.style.setProperty('--ly', (cy + (ly - cy) / k).toFixed(1) + 'px');
    if (lensOn && video.readyState >= 2 && video.currentTime !== lastT) { lastT = video.currentTime; drawLens(); }
    if (lensOn || Date.now() - lastMove < 3400) requestAnimationFrame(tick); else lensRun = false;
  }
  function magnet(x, y) {
    if (state.phase !== 'boucle') return;
    var r = pill.getBoundingClientRect();
    var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 120) {
      var mx = Math.max(-8, Math.min(8, dx * 0.12)), my = Math.max(-6, Math.min(6, dy * 0.15));
      pill.style.translate = mx.toFixed(1) + 'px ' + my.toFixed(1) + 'px';
    } else if (pill.style.translate) {
      pill.style.translate = '';
    }
  }
  if (fine && !still && lctx) {
    sizeLens();
    window.addEventListener('resize', sizeLens);
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!lastMove) { lx = e.clientX; ly = e.clientY; }
      tx = e.clientX; ty = e.clientY; lastMove = Date.now(); inside = true;
      magnet(e.clientX, e.clientY);
      if (!lensRun) { lensRun = true; requestAnimationFrame(tick); }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) { inside = false; pill.style.translate = ''; }
    });
  }

  // On tourne le téléphone : on passe à l'autre film.
  function onTurn() {
    var v = pick();
    if (v === film) return;
    load(v);
    if (still) { render(); return; }
    if (state.phase === 'film') {
      started = false;
      play();
      arm();
    } else {
      set({ focus: false });
      play();
    }
  }
  if (portrait.addEventListener) portrait.addEventListener('change', onTurn);
  else if (portrait.addListener) portrait.addListener(onTurn);

  // Onglet en arrière-plan : le film se met en pause.
  document.addEventListener('visibilitychange', function () {
    if (still) return;
    if (document.hidden) { try { video.pause(); } catch (e) {} }
    else if (state.phase !== 'noir' || state.under) { play(); }
  });
})();
