import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.43.201:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;