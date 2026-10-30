/* PAF widgets: Radio (2 playlists, Listen / Skip columns) + visitor chat.
   Khamzin Bauyrzhan Galymzhanovich & AISun, 30.10.2026. No dependencies.
   Include before </body>:
   <script src="paf-widgets.js" data-music="music/" data-api="https://api.sun-agi.com/chat"></script> */
(function () {
  'use strict';
  var me = document.currentScript;
  var MUSIC = (me && me.dataset.music) || 'music/';
  var API = (me && me.dataset.api) || '';
  var LANG = (document.documentElement.lang || 'ru').slice(0, 2);

  var T = {
    ru: { radio: 'Радио PAF', chat: 'Чат', listen: 'Слушаю', skip: 'Не слушаю', track: 'Трек',
          name: 'Ваше имя', msg: 'Сообщение…', send: 'Отправить', offline: 'Чат пока недоступен. Попробуйте позже.',
          empty: 'Пока тихо. Напишите первым!', credit: 'Музыка: Liborio Conti и др., no-copyright-music.com',
          rules: 'Без ссылок и рекламы. До 280 знаков.', wait: 'Не так быстро — подождите пару секунд.',
          calm: 'Спокойный', sunny: 'Солнечный', allskip: 'Отметьте хотя бы один трек «Слушаю».' },
    en: { radio: 'PAF Radio', chat: 'Chat', listen: 'Listen', skip: 'Skip', track: 'Track',
          name: 'Your name', msg: 'Message…', send: 'Send', offline: 'Chat is offline. Try again later.',
          empty: 'Quiet so far. Say hi first!', credit: 'Music: Liborio Conti et al., no-copyright-music.com',
          rules: 'No links or ads. Up to 280 characters.', wait: 'Slow down — wait a couple of seconds.',
          calm: 'Calm', sunny: 'Sunny', allskip: 'Mark at least one track as Listen.' },
    kz: { radio: 'PAF радиосы', chat: 'Чат', listen: 'Тыңдаймын', skip: 'Тыңдамаймын', track: 'Трек',
          name: 'Атыңыз', msg: 'Хабарлама…', send: 'Жіберу', offline: 'Чат әзірге қолжетімсіз.',
          empty: 'Әзірге тыныш. Бірінші болып жазыңыз!', credit: 'Музыка: Liborio Conti т.б., no-copyright-music.com',
          rules: 'Сілтемесіз, жарнамасыз. 280 таңбаға дейін.', wait: 'Сәл күтіңіз.',
          calm: 'Тыныш', sunny: 'Күнді', allskip: 'Кем дегенде бір тректі «Тыңдаймын» деп белгілеңіз.' }
  };
  var t = T[LANG] || T.ru;

  // Playlists: file names under MUSIC. calm = 96 kbps web copies, sunny = dop1 set.
  var LISTS = {
    calm: [ // only tracks with a known free licence (no-copyright-music.com); others removed until checked
      ['calm/2_Amazing-Full-Track-1.mp3', 'Amazing'],
      ['calm/5-Acoustic-Inspirational-Full-Track.mp3', 'Acoustic Inspirational'],
      ['calm/6_Inspiring-Ambient-No-Copyright-Music-01-Inspiring-Ambient.mp3', 'Inspiring Ambient'],
      ['calm/7_Vacation-Vibe.mp3', 'Vacation Vibe']
    ],
    sunny: [
      ['sunny/01-Inspire-Full-Track.mp3', 'Inspire'],
      ['sunny/01-Inspiring-Upbeat-Ambient-Full-Track.mp3', 'Inspiring Upbeat'],
      ['sunny/Africa-Free-No-Copyright-Music-by-Liborio-Conti-01-Africa-With-Voices-Full-Track.mp3', 'Africa'],
      ['sunny/Good-Morning-Sunshine-No-Copyright-Music.com-01-Good-Morning-Sunshine.mp3', 'Good Morning Sunshine'],
      ['sunny/Happy-Sun-No-Copyright-Music.com-01-Happy-Sun.mp3', 'Happy Sun'],
      ['sunny/Mandolin.mp3', 'Mandolin'],
      ['sunny/Rio-Samba-Free-No-Copyright-Music-by-Liborio-Conti-01-Rio-Samba-Full-Track.mp3', 'Rio Samba'],
      ['sunny/Skyline-Free-No-Copyright-Music-by-Liborio-Conti-01-Skyline-Full-Track.mp3', 'Skyline'],
      ['sunny/Summer-Pack-No-Copyright-Music-01-Summer-FULL-TRACK.mp3', 'Summer'],
      ['sunny/Sunny-Skies-No-Copyright-Music.com-01-Sunny-Skies.mp3', 'Sunny Skies'],
      ['sunny/Ukulele-Life-No-Copyright-Music.com-01-Ukulele-Life.mp3', 'Ukulele Life'],
      ['sunny/Upbeat-Morning-No-Copyright-Music-01-Upbeat-Morning.mp3', 'Upbeat Morning'],
      ['sunny/UpbeatInspiration.mp3', 'Upbeat Inspiration']
    ]
  };

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('paf_' + k)); localStorage.setItem('paf_' + k, JSON.stringify(v)); } catch (e) { return null; } }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  var css = '' +
    '.pafw-btn{position:fixed;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9998;border:0;border-radius:999px;padding:12px 18px;font:600 14px/1 system-ui,sans-serif;cursor:pointer;background:#111a22;color:#f2c14e;box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
    '.pafw-btn:focus-visible{outline:2px solid #f2c14e;outline-offset:2px}' +
    '#pafw-radio-btn{left:16px}#pafw-chat-btn{right:16px}' +
    '.pafw-panel{position:fixed;bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(380px,calc(100vw - 32px));max-height:70vh;display:flex;flex-direction:column;background:#0f161d;color:#e8edf2;border:1px solid #26323e;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font:14px/1.45 system-ui,sans-serif;overflow:hidden}' +
    '.pafw-panel[hidden]{display:none}#pafw-radio{left:16px}#pafw-chat{right:16px}' +
    '.pafw-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #26323e}' +
    '.pafw-head b{flex:1}.pafw-x{background:none;border:0;color:#8b98a5;font-size:20px;cursor:pointer}' +
    '.pafw-tabs{display:flex;gap:6px;padding:10px 14px 0}.pafw-tab{flex:1;padding:8px;border-radius:10px;border:1px solid #26323e;background:none;color:#8b98a5;cursor:pointer;font:600 13px system-ui}' +
    '.pafw-tab.on{background:#f2c14e;color:#111;border-color:#f2c14e}' +
    '.pafw-ctl{display:flex;align-items:center;gap:8px;padding:12px 14px}.pafw-ctl button{width:40px;height:40px;border-radius:50%;border:1px solid #26323e;background:#16202a;color:#e8edf2;cursor:pointer;font-size:16px}' +
    '.pafw-ctl .play{width:48px;height:48px;background:#f2c14e;color:#111;border:0;font-size:18px}.pafw-now{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f2c14e}' +
    '.pafw-ctl input[type=range]{width:70px}' +
    '.pafw-list{overflow:auto;padding:0 14px 8px}.pafw-row{display:grid;grid-template-columns:1fr 64px 76px;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #1c2731}' +
    '.pafw-row.h{font:600 11px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#8b98a5;position:sticky;top:0;background:#0f161d}' +
    '.pafw-row.cur .n{color:#f2c14e}.pafw-row.off .n{color:#5d6b78;text-decoration:line-through}.pafw-row label{display:flex;justify-content:center}' +
    '.pafw-row input{width:18px;height:18px;accent-color:#f2c14e;cursor:pointer}.pafw-row .n{cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.pafw-foot{padding:8px 14px 12px;color:#6c7a87;font-size:11px}' +
    '.pafw-msgs{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px;min-height:200px}' +
    '.pafw-m{background:#16202a;border-radius:12px;padding:8px 10px;max-width:90%;word-wrap:break-word}.pafw-m.mine{align-self:flex-end;background:#2a2412}' +
    '.pafw-m .a{font:600 12px system-ui;color:#f2c14e}.pafw-m .tm{font-size:11px;color:#6c7a87;margin-left:6px}' +
    '.pafw-form{display:grid;gap:6px;padding:10px 14px 12px;border-top:1px solid #26323e}' +
    '.pafw-form input,.pafw-form textarea{width:100%;box-sizing:border-box;background:#0b1117;color:#e8edf2;border:1px solid #26323e;border-radius:10px;padding:9px 10px;font:14px system-ui;resize:none}' +
    '.pafw-form button{padding:10px;border:0;border-radius:10px;background:#f2c14e;color:#111;font:700 14px system-ui;cursor:pointer}' +
    '.pafw-note{color:#8b98a5;font-size:12px}.pafw-note.err{color:#e88}';
  var st = el('style'); st.textContent = css; document.head.appendChild(st);

  function panel(id, title) {
    var p = el('div', 'pafw-panel'); p.id = id; p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', title);
    var h = el('div', 'pafw-head'); h.appendChild(el('b', null, title));
    var x = el('button', 'pafw-x', '×'); x.setAttribute('aria-label', 'close'); x.onclick = function () { p.hidden = true; };
    h.appendChild(x); p.appendChild(h); document.body.appendChild(p); return p;
  }
  function launcher(id, label, p) {
    var b = el('button', 'pafw-btn', label); b.id = id; b.onclick = function () { p.hidden = !p.hidden; if (!p.hidden && p.onopen) p.onopen(); };
    document.body.appendChild(b); return b;
  }

  /* ---------------- RADIO ---------------- */
  var rp = panel('pafw-radio', t.radio);
  var rbtn = launcher('pafw-radio-btn', '♪ ' + t.radio, rp);
  var audio = new Audio(); audio.preload = 'none';
  var list = store('list') || 'calm';
  var skip = store('skip') || {};           // { "calm/1_x.mp3": true }
  var idx = store('idx_' + list) || 0;
  audio.volume = store('vol') == null ? 0.6 : store('vol');

  var tabs = el('div', 'pafw-tabs');
  ['calm', 'sunny'].forEach(function (k) {
    var b = el('button', 'pafw-tab', t[k]); b.dataset.k = k;
    b.onclick = function () { if (list === k) return; list = k; store('list', k); idx = store('idx_' + k) || 0; var was = !audio.paused; render(); load(); if (was) play(); };
    tabs.appendChild(b);
  });
  rp.appendChild(tabs);
  var ctl = el('div', 'pafw-ctl');
  var bPrev = el('button', null, '⏮'), bPlay = el('button', 'play', '▶'), bNext = el('button', null, '⏭');
  bPrev.setAttribute('aria-label', 'prev'); bPlay.setAttribute('aria-label', 'play'); bNext.setAttribute('aria-label', 'next');
  var now = el('div', 'pafw-now');
  var vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.05; vol.value = audio.volume; vol.setAttribute('aria-label', 'volume');
  vol.oninput = function () { audio.volume = +vol.value; store('vol', audio.volume); };
  [bPrev, bPlay, now, bNext, vol].forEach(function (x) { ctl.appendChild(x); });
  rp.appendChild(ctl);
  var lst = el('div', 'pafw-list'); rp.appendChild(lst);
  var rnote = el('div', 'pafw-foot', t.credit); rp.appendChild(rnote);

  function tracks() { return LISTS[list]; }
  function allowed(i) { return !skip[tracks()[i][0]]; }
  function step(dir) {
    var n = tracks().length;
    for (var k = 1; k <= n; k++) { var j = (idx + dir * k + n * 2) % n; if (allowed(j)) return j; }
    return -1;
  }
  function load() { var tr = tracks()[idx]; if (!tr) return; audio.src = MUSIC + tr[0]; now.textContent = tr[1]; store('idx_' + list, idx); markCur();
    if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: tr[1], artist: t.radio }); } catch (e) {} } }
  function play() {
    if (!allowed(idx)) { var j = step(1); if (j < 0) { rnote.textContent = t.allskip; return; } idx = j; load(); }
    audio.play().then(function () { rnote.textContent = t.credit; }).catch(function () {});
  }
  function go(dir) { var j = step(dir); if (j < 0) { rnote.textContent = t.allskip; return; } idx = j; load(); play(); }
  bPlay.onclick = function () { if (!audio.src) load(); audio.paused ? play() : audio.pause(); };
  bNext.onclick = function () { go(1); }; bPrev.onclick = function () { go(-1); };
  audio.onended = function () { go(1); };
  audio.onerror = function () { if (audio.src) setTimeout(function () { go(1); }, 800); };
  audio.onplay = function () { bPlay.textContent = '❚❚'; rbtn.textContent = '♪ ' + now.textContent; };
  audio.onpause = function () { bPlay.textContent = '▶'; rbtn.textContent = '♪ ' + t.radio; };
  if ('mediaSession' in navigator) { try {
    navigator.mediaSession.setActionHandler('nexttrack', function () { go(1); });
    navigator.mediaSession.setActionHandler('previoustrack', function () { go(-1); });
  } catch (e) {} }

  function markCur() { [].forEach.call(lst.querySelectorAll('.pafw-row[data-i]'), function (r) { r.classList.toggle('cur', +r.dataset.i === idx); }); }
  function render() {
    [].forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.dataset.k === list); });
    lst.textContent = '';
    var h = el('div', 'pafw-row h'); h.appendChild(el('span', null, t.track)); h.appendChild(el('span', null, t.listen)); h.appendChild(el('span', null, t.skip)); lst.appendChild(h);
    tracks().forEach(function (tr, i) {
      var r = el('div', 'pafw-row'); r.dataset.i = i; if (skip[tr[0]]) r.classList.add('off');
      var n = el('span', 'n', (i + 1) + '. ' + tr[1]); n.title = tr[1];
      n.onclick = function () { if (skip[tr[0]]) return; idx = i; load(); play(); };
      var l1 = el('label'), c1 = el('input'); c1.type = 'checkbox'; c1.checked = !skip[tr[0]]; c1.setAttribute('aria-label', t.listen + ': ' + tr[1]);
      var l2 = el('label'), c2 = el('input'); c2.type = 'checkbox'; c2.checked = !!skip[tr[0]]; c2.setAttribute('aria-label', t.skip + ': ' + tr[1]);
      function set(off) { if (off) skip[tr[0]] = true; else delete skip[tr[0]]; store('skip', skip); c1.checked = !off; c2.checked = off; r.classList.toggle('off', off);
        if (off && i === idx && !audio.paused) go(1); }
      c1.onchange = function () { set(!c1.checked); }; c2.onchange = function () { set(c2.checked); };
      l1.appendChild(c1); l2.appendChild(c2); r.appendChild(n); r.appendChild(l1); r.appendChild(l2); lst.appendChild(r);
    });
    now.textContent = (tracks()[idx] || tracks()[0])[1]; markCur();
  }
  render();

  /* ---------------- CHAT (visitors to each other) ---------------- */
  var cp = panel('pafw-chat', t.chat);
  launcher('pafw-chat-btn', '💬 ' + t.chat, cp);
  var box = el('div', 'pafw-msgs'); box.setAttribute('aria-live', 'polite'); cp.appendChild(box);
  var form = el('form', 'pafw-form');
  var nm = el('input'); nm.id = 'pafw-name'; nm.maxLength = 24; nm.placeholder = t.name; nm.value = store('name') || ''; nm.autocomplete = 'nickname';
  var tx = el('textarea'); tx.id = 'pafw-text'; tx.rows = 2; tx.maxLength = 280; tx.placeholder = t.msg;
  var sb = el('button', null, t.send); sb.type = 'submit';
  var note = el('div', 'pafw-note', t.rules);
  [nm, tx, sb, note].forEach(function (x) { form.appendChild(x); }); cp.appendChild(form);
  var last = 0, mineIds = store('mine') || [], timer = null, failures = 0;

  function fmt(ts) { var d = new Date(ts * 1000); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function add(m) {
    if (box.firstChild && box.firstChild.className === 'pafw-note') box.textContent = '';
    var b = el('div', 'pafw-m' + (mineIds.indexOf(m.id) >= 0 ? ' mine' : ''));
    var a = el('div'); a.appendChild(el('span', 'a', m.name)); a.appendChild(el('span', 'tm', fmt(m.ts)));
    b.appendChild(a); b.appendChild(el('div', null, m.text)); box.appendChild(b); last = Math.max(last, m.id);
  }
  function poll() {
    if (!API) { box.textContent = ''; box.appendChild(el('div', 'pafw-note err', t.offline)); return; }
    fetch(API + '/messages?after=' + last, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      failures = 0; var nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
      if (!last && !j.messages.length) { box.textContent = ''; box.appendChild(el('div', 'pafw-note', t.empty)); }
      j.messages.forEach(add); if (nearBottom || j.messages.length) box.scrollTop = box.scrollHeight;
    }).catch(function () { failures++; if (failures === 2) { note.textContent = t.offline; note.className = 'pafw-note err'; } });
  }
  cp.onopen = function () { poll(); if (!timer) timer = setInterval(function () { if (!cp.hidden && !document.hidden) poll(); }, 4000); };
  form.onsubmit = function (e) {
    e.preventDefault();
    var name = nm.value.trim(), text = tx.value.trim(); if (!name) { nm.focus(); return; } if (!text) { tx.focus(); return; }
    store('name', name); sb.disabled = true;
    fetch(API + '/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, text: text }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) { mineIds.push(res.j.id); store('mine', mineIds.slice(-50)); tx.value = ''; note.textContent = t.rules; note.className = 'pafw-note'; poll(); }
        else { note.textContent = res.j.error === 'slow' ? t.wait : t.rules; note.className = 'pafw-note err'; }
      }).catch(function () { note.textContent = t.offline; note.className = 'pafw-note err'; })
      .then(function () { sb.disabled = false; });
  };
  tx.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.onsubmit(e); } });
})();
