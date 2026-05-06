import { get } from '../core/api-client.js';

function validatePositiveId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${label} inválido.`);
  }
  return n;
}

export function listActivity(params = {}) {
  return get('/activity', params);
}

export function listActivityBySeriesId(seriesId, params = {}) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return get(`/series/${id}/activity`, params);
}

export const activityService = {
  listActivity,
  listActivityBySeriesId,
};
