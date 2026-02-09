const API_BASE_URL = "http://localhost:5000";

async function safeJson(response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Not JSON → read as text for debugging
  const text = await response.text();
  throw new Error(`Non-JSON response from server: ${text}`);
}

export const authService = {
  async signup({ email, phone, password, orgCode }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, password, orgCode }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      return { success: true, data };
    } catch (error) {
      console.error("SIGNUP ERROR:", error.message);
      return { success: false, error: error.message };
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
        }
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      return { success: true, data };
    } catch (error) {
      console.error("LOGIN ERROR:", error.message);
      return { success: false, error: error.message };
    }
  },

  logout() {
    localStorage.removeItem("authToken");
  },

  getToken() {
    return localStorage.getItem("authToken");
  },

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },
};
