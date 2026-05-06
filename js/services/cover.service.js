import { upload } from '../core/api-client.js';

function validatePositiveId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${label} inválido.`);
  }
  return n;
}

export function buildCoverFormData(file) {
  const fd = new FormData();
  fd.append('file', file);
  return fd;
}

export function uploadCoverFormData(seriesId, formData) {
  const id = validatePositiveId(seriesId, 'seriesId');
  return upload(`/series/${id}/cover`, formData);
}

export function uploadCover(seriesId, file) {
  if (!file) throw new Error('Archivo de portada requerido.');
  const formData = buildCoverFormData(file);
  return uploadCoverFormData(seriesId, formData);
}

export const coverService = {
  buildCoverFormData,
  uploadCoverFormData,
  uploadCover,
};
