import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const jsonServerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOcorrencias = () => jsonServerApi.get('/ocorrencias');

export default api;
