import axios from 'axios';
                 
const rawBaseURL = import.meta.env.VITE_API_URL || 'https://artasylum.xyz/api/v1';
const normalizedBaseURL = rawBaseURL.replace(/\/$/, '');

const client = axios.create({
  baseURL: normalizedBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;