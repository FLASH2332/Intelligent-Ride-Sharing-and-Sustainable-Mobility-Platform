const API_BASE_URL = 'http://localhost:5000/api/auth';
const OTP_BASE_URL = 'http://localhost:5000/api/otp';

export const authService = {
  async sendOTP(email) {
    try {
      const response = await fetch(`${OTP_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${OTP_BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async resendOTP(email) {
    try {
      const response = await fetch(`${OTP_BASE_URL}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.fullName,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
};
