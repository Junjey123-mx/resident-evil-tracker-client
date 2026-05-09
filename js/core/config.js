export const API_BASE_URL =
  (typeof window !== 'undefined' && window.__RESIDENT_EVIL_API_BASE_URL__)
    ? window.__RESIDENT_EVIL_API_BASE_URL__
    : 'https://resident-evil-tracker-api-byct.vercel.app/';

export const CLIENT_ENV =
  (typeof window !== 'undefined' && window.__RESIDENT_EVIL_ENV__)
    ? window.__RESIDENT_EVIL_ENV__
    : 'development';

export const APP_ENV = CLIENT_ENV;

export const DEFAULT_PAGE_SIZE  = 8;
export const MAX_PAGE_SIZE      = 50;
export const DEFAULT_TIMEOUT_MS = 15000;

export const PAGE_ROUTES = {
  dashboard: 'index.html',
  games:     'games.html',
  detail:    'game-detail.html',
  create:    'create-game.html',
  edit:      'edit-game.html',
};

export const ROUTES = PAGE_ROUTES;
