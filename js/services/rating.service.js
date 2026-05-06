import { get, post, put, del } from '../core/api-client.js';

function validatePositiveId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${label} inválido.`);
  }
  return n;
}

export function getRatingBySeriesId(seriesId) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return get(`/series/${id}/rating`);
}

export function createRating(seriesId, payload) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return post(`/series/${id}/rating`, payload);
}

export function updateRating(seriesId, payload) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return put(`/series/${id}/rating`, payload);
}

export function deleteRating(seriesId) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return del(`/series/${id}/rating`);
}

export const ratingService = {
  getRatingBySeriesId,
  createRating,
  updateRating,
  deleteRating,
};
