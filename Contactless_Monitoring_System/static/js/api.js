/**
 * api.js — lightweight fetch wrapper that auto-attaches Bearer token
 */
const BASE = '';  // Flask serves on same origin

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
  return user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
}

async function request(method, url, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw { status: res.status, message: data?.message || 'Request failed', data };
  return data;
}

const api = {
  get:    (url)         => request('GET',    url),
  post:   (url, body)   => request('POST',   url, body),
  put:    (url, body)   => request('PUT',    url, body),
  delete: (url)         => request('DELETE', url),
};
