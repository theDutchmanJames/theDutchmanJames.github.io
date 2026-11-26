// Community library page: reads library.json from the SlotForgeLibrary repository and shows it
// with search and filters, and runs the "Share your design" form. Every value from the index or
// the form is inserted as text, never as HTML.
(() => {
  const root = document.getElementById('library');
  if (!root) return;
  const base = root.dataset.base;
  const REPO = 'https://github.com/theDutchmanJames/SlotForgeLibrary';
  const TYPE = { track: 'Track', chassis: 'Chassis', body: 'Body', building: 'Building', livery: 'Livery', decals: 'Decal sheet', 'race-screen': 'Race-screen pack' };
  const LICENCE = { 'CC-BY-4.0': 'CC BY 4.0', 'CC-BY-NC-4.0': 'CC BY-NC 4.0', 'CC-BY-SA-4.0': 'CC BY-SA 4.0', 'CC0-1.0': 'CC0' };
  const $ = s => root.querySelector(s);
  const grid = $('.lib-grid'), count = $('.lib-count'), empty = $('.lib-empty'), none = $('.lib-none'), failed = $('.lib-failed');
  const state = { type: 'all', app: '', scale: '', tested: false, q: '' };
  let items = [];

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const safe = s => /^[a-z0-9][a-z0-9-]{0,63}$/.test(s);
  const safeFile = s => /^[\w][\w .()-]{0,99}\.(png|jpg|webp|zip)$/i.test(s);
  const size = n => n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
  const httpUrl = s => { try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u : null; } catch { return null; } };
  const link = (text, href, cls) => { const a = el('a', cls, text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };

  // One card. With preview=true it is the live preview in the form: no working links.
  function card(it, { picture, preview = false } = {}) {
    const a = el('article', 'lib-card');
    if (!preview) a.id = it.id;
    const pic = el('div', 'lib-pic');
    const src = picture !== undefined ? picture : `${base}items/${it.id}/${encodeURIComponent(it.preview)}`;
    if (src) {
      const img = el('img');
      img.src = src; img.alt = it.title || ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 800; img.height = 500;
      pic.append(img);
    } else pic.append(el('span', 'lib-pic-empty', 'Your picture'));
    if (it.type) pic.append(el('span', 'lib-type', TYPE[it.type] || it.type));
    if (it.printed === 'tested') pic.append(el('span', 'lib-tested', '✓ Printed and tested'));
    const body = el('div', 'lib-body');
    body.append(el('h3', '', it.title || 'Name of your item'), el('p', 'lib-by', `by ${it.author || 'you'}`));
    const facts = el('ul', 'lib-facts');
    facts.append(el('li', '', it.scale || 'Any scale'));
    facts.append(el('li', '', it.app ? `${it.app}${it.appVersion ? ` ${it.appVersion} or newer` : ''}` : 'Any 3D printer'));
    if (it.printed === 'untested') facts.append(el('li', 'lib-warn', 'Not printed yet'));
    body.append(facts);
    const orig = it.basedOn && httpUrl(it.basedOn);
    if (orig) {
      const p = el('p', 'lib-based', 'Based on ');
      p.append(preview ? el('span', '', orig.hostname.replace(/^www\./, '')) : link(`${orig.hostname.replace(/^www\./, '')} ↗`, orig.href));
      body.append(p);
    }
    body.append(el('p', 'lib-desc', it.description || 'Your description.'));
    if (it.printNotes) {
      const d = el('details', 'lib-notes');
      d.append(el('summary', '', 'Print notes'), el('p', '', it.printNotes));
      body.append(d);
    }
    const foot = el('div', 'lib-foot');
    if (preview) foot.append(el('span', 'sf-action sf-primary lib-fake', `Download${it.size ? ` · ${size(it.size)}` : ''}`));
    else {
      const dl = el('a', 'sf-action sf-primary', `Download${it.size ? ` · ${size(it.size)}` : ''}`);
      const d = it.download && httpUrl(it.download);
      dl.href = d ? d.href : `${base}items/${it.id}/${encodeURIComponent(it.file)}`;
      dl.setAttribute('download', '');
      foot.append(dl, link('Details ↗', Number(it.issue) ? `${REPO}/issues/${Number(it.issue)}` : `${REPO}/tree/main/items/${it.id}`, 'sf-inline'));
    }
    foot.append(el('span', 'lib-licence', LICENCE[it.licence] || it.licence || ''));
    body.append(foot);
    a.append(pic, body);
    return a;
  }

  function show() {
    const q = state.q.trim().toLowerCase();
    const list = items.filter(it =>
      (state.type === 'all' || it.type === state.type) &&
      (!state.app || (state.app === 'STL' ? !it.app : it.app === state.app)) &&
      (!state.scale || it.scale === state.scale) &&
      (!state.tested || it.printed === 'tested') &&
      (!q || [it.title, it.author, it.description, it.app, TYPE[it.type]].join(' ').toLowerCase().includes(q)));
    grid.replaceChildren(...list.map(it => card(it)));
    empty.hidden = items.length > 0;
    none.hidden = !(items.length && !list.length);
    $('.lib-tools').hidden = !items.length;
    count.textContent = items.length ? `${list.length} of ${items.length} item${items.length === 1 ? '' : 's'}` : '';
    if (location.hash.length > 1 && location.hash !== '#share' && !show.jumped) { show.jumped = true; document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); }
  }

  root.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
    state.type = b.dataset.type;
    root.querySelectorAll('[data-type]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    show();
  }));
  const askedApp = new URLSearchParams(location.search).get('app');
  if (askedApp && [...$('#lib-app').options].some(o => o.value === askedApp)) { state.app = askedApp; $('#lib-app').value = askedApp; }
  $('#lib-app').addEventListener('change', e => { state.app = e.target.value; show(); });
  $('#lib-scale').addEventListener('change', e => { state.scale = e.target.value; show(); });
  $('#lib-tested').addEventListener('change', e => { state.tested = e.target.checked; show(); });
  $('#lib-q').addEventListener('input', e => { state.q = e.target.value; show(); });
  $('.lib-reset').addEventListener('click', () => {
    Object.assign(state, { type: 'all', app: '', scale: '', tested: false, q: '' });
    $('#lib-app').value = ''; $('#lib-scale').value = ''; $('#lib-tested').checked = false; $('#lib-q').value = '';
    root.querySelectorAll('[data-type]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.type === 'all')));
    show();
  });

  fetch(`${base}library.json`, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      items = (Array.isArray(data.items) ? data.items : []).filter(it =>
        it && safe(it.id) && safeFile(it.preview || '') && safeFile(it.file || '') && typeof it.title === 'string');
      root.classList.remove('is-loading');
      show();
    })
    .catch(() => { root.classList.remove('is-loading'); failed.hidden = false; $('.lib-tools').hidden = true; });

  // ---- Share your design --------------------------------------------------------------
  const share = $('.lib-share');
  if (!share) return;
  const submitUrl = root.dataset.submit.replace(/\/$/, '');
  const form = share.querySelector('.lib-form');
  const f = name => form.elements[name];
  const errorBox = share.querySelector('.lib-error'), progress = share.querySelector('.lib-progress'), zipInfo = share.querySelector('.lib-zipinfo');
  const sendButton = form.querySelector('button[type=submit]');
  const MAX_ZIP = 25 * 1024 * 1024;
  const BLOCKED = /\.(exe|msi|bat|cmd|com|scr|ps1|vbs|vbe|js|jse|wsf|hta|jar|sh|app|dll|lnk|reg|apk|dmg|pkg|deb|rpm|appimage)$/i;
  let picture = null;      // { data: base64, url: object URL }
  let zipOk = false;
  let token = '';
  let widget = null;

  function open() {
    share.hidden = false;
    share.querySelector('.lib-done').hidden = true;
    share.querySelector('.lib-share-grid').hidden = false;
    share.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadTurnstile();
    renderPreview();
  }
  root.querySelectorAll('[data-share]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#share'); open(); }));
  share.querySelector('.lib-share-close').addEventListener('click', () => { share.hidden = true; history.replaceState(null, '', location.pathname); });

  function loadTurnstile() {
    if (widget !== null || !root.dataset.sitekey) return;
    widget = 'loading';
    window.libTurnstileReady = () => {
      widget = window.turnstile.render('#lib-turnstile', {
        sitekey: root.dataset.sitekey, theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'auto',
        callback: t => { token = t; }, 'expired-callback': () => { token = ''; }, 'error-callback': () => { token = ''; },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=libTurnstileReady';
    s.async = true;
    document.head.append(s);
  }

  const values = () => ({
    title: f('title').value.trim(), type: f('type').value, app: f('app').value, appVersion: f('appVersion').value.trim(),
    scale: f('scale').value, description: f('description').value.trim(), basedOn: f('basedOn').value.trim(),
    printed: form.querySelector('input[name=printed]:checked')?.value || '', printNotes: f('printNotes').value.trim(),
    licence: f('licence').value, author: f('author').value.trim(),
  });

  function renderPreview() {
    const v = values();
    const it = { ...v, scale: v.scale === 'Not scale-specific' ? '' : v.scale, app: v.app === 'STL' ? '' : v.app,
      printNotes: v.printed === 'tested' ? v.printNotes : '', size: f('file').files[0]?.size || 0 };
    if (v.basedOn && !/^[a-z]+:/i.test(v.basedOn)) it.basedOn = 'https://' + v.basedOn;
    share.querySelector('.lib-preview-card').replaceChildren(card(it, { picture: picture?.url || '', preview: true }));
  }
  form.addEventListener('input', () => { errorBox.hidden = true; renderPreview(); });
  form.addEventListener('change', () => {
    const printed = form.querySelector('input[name=printed]:checked')?.value;
    share.querySelector('.lib-printnotes').hidden = printed !== 'tested';
    f('appVersion').disabled = f('app').value === 'STL';
    renderPreview();
  });

  // The picture is shrunk in the browser to at most 1600 px wide, so it uploads fast.
  f('picture').addEventListener('change', async () => {
    picture = null;
    const file = f('picture').files[0];
    if (!file) return renderPreview();
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / bmp.width);
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.86));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      picture = { data: btoa(s), url: URL.createObjectURL(blob) };
    } catch { fail('That picture could not be opened. Use a PNG or JPG.'); f('picture').value = ''; }
    renderPreview();
  });

  // The .zip is checked here first (what is inside, and its size), and again after sending.
  f('file').addEventListener('change', async () => {
    zipOk = false; zipInfo.textContent = ''; zipInfo.className = 'lib-zipinfo';
    const file = f('file').files[0];
    renderPreview();
    if (!file) return;
    try {
      if (file.size > MAX_ZIP) throw new Error(`This .zip is ${size(file.size)}; the most is 25 MB.`);
      const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (head[0] !== 0x50 || head[1] !== 0x4b || head[2] !== 3 || head[3] !== 4) throw new Error('This is not a .zip file.');
      const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 65557)).arrayBuffer());
      const names = zipNames(file, tail);
      const list = await names;
      const bad = list.filter(n => BLOCKED.test(n));
      if (bad.length) throw new Error(`Remove these from the .zip: ${bad.join(', ')}.`);
      zipOk = true;
      zipInfo.textContent = `✓ ${list.length} file${list.length === 1 ? '' : 's'} in the .zip: ${list.slice(0, 6).join(', ')}${list.length > 6 ? ', …' : ''}`;
      zipInfo.classList.add('is-ok');
    } catch (e) { zipInfo.textContent = e.message; zipInfo.classList.add('is-bad'); }
  });
  async function zipNames(file, tail) {
    const v = new DataView(tail.buffer);
    let end = -1;
    for (let i = tail.length - 22; i >= 0; i--) if (v.getUint32(i, true) === 0x06054b50) { end = i; break; }
    if (end < 0) throw new Error('This .zip seems damaged.');
    const n = v.getUint16(end + 10, true), cdSize = v.getUint32(end + 12, true), cdAt = v.getUint32(end + 16, true);
    const cd = new Uint8Array(await file.slice(cdAt, cdAt + cdSize).arrayBuffer());
    const d = new DataView(cd.buffer), dec = new TextDecoder(), names = [];
    for (let p = 0, k = 0; k < n && p + 46 <= cd.length; k++) {
      if (d.getUint32(p, true) !== 0x02014b50) throw new Error('This .zip seems damaged.');
      const len = d.getUint16(p + 28, true), extra = d.getUint16(p + 30, true), comment = d.getUint16(p + 32, true);
      const name = dec.decode(cd.subarray(p + 46, p + 46 + len));
      if (!name.endsWith('/')) names.push(name);
      p += 46 + len + extra + comment;
    }
    return names;
  }

  function fail(message) { errorBox.textContent = message; errorBox.hidden = false; errorBox.scrollIntoView({ block: 'nearest' }); }

  function check(v) {
    if (v.title.length < 3) return ['title', 'Give your item a name.'];
    if (!v.type) return ['type', 'Choose what it is.'];
    if (!v.scale) return ['scale', 'Choose a scale.'];
    if (!v.app) return ['app', 'Choose the app it is made for.'];
    if (v.appVersion && !/^v?\d+(\.\d+){0,2}$/.test(v.appVersion)) return ['appVersion', 'Write the app version like 0.5.0, or leave it empty.'];
    if (v.description.length < 10) return ['description', 'Write a short description.'];
    if (v.basedOn && !httpUrl(/^[a-z]+:/i.test(v.basedOn) ? v.basedOn : 'https://' + v.basedOn)?.hostname.includes('.')) return ['basedOn', 'Paste the full web address of the original design, or leave it empty.'];
    if (!picture) return ['picture', 'Add a picture.'];
    if (!f('file').files[0]) return ['file', 'Add your .zip.'];
    if (!zipOk) return ['file', zipInfo.textContent || 'Check your .zip.'];
    if (!v.printed) return [form.querySelector('input[name=printed]'), 'Say whether it was printed and tested.'];
    if (v.author.length < 2) return ['author', 'Fill in the name to show as its maker.'];
    if (!f('rights1').checked || !f('rights2').checked) return ['rights1', 'Tick both boxes under “Your rights”.'];
    if (!token) return [null, 'Wait for the spam check under the form to finish, then send again.'];
    return null;
  }

  const putZip = (url, ticket, file) => new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('X-Ticket', ticket);
    x.setRequestHeader('Content-Type', 'application/zip');
    x.upload.onprogress = e => { if (e.lengthComputable) progress.textContent = `Uploading your .zip… ${Math.round(e.loaded / e.total * 100)}%`; };
    x.onload = () => { let r = {}; try { r = JSON.parse(x.responseText); } catch {} x.status < 300 ? resolve(r) : reject(new Error(r.error || `Upload failed (${x.status}).`)); };
    x.onerror = () => reject(new Error('The upload was interrupted. Check your connection and send again.'));
    x.send(file);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.hidden = true;
    const v = values();
    const problem = check(v);
    if (problem) {
      const [name, message] = problem;
      fail(message);
      const target = typeof name === 'string' ? f(name) : name;
      target?.focus?.();
      return;
    }
    sendButton.disabled = true;
    try {
      progress.textContent = 'Sending your details…';
      const file = f('file').files[0];
      const res = await fetch(`${submitUrl}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, appVersion: v.app === 'STL' ? '' : v.appVersion, printNotes: v.printed === 'tested' ? v.printNotes : '',
          rights: true, token, picture: picture.data, fileSize: file.size }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || `Sending failed (${res.status}).`);
      const done = await putZip(`${submitUrl}/upload/${out.id}`, out.ticket, file);
      share.querySelector('.lib-share-grid').hidden = true;
      const ok = share.querySelector('.lib-done');
      ok.hidden = false;
      const follow = ok.querySelector('.lib-follow');
      const pr = httpUrl(done.pr || '');
      follow.hidden = !pr;
      if (pr) follow.href = pr.href;
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset(); picture = null; zipOk = false; zipInfo.textContent = '';
    } catch (err) {
      fail(err.message);
    } finally {
      sendButton.disabled = false; progress.textContent = '';
      token = '';
      if (window.turnstile && widget && widget !== 'loading') window.turnstile.reset(widget);
    }
  });
  share.querySelector('.lib-again').addEventListener('click', open);
  if (location.hash === '#share') open();
})();
