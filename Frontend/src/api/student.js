import { apiGet } from './client';

export async function getJoinedClubs(token) {
  const res = await apiGet('/api/clubs/joined', token);
  return res.ok ? (res.data || []) : [];
}

export async function getFilteredAnnouncements(token) {
  const res = await apiGet('/api/announcements/student-filtered', token);
  return res.ok ? (res.data || []) : [];
}
