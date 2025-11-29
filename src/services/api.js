import axios from 'axios';

// Alamat Backend Laravel Kamu
// const API_URL = 'http://127.0.0.1:8000/api';
const API_URL = 'https://ferry-backend-production-73a4.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor: Otomatis tempel Token kalau user sudah login
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;