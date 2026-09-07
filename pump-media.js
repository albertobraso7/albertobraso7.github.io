/* Start visible clips quietly; respect reduced motion and a visitor's pause. */
(() => {
  const videos = [...document.querySelectorAll('video[data-autoplay]')];
  if (!videos.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = new Map(videos.map(video => [video, {
    visible: false, userPaused: false, automaticPause: false, requestingPlay: false
  }]));

  function stop(video) {
    const s = state.get(video);
    if (!video.paused) {
      s.automaticPause = true;
      video.pause();
    }
  }

  function sync(video) {
    const s = state.get(video);
    if (document.hidden || !s.visible) {
      stop(video);
      return;
    }
    if (reducedMotion.matches || s.userPaused || !video.paused || s.requestingPlay) return;
    video.muted = true;
    s.requestingPlay = true;
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.catch(() => {
        // Browser autoplay policies may require the native Play control.
      }).finally(() => { s.requestingPlay = false; });
    } else {
      s.requestingPlay = false;
    }
  }

  for (const video of videos) {
    video.muted = true;
    video.addEventListener('pause', () => {
      const s = state.get(video);
      if (s.automaticPause) s.automaticPause = false;
      else s.userPaused = true;
    });
    video.addEventListener('play', () => { state.get(video).userPaused = false; });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        state.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        sync(entry.target);
      }
    }, { threshold: [0, 0.2] });
    videos.forEach(video => observer.observe(video));
  } else {
    videos.forEach(video => { state.get(video).visible = true; sync(video); });
  }

  reducedMotion.addEventListener('change', () => {
    videos.forEach(video => reducedMotion.matches ? stop(video) : sync(video));
  });
  document.addEventListener('visibilitychange', () => videos.forEach(sync));
})();

