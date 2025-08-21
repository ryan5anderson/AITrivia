const API_URL = process.env.REACT_APP_API_URL || window.location.origin + "/api";

export async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : res.text();
}
