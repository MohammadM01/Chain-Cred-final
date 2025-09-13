import axios from 'axios';

// Preserve auth session across PDF/QR modals and navigation
axios.defaults.withCredentials = true;

const envBase = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
const BASE_URL = envBase || 'http://localhost:3000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default client;
export { BASE_URL };
