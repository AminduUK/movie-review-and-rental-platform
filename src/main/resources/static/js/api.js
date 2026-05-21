/* ── CineNest API Helper ── */
const BASE = 'http://localhost:8080';

function authHeaders() {
  const token = localStorage.getItem('cinenest_token');
  return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };
}

function requireAuth() {
  if (!localStorage.getItem('cinenest_token')) { window.location.href = 'signin_page.html'; return false; }
  return true;
}

async function apiGet(path) {
  const res = await fetch(BASE + path, { headers: authHeaders() });
  if (res.status === 401) { window.location.href = 'signin_page.html'; throw new Error('Unauthorized'); }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(BASE + path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) { window.location.href = 'signin_page.html'; throw new Error('Unauthorized'); }
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(BASE + path, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) { window.location.href = 'signin_page.html'; throw new Error('Unauthorized'); }
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(BASE + path, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) { window.location.href = 'signin_page.html'; throw new Error('Unauthorized'); }
  return res.text();
}

/* ── Shared movie card builder (used by multiple pages) ── */
function movieGenre(m) {
  return (m.categories && m.categories.length) ? m.categories[0].name : (m.genre || '');
}