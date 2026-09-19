const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5056/api";

async function request(path, { token, body, isFormData = false, method = "GET" } = {}) {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    throw new Error(raw || "Invalid server response");
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }

  return data;
}

export const api = {
  signup: (body) => request("/auth/signup", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  analyze: (token, body) =>
    request("/analyze", {
      method: "POST",
      token,
      body,
      isFormData: typeof FormData !== "undefined" && body instanceof FormData,
    }),
  dashboard: (token) => request("/dashboard", { token }),
  analytics: (token) => request("/analytics", { token }),
  activities: (token) => request("/activities", { token }),
  saveGoal: (token, body) => request("/goals", { method: "POST", token, body }),
  addRecommendationGoal: (token, body) => request("/goals", { method: "POST", token, body }),
  getGoals: (token) => request("/goals", { token }),
};
