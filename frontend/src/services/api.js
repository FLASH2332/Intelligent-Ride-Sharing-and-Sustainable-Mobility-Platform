// Centralized API helper
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with JWT token
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Handle API responses and errors
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Handle 401 - Unauthorized (redirect to login)
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default apiRequest;
