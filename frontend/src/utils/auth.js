export const getToken = () => localStorage.getItem("authToken");

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
};
