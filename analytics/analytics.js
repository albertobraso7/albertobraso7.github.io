import {config, pages, schema} from './config.js';

// Debug mode is an in-memory recorder on ANY origin, never a GA transport.
// A preview cannot opt into sending by adding a query parameter or storage key.
const debug = new URLSearchParams(location.search).get('analytics_debug') === '1';
const canonicalPath = location.pathname.replace(/\/index\.html$/, '/') || '/';
const pageId = pages[canonicalPath];
const production = location.origin === config.productionOrigin && Boolean(pageId);
const eligible = config.enabled && /^G-[A-Z0-9]+$/.test(config.measurementId);
if (eligible && pageId && (production || debug) && !window.portfolioAnalytics) {
  initialize();
}

function initialize() {
  const key = 'portfolio-analytics-consent';
  const records = [];
  let consent = false, started = false, loaded = false, lastTick = performance.now();
  let activeSection = null, activeSince = 0, errorCount = 0, currentFigure = 'none';
  const sections = [], cards = [], videos = [], seenScroll = new Set();
  const sampledErrors = Math.random() < config.errorSampleRate;
  const cleanId = value => String(value || 'none').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
  const projectId = ['home', 'blog', 'privacy'].includes(pageId) ? 'none' : pageId;
  const position = el => el.closest('header') ? 'header' : el.closest('footer') ? 'footer' :
    el.closest('.hero,.research-hero,.pump-hero') ? 'hero' :
    cleanId(el.closest('section[id]')?.id || 'body');

  function emit(name, params = {}) {
    if (!consent || !Object.hasOwn(schema, name)) return;
    const payload = {page_id: pageId, project_id: projectId};
    for (const field of schema[name]) {
      const value = params[field];
      if (typeof value === 'number' && Number.isFinite(value)) payload[field] = Math.max(0, Math.round(value * 1000) / 1000);
      else if (typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) payload[field] = value;
    }
    if (debug) {
      if (records.length < 1000) records.push({name, params: payload});
    } else if (production && loaded) {
      window.gtag('event', name, payload);
    }
  }

  function readConsent() {
    try {
      const choice = JSON.parse(localStorage.getItem(key));
      return choice?.version === config.consentVersion && choice.expires > Date.now() ? choice.value : null;
    } catch { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(key, JSON.stringify({value, version: config.consentVersion,
      expires: Date.now() + config.consentDays * 86400000})); } catch { /* Choice still applies to this page. */ }
  }
  function clearAnalyticsCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
        document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax`;
      }
    }
  }
  function choose(value) {
    saveConsent(value);
    const wasActive = consent;
    consent = value === 'accepted';
    panel.hidden = true;
    settings.focus({preventScroll: true});
    if (consent) start();
    else {
      // Stop locally before notifying Google's already-loaded tag. Reload removes
      // its listeners; the persisted rejection prevents loading on the next page.
      activeSection = null;
      for (const v of videos) v.time = 0;
      for (const s of sections) s.time = 0;
      if (loaded && !debug) {
        window[`ga-disable-${config.measurementId}`] = true;
        window.gtag('consent', 'update', {analytics_storage: 'denied'});
      }
      clearAnalyticsCookies();
      if (wasActive && !debug) location.reload();
    }
  }

  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('./privacy.css', import.meta.url).href;
  document.head.append(css);
  const panel = document.createElement('aside');
  panel.className = 'analytics-choice'; panel.setAttribute('aria-label', 'Optional analytics');
  panel.innerHTML = '<p>May I use optional analytics to understand which projects and explanations are useful? Google Analytics measures visits, interactions and device information. No advertising or session recordings.</p><p><a href="/privacy.html">Privacy and measurement details</a></p><div class="choice-actions"><button type="button" data-choice="accepted">Accept analytics</button><button type="button" data-choice="rejected">Reject analytics</button></div>';
  if (debug) panel.querySelector('p').textContent += ' Local review mode: events stay in this browser tab and are not sent to Google.';
  panel.addEventListener('click', event => {
    const value = event.target.closest('[data-choice]')?.dataset.choice;
    if (value) choose(value);
  });
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'analytics-settings'; settings.textContent = 'Analytics preferences';
  settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
  (document.querySelector('footer') || document.body).append(settings);
  document.body.append(panel);
  window.portfolioAnalytics = Object.freeze({
    mode: debug ? 'local-debug' : 'production',
    get events() { return debug ? structuredClone(records) : []; },
    get consent() { return consent; },
  });

  function start() {
    if (started) return;
    started = true; lastTick = performance.now();
    if (!debug) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'});
      window.gtag('consent', 'update', {analytics_storage: 'granted'});
      window.gtag('js', new Date());
      const ref = safeReferrer();
      const cfg = {send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false, cookie_domain: location.hostname,
        cookie_expires: config.consentDays * 86400,
        page_location: config.productionOrigin + canonicalPath,
        page_title: pageId, page_referrer: ref};
      const query = new URLSearchParams(location.search);
      const allowed = {source: ['cv', 'linkedin', 'application'], medium: ['document', 'social', 'referral'],
        name: ['general', 'portfolio', 'engineering', 'cfd', 'thermal', 'automation']};
      for (const [field, values] of Object.entries(allowed)) {
        const value = query.get(field === 'name' ? 'utm_campaign' : 'utm_' + field);
        if (values.includes(value)) cfg['campaign_' + field] = value;
      }
      window.gtag('config', config.measurementId, cfg);
      const tag = document.createElement('script');
      tag.async = true; tag.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
      document.head.append(tag);
      loaded = true;
    }
    emit('page_view');
    if (projectId !== 'none') emit('project_view');
    instrument();
    import('./vendor/web-vitals.js').then(({onLCP, onINP, onCLS}) => {
      const report = metric => emit('web_vital', {metric: metric.name, value: metric.value, rating: metric.rating});
      onLCP(report); onINP(report); onCLS(report);
    }).catch(() => {}); // Content and navigation remain independent of tracking.
  }

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      if (url.origin === config.productionOrigin) {
        const route = url.pathname.replace(/\/index\.html$/, '/');
        return pages[route] ? url.origin + route : url.origin;
      }
      return url.origin; // Never referrer queries, usernames or path contents.
    } catch { return ''; }
  }

  function fraction(el) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return 0;
    const area = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) *
      Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    return area / (Math.min(r.height, innerHeight) * Math.min(r.width, innerWidth));
  }
  function flush() {
    for (const s of sections) if (s.seen && s.time >= 1000) {
      emit('section_time', {section_id: s.id, visible_seconds: s.time / 1000}); s.time = 0;
    }
    for (const v of videos) if (v.time >= 1000) {
      emit('video_time', {...v.params(), playback_mode: v.mode, visible_seconds: v.time / 1000}); v.time = 0;
    }
  }
  function tick() {
    const now = performance.now(), elapsed = Math.min(1000, now - lastTick);
    lastTick = now;
    if (!consent || document.visibilityState !== 'visible') {
      activeSection = null;
      cards.forEach(c => c.since = 0); videos.forEach(v => v.since = 0);
      return;
    }
    const ranked = sections.map(s => ({s, f: fraction(s.el)})).filter(x => x.f >= .25).sort((a,b) => b.f-a.f);
    const winner = ranked[0]?.s || null;
    if (winner !== activeSection) { activeSection = winner; activeSince = now; }
    if (winner) {
      winner.time += elapsed;
      if (!winner.seen && now - activeSince >= config.visibilityMs) {
        winner.seen = true; emit('section_view', {section_id: winner.id});
      }
    }
    for (const item of [...cards, ...videos]) {
      if (fraction(item.el) < .5) { item.since = 0; continue; }
      if (!item.since) item.since = now;
      if (!item.seen && now - item.since >= config.visibilityMs) {
        item.seen = true;
        if (item.params) emit('video_view', item.params());
        else emit('project_card_view', {card_id: item.id, card_position: item.position});
      }
      if (item.params && !item.el.paused && !item.el.seeking) item.time += elapsed;
    }
    const available = document.documentElement.scrollHeight - innerHeight;
    if (available > 0) {
      const depth = Math.min(100, 100 * scrollY / available);
      for (const p of [25, 50, 75, 90, 100]) if (!seenScroll.has(p) && depth >= (p === 100 ? 99.5 : p)) {
        seenScroll.add(p); emit('scroll_depth', {percent: p});
      }
    }
  }

  function instrument() {
    document.querySelectorAll('main > section').forEach((el, i) => sections.push({el,
      id: cleanId(el.id || (i === 0 ? 'hero' : `section-${i+1}`)), time: 0, seen: false}));
    document.querySelectorAll('.study-card,.hero-case,.projects .project-card').forEach((el,i) => {
      const destination = el.querySelector('a[href]')?.getAttribute('href') || '';
      cards.push({el, id: cleanId(el.id || (el.classList.contains('hero-case') ? 'featured-debubbler' : `industrial-${i+1}`)),
        position: i+1, seen: false, since: 0, destination});
    });
    document.querySelectorAll('video').forEach(setupVideo);
    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : event.target.parentElement;
      const a = target?.closest('a');
      if (a) {
        const at = position(a), raw = a.getAttribute('href') || '';
        const card = cards.find(c => c.el.contains(a));
        if (card && !/\.(mp4|webm)(?:$|\?)/i.test(raw)) emit('project_card_click', {card_id: card.id, card_position: card.position, link_position: at});
        let url; try { url = new URL(raw, location.href); } catch { return; }
        if (/Alberto_Brambila_CV\.pdf$/.test(url.pathname)) emit('cv_click', {cv_version: config.cvVersion, language: config.cvLanguage, link_position: at});
        else if (url.protocol === 'mailto:' || url.hostname === 'www.linkedin.com' || url.hostname === 'github.com') {
          emit('contact_click', {destination_type: url.protocol === 'mailto:' ? 'email' : url.hostname === 'www.linkedin.com' ? 'linkedin' : 'github', link_position: at});
        } else if (a.querySelector('img') || /\.(png|jpe?g|webp|svg)$/i.test(url.pathname)) {
          const fig = a.closest('figure'); currentFigure = cleanId(fig?.id || `figure-${[...document.querySelectorAll('figure')].indexOf(fig)+1}`);
          if (fig) emit('figure_open', {figure_id: currentFigure, link_position: at});
        } else if (/\.(pdf|csv|zip|py|ipynb|docx|pptx)$/i.test(url.pathname) || /doi\.org|mdpi\.com/.test(url.hostname)) {
          emit('document_click', {destination_type: /doi\.org|mdpi\.com/.test(url.hostname) ? 'publication' : 'download',
            file_type: cleanId(url.pathname.split('.').pop()).toLowerCase(), link_position: at});
        } else if (url.origin === location.origin) {
          emit('navigation_click', {section_id: cleanId(url.hash.slice(1) || 'none'), link_position: at,
            destination_type: url.hash && url.pathname === location.pathname ? 'anchor' : 'page'});
        }
      }
      const filter = target?.closest('[data-filter]');
      if (filter) emit('filter_change', {filter_id: cleanId(filter.dataset.filter)});
      if (target?.closest('.dialog-zoom')) emit('figure_zoom', {figure_id: currentFigure});
    });
    document.querySelectorAll('details').forEach((el,i) => el.addEventListener('toggle', () => emit('accordion_toggle', {
      section_id: cleanId(el.id || `${el.closest('section')?.id || 'details'}-${i+1}`), state: el.open ? 'open' : 'closed'})));
    document.addEventListener('visibilitychange', () => { tick(); if (document.hidden) flush(); });
    addEventListener('pagehide', () => { tick(); flush(); });
    addEventListener('pageshow', () => { lastTick = performance.now(); });
    setInterval(tick, 500); setInterval(flush, 30000);
    if (sampledErrors) {
      addEventListener('error', event => {
        if (++errorCount > config.maxErrors) return;
        emit('site_error', {error_type: event.target === window ? 'javascript' : 'resource',
          resource_type: event.target?.tagName ? cleanId(event.target.tagName.toLowerCase()) : 'script'});
      }, true);
      addEventListener('unhandledrejection', () => { if (++errorCount <= config.maxErrors) emit('site_error', {error_type: 'promise', resource_type: 'script'}); });
    }
  }

  function setupVideo(el, i) {
    const file = (el.querySelector('source')?.getAttribute('src') || el.getAttribute('src') || `video-${i+1}`).split('/').pop().replace(/\.[^.]+$/, '');
    const v = {el, id: cleanId(file), since: 0, seen: false, time: 0, mode: 'automatic',
      intent: -Infinity, started: false, progress: new Set(), previous: el.currentTime, loops: 0, seeking: false};
    v.params = () => ({video_id: v.id, location: position(el), duration: Number.isFinite(el.duration) ? el.duration : 0});
    videos.push(v);
    const recentIntent = () => performance.now() - v.intent < 1600;
    for (const kind of ['pointerdown', 'keydown']) el.addEventListener(kind, () => { v.intent = performance.now(); });
    el.addEventListener('play', () => {
      if (v.time >= 1000) { emit('video_time', {...v.params(), playback_mode: v.mode, visible_seconds: v.time/1000}); v.time = 0; }
      v.mode = recentIntent() ? 'manual' : 'automatic';
      emit(v.started ? 'video_resume' : 'video_start', {...v.params(), playback_mode: v.mode}); v.started = true;
    });
    // Autoplay may have started before consent; label it without a false manual start.
    if (!el.paused) { v.started = true; emit('video_start', {...v.params(), playback_mode: 'automatic'}); }
    el.addEventListener('pause', () => emit('video_pause', {...v.params(), playback_mode: recentIntent() ? 'manual' : 'automatic'}));
    const complete = () => {
      if (!v.progress.has(100)) { v.progress.add(100); emit('video_progress', {...v.params(), playback_mode: v.mode, percent: 100}); emit('video_complete', {...v.params(), playback_mode: v.mode}); }
    };
    el.addEventListener('seeking', () => { v.seeking = true; });
    el.addEventListener('seeked', () => {
      if (el.loop && v.previous > el.duration * .8 && el.currentTime < el.duration * .1 && !recentIntent()) {
        complete(); if (++v.loops <= 2) emit('video_repeat', {...v.params(), playback_mode: v.mode, loop_number: v.loops});
      }
      v.previous = el.currentTime; v.seeking = false;
    });
    el.addEventListener('timeupdate', () => {
      if (!consent || !el.duration || v.seeking) return;
      if (el.currentTime < v.previous - .5 && v.previous > el.duration * .8) {
        complete(); if (++v.loops <= 2) emit('video_repeat', {...v.params(), playback_mode: v.mode, loop_number: v.loops});
      }
      if (!el.paused && fraction(el) >= .5 && !document.hidden) {
        for (const p of [25,50,75]) if (!v.progress.has(p) && el.currentTime/el.duration*100 >= p && v.previous/el.duration*100 < p) {
          v.progress.add(p); emit('video_progress', {...v.params(), playback_mode: v.mode, percent: p});
        }
      }
      v.previous = el.currentTime;
    });
    el.addEventListener('ended', complete);
    el.addEventListener('ratechange', () => { if (recentIntent()) emit('video_rate', {...v.params(), rate: el.playbackRate}); });
    el.addEventListener('volumechange', () => { if (recentIntent()) emit('video_sound', {...v.params(), state: el.muted || el.volume === 0 ? 'muted' : 'audible'}); });
    el.addEventListener('error', () => emit('video_error', {...v.params(), error_code: el.error?.code || 0}));
    document.addEventListener('fullscreenchange', () => { if (document.fullscreenElement === el || document.fullscreenElement?.contains(el)) emit('video_fullscreen', v.params()); });
  }

  const saved = readConsent();
  panel.hidden = saved !== null;
  if (saved === 'accepted') { consent = true; start(); }
}
