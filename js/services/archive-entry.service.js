import { get, post, put, del } from '../core/api-client.js';

function validatePositiveId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${label} inválido.`);
  }
  return n;
}

export function listArchiveEntries(params = {}) {
  return get('/series', params);
}

export function getArchiveEntryById(id) {
  const numericId = validatePositiveId(id, 'id de registro');
  return get(`/series/${numericId}`);
}

export function createArchiveEntry(payload) {
  return post('/series', payload);
}

export function updateArchiveEntry(id, payload) {
  const numericId = validatePositiveId(id, 'id de registro');
  return put(`/series/${numericId}`, payload);
}

export function deleteArchiveEntry(id) {
  const numericId = validatePositiveId(id, 'id de registro');
  return del(`/series/${numericId}`);
}

export const archiveEntryService = {
  listArchiveEntries,
  getArchiveEntryById,
  createArchiveEntry,
  updateArchiveEntry,
  deleteArchiveEntry,
};
