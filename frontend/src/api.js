// src/api.js
const BASE_URL = "http://localhost:3000/api"; // ✅ /api prefix here

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // needed for cookies
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {}

  if (!res.ok) {
    const msg = (data && data.error) || text || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  register: ({ username, password }) =>
    request("/create", { method: "POST", body: { username, password } }),

  login: ({ username, password }) =>
    request("/login", { method: "POST", body: { username, password } }),

  logout: () =>
    request("/logout", { method: "POST" }),

  mePublic: () =>
    request("/public"),

  mePrivate: () =>
    request("/private"),
};
