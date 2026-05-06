import { get } from '../core/api-client.js';

export function getDashboardStats() {
  return get('/dashboard/stats');
}

export const dashboardService = {
  getDashboardStats,
};
