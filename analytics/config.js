// The only production analytics configuration. No credentials belong here.
export const config = Object.freeze({
  enabled: true,
  measurementId: 'G-R8SZG8VFHS',
  productionOrigin: 'https://albertobraso7.github.io',
  consentVersion: 1,
  consentDays: 180,
  cvVersion: 'baseline-0e8fd696cbff-a4',
  cvLanguage: 'en',
  visibilityMs: 2000,
  errorSampleRate: 0.1,
  maxErrors: 3,
});

export const pages = Object.freeze({
  '/': 'home', '/electric-motor-cooling/': 'electric-motor-cooling', '/pump/': 'pump', '/debubbler/': 'debubbler',
  '/throttle-body/': 'throttle-body', '/aneurysm/': 'aneurysm',
  '/hydrogen-dilution/': 'hydrogen-dilution', '/reactor/': 'reactor', '/ventilation/': 'ventilation',
  '/privacy.html': 'privacy', '/blog.html': 'blog', '/projects/dog.html': 'dog',
  '/projects/f1.html': 'f1', '/projects/pump.html': 'pump-archive',
});

// Each event is restricted to these fields, plus common page_id/project_id.
export const schema = Object.freeze({
  page_view: [], project_view: [],
  navigation_click: ['section_id', 'link_position', 'destination_type'],
  section_view: ['section_id'], section_time: ['section_id', 'visible_seconds'],
  scroll_depth: ['percent'],
  project_card_view: ['card_id', 'card_position'],
  project_card_click: ['card_id', 'card_position', 'link_position'],
  cv_click: ['cv_version', 'language', 'link_position'],
  contact_click: ['destination_type', 'link_position'],
  document_click: ['destination_type', 'file_type', 'link_position'],
  figure_open: ['figure_id', 'link_position'],
  figure_zoom: ['figure_id'],
  accordion_toggle: ['section_id', 'state'],
  filter_change: ['filter_id'],
  video_view: ['video_id', 'location', 'duration'],
  video_start: ['video_id', 'location', 'duration', 'playback_mode'],
  video_resume: ['video_id', 'location', 'duration', 'playback_mode'],
  video_pause: ['video_id', 'location', 'duration', 'playback_mode'],
  video_progress: ['video_id', 'location', 'duration', 'playback_mode', 'percent'],
  video_complete: ['video_id', 'location', 'duration', 'playback_mode'],
  video_repeat: ['video_id', 'location', 'duration', 'playback_mode', 'loop_number'],
  video_time: ['video_id', 'location', 'duration', 'playback_mode', 'visible_seconds'],
  video_fullscreen: ['video_id', 'location', 'duration'],
  video_rate: ['video_id', 'location', 'duration', 'rate'],
  video_sound: ['video_id', 'location', 'duration', 'state'],
  video_error: ['video_id', 'location', 'duration', 'error_code'],
  web_vital: ['metric', 'value', 'rating'],
  site_error: ['error_type', 'resource_type'],
});
