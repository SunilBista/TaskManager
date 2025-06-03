export const checkMode = () => {
  const isLocalhost = window.location.hostname === "localhost";
  const BACKEND_URL = isLocalhost
    ? "http://localhost:3000"
    : import.meta.env.VITE_SOCKET_URL;
  return BACKEND_URL;
};
